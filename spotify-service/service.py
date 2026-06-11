"""
Spotify Service — Real-time Spotify data via SpotAPI
Exposes a local REST API + WebSocket for the Spotics frontend.

Usage:
  python service.py

Environment variables:
  SPOTIFY_USERNAME  — Spotify username/email
  SPOTIFY_PASSWORD  — Spotify password
  SPOTICS_API_KEY   — Spotics scrobble API key (for forwarding scrobbles)
  PORT              — Port to listen on (default: 3001)
"""

import os
import json
import time
import threading
import logging
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit

from spotapi import Login, PlayerStatus, EventManager, Public, Song, User
from spotapi.exceptions import BaseClientError

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s %(name)s: %(message)s')
logger = logging.getLogger('spotify-service')

app = Flask(__name__)
CORS(app, origins=["*"])  # Allow all origins for local development
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# --- Global State ---
spotify_login = None
player_status = None
event_manager = None
song_client = None
user_client = None

# Cache
_cache = {}
_cache_lock = threading.Lock()
CACHE_TTL = {
    'top_artists': 300,
    'top_tracks': 300,
    'recently_played': 10,
    'now_playing': 2,
    'player_state': 2,
}

SPOTICS_API_KEY = os.environ.get('SPOTICS_API_KEY', '')
_last_scrobbled_track = None
_last_scrobble_time = 0

# Track previous state for change detection
_prev_track_id = None
_prev_is_playing = None


def get_cached(key: str):
    with _cache_lock:
        if key in _cache:
            data, expires_at = _cache[key]
            if time.time() < expires_at:
                return data
            del _cache[key]
    return None


def set_cached(key: str, data, ttl: int = 60):
    with _cache_lock:
        _cache[key] = (data, time.time() + ttl)


def invalidate_cache(key: str):
    with _cache_lock:
        _cache.pop(key, None)


def invalidate_all_caches():
    with _cache_lock:
        _cache.clear()


# --- Data Transformers ---

def transform_track(spotify_track) -> dict:
    if not spotify_track:
        return None

    # Handle both dict and object formats
    if isinstance(spotify_track, dict):
        track_data = spotify_track.get('track', spotify_track)
        album = track_data.get('album', {})
        images = album.get('images', [])
        artists = [{'name': a.get('name', 'Unknown'), 'id': a.get('id', '')}
                   for a in track_data.get('artists', [])]
        duration_ms = track_data.get('duration_ms', 0)
        track_id = track_data.get('id', '')
        name = track_data.get('name', 'Unknown Track')
        external_urls = track_data.get('external_urls', {})
        album_name = album.get('name', 'Unknown Album')
    else:
        # Object format from SpotAPI
        track_data = getattr(spotify_track, 'track', spotify_track) or spotify_track
        album = getattr(track_data, 'album', {}) or {}
        images = getattr(album, 'images', []) or []
        artists = [{'name': getattr(a, 'name', 'Unknown'), 'id': getattr(a, 'id', '')}
                   for a in (getattr(track_data, 'artists', []) or [])]
        duration_ms = getattr(track_data, 'duration_ms', 0)
        track_id = getattr(track_data, 'id', '')
        name = getattr(track_data, 'name', 'Unknown Track')
        external_urls = getattr(track_data, 'external_urls', {}) or {}
        album_name = getattr(album, 'name', 'Unknown Album')

    return {
        'id': track_id,
        'name': name,
        'artists': artists,
        'album': {
            'name': album_name,
            'images': [{'url': img.get('url', '') if isinstance(img, dict) else getattr(img, 'url', ''),
                        'width': img.get('width', 0) if isinstance(img, dict) else getattr(img, 'width', 0),
                        'height': img.get('height', 0) if isinstance(img, dict) else getattr(img, 'height', 0)}
                       for img in (images or [])]
        },
        'duration_ms': duration_ms,
        'external_urls': external_urls if isinstance(external_urls, dict) else {},
    }


def get_now_playing_data() -> dict:
    """Get current now-playing state."""
    global player_status
    if not player_status:
        return {'is_playing': False, 'track': None, 'progress_ms': 0, 'timestamp': int(time.time() * 1000)}

    try:
        state = player_status.state
        track = None
        progress_ms = 0
        is_playing = False

        if state:
            state_track = getattr(state, 'track', None)
            if state_track:
                track = transform_track(state_track)
            progress_ms = getattr(state, 'position', 0) or 0
            is_paused = getattr(state, 'is_paused', True)
            is_playing = not is_paused

        return {
            'is_playing': is_playing,
            'progress_ms': progress_ms,
            'track': track,
            'timestamp': int(time.time() * 1000)
        }
    except Exception as e:
        logger.error(f"Error getting now playing: {e}")
        return {'is_playing': False, 'track': None, 'progress_ms': 0, 'timestamp': int(time.time() * 1000)}


def get_recently_played_data(limit: int = 20) -> dict:
    """Get recently played tracks from player state."""
    if not player_status:
        return {'items': []}

    try:
        state = player_status.state
        items = []

        if state:
            prev_tracks = getattr(state, 'prev_tracks', []) or []
            for item in prev_tracks[:limit]:
                track_data = transform_track(item)
                if track_data:
                    items.append({
                        'track': track_data,
                        'played_at': datetime.utcnow().isoformat() + 'Z',
                    })

        return {'items': items}
    except Exception as e:
        logger.error(f"Error getting recently played: {e}")
        return {'items': []}


# --- Spotify Connection ---

def connect_spotify():
    global spotify_login, player_status, event_manager, song_client, user_client
    global _prev_track_id, _prev_is_playing

    username = os.environ.get('SPOTIFY_USERNAME')
    password = os.environ.get('SPOTIFY_PASSWORD')

    if not username or not password:
        logger.warning("SPOTIFY_USERNAME or SPOTIFY_PASSWORD not set.")
        return False

    try:
        logger.info("Connecting to Spotify via SpotAPI...")
        spotify_login = Login(username, password)

        if not spotify_login.logged_in:
            logger.error("Failed to log in to Spotify")
            return False

        player_status = PlayerStatus(spotify_login)
        song_client = Song(client=spotify_login.client)
        user_client = User(spotify_login)

        # Set up event manager for real-time WebSocket push
        event_manager = EventManager(spotify_login)

        @event_manager.subscribe("PLAYER_STATE_CHANGED")
        def on_player_change(*args, **kwargs):
            logger.info("Player state changed")
            invalidate_all_caches()
            # Push update to all connected WebSocket clients
            data = get_now_playing_data()
            socketio.emit('now_playing_update', data)
            recently = get_recently_played_data()
            socketio.emit('recently_played_update', recently)

        @event_manager.subscribe("TRACK_CHANGED")
        def on_track_change(*args, **kwargs):
            logger.info("Track changed!")
            invalidate_all_caches()
            data = get_now_playing_data()
            socketio.emit('track_changed', data)

        # Initialize previous state
        initial_state = get_now_playing_data()
        _prev_track_id = initial_state.get('track', {}).get('id') if initial_state.get('track') else None
        _prev_is_playing = initial_state.get('is_playing')

        logger.info("Connected to Spotify successfully via SpotAPI")
        return True

    except Exception as e:
        logger.error(f"Failed to connect to Spotify: {e}")
        return False


# --- Polling-based change detection (fallback if WebSocket events don't fire) ---

def poll_for_changes():
    """Background thread that polls for track changes and pushes via WebSocket."""
    global _prev_track_id, _prev_is_playing

    while True:
        try:
            if player_status and spotify_login and spotify_login.logged_in:
                current = get_now_playing_data()
                current_track_id = current.get('track', {}).get('id') if current.get('track') else None
                current_is_playing = current.get('is_playing')

                # Detect changes
                track_changed = current_track_id != _prev_track_id
                play_state_changed = current_is_playing != _prev_is_playing

                if track_changed or play_state_changed:
                    _prev_track_id = current_track_id
                    _prev_is_playing = current_is_playing

                    invalidate_all_caches()

                    # Push to WebSocket clients
                    socketio.emit('now_playing_update', current)

                    if track_changed:
                        recently = get_recently_played_data()
                        socketio.emit('recently_played_update', recently)
                        logger.info(f"Track change detected: {current_track_id}")

        except Exception as e:
            logger.error(f"Poll error: {e}")

        time.sleep(2)  # Poll every 2 seconds


# --- REST API Endpoints ---

@app.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'spotify_connected': spotify_login is not None and spotify_login.logged_in,
        'service': 'spotapi',
        'timestamp': datetime.utcnow().isoformat()
    })


@app.route('/now-playing')
def now_playing():
    cached = get_cached('now_playing')
    if cached:
        return jsonify(cached)

    result = get_now_playing_data()
    set_cached('now_playing', result, CACHE_TTL['now_playing'])
    return jsonify(result)


@app.route('/recently-played')
def recently_played():
    limit = request.args.get('limit', 20, type=int)
    limit = min(limit, 50)

    cached = get_cached('recently_played')
    if cached:
        return jsonify(cached)

    result = get_recently_played_data(limit)
    set_cached('recently_played', result, CACHE_TTL['recently_played'])
    return jsonify(result)


@app.route('/player-state')
def player_state():
    cached = get_cached('player_state')
    if cached:
        return jsonify(cached)

    if not player_status:
        return jsonify({'error': 'Not connected'}), 503

    try:
        state = player_status.state
        devices = player_status.device_ids

        np_data = get_now_playing_data()

        result = {
            'is_playing': np_data['is_playing'],
            'progress_ms': np_data['progress_ms'],
            'shuffle': getattr(state, 'shuffle', False) if state else False,
            'repeat_mode': getattr(state, 'repeat_mode', 0) if state else 0,
            'volume': getattr(state, 'volume', 0) if state else 0,
            'device': {
                'id': getattr(devices, 'active_device_id', '') if devices else '',
                'name': '',
                'type': '',
            },
            'track': np_data['track'],
            'next_tracks': [transform_track(t) for t in (getattr(state, 'next_tracks', []) or [])[:5]],
            'prev_tracks': [transform_track(t) for t in (getattr(state, 'prev_tracks', []) or [])[:5]],
        }

        set_cached('player_state', result, CACHE_TTL['player_state'])
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error getting player state: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/top-artists')
def top_artists():
    time_range = request.args.get('time_range', 'medium_term')
    limit = request.args.get('limit', 25, type=int)
    limit = min(limit, 50)

    cache_key = f'top_artists_{time_range}_{limit}'
    cached = get_cached(cache_key)
    if cached:
        return jsonify(cached)

    if not song_client:
        return jsonify({'items': []}), 503

    try:
        # Note: SpotAPI doesn't have a direct top-artists endpoint
        # This would need to come from the Spotify Web API or scraping
        items = []
        result = {'items': items, 'total': len(items)}
        set_cached(cache_key, result, CACHE_TTL['top_artists'])
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error getting top artists: {e}")
        return jsonify({'items': [], 'error': str(e)}), 500


@app.route('/top-tracks')
def top_tracks():
    time_range = request.args.get('time_range', 'medium_term')
    limit = request.args.get('limit', 25, type=int)
    limit = min(limit, 50)

    cache_key = f'top_tracks_{time_range}_{limit}'
    cached = get_cached(cache_key)
    if cached:
        return jsonify(cached)

    if not song_client:
        return jsonify({'items': []}), 503

    try:
        items = []
        result = {'items': items, 'total': len(items)}
        set_cached(cache_key, result, CACHE_TTL['top_tracks'])
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error getting top tracks: {e}")
        return jsonify({'items': [], 'error': str(e)}), 500


@app.route('/search')
def search():
    query = request.args.get('q', '')
    search_type = request.args.get('type', 'track')
    limit = request.args.get('limit', 10, type=int)

    if not query:
        return jsonify({'error': 'Query required'}), 400

    try:
        if search_type == 'track':
            results = list(Public.song_search(query))
        elif search_type == 'artist':
            results = list(Public.artist_search(query))
        elif search_type == 'album':
            results = list(Public.album_info(query))
        elif search_type == 'playlist':
            results = list(Public.playlist_info(query))
        else:
            return jsonify({'error': f'Unknown type: {search_type}'}), 400

        return jsonify({'results': results[:limit]})
    except Exception as e:
        logger.error(f"Search error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/user')
def user_info():
    if not user_client:
        return jsonify({'error': 'Not connected'}), 503

    try:
        info = user_client.get_user_info()
        plan = user_client.get_plan_info()
        return jsonify({
            'profile': info.get('profile', {}),
            'plan': plan.get('plan', {}),
            'has_premium': user_client.has_premium,
            'username': user_client.username,
        })
    except Exception as e:
        logger.error(f"Error getting user info: {e}")
        return jsonify({'error': str(e)}), 500


# --- WebSocket Events ---

@socketio.on('connect')
def handle_connect():
    logger.info("Client connected via WebSocket")
    # Send current state immediately
    emit('now_playing_update', get_now_playing_data())
    emit('recently_played_update', get_recently_played_data())


@socketio.on('disconnect')
def handle_disconnect():
    logger.info("Client disconnected")


# --- Main ---

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3001))

    connected = connect_spotify()
    if not connected:
        logger.warning("Starting without Spotify connection.")

    # Start background polling thread
    poll_thread = threading.Thread(target=poll_for_changes, daemon=True)
    poll_thread.start()

    logger.info(f"Starting SpotAPI Service on port {port}")
    socketio.run(app, host='0.0.0.0', port=port, debug=False, allow_unsafe_werkzeug=True)
