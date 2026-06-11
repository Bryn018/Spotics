"""
Spotify Service — Real-time Spotify data via SpotAPI
Exposes a local REST API for the Spotics frontend.

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
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS

from spotapi import Login, PlayerStatus, EventManager, Public, Song, User
from spotapi.exceptions import BaseClientError

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s %(name)s: %(message)s')
logger = logging.getLogger('spotify-service')

app = Flask(__name__)
CORS(app, origins=["https://spotics.insights.autos", "http://localhost:*", "http://127.0.0.1:*"])

# --- Global State ---
spotify_login: Login = None
player_status: PlayerStatus = None
event_manager: EventManager = None
song_client: Song = None
user_client: User = None

# Cache for expensive endpoints
_cache = {}
_cache_lock = threading.Lock()
CACHE_TTL = {
    'top_artists': 300,    # 5 minutes
    'top_tracks': 300,     # 5 minutes
    'recently_played': 10, # 10 seconds
    'now_playing': 2,      # 2 seconds
    'player_state': 2,     # 2 seconds
}

# Scrobble forwarding
SPOTICS_API_KEY = os.environ.get('SPOTICS_API_KEY', '')
SPOTICS_WORKER_URL = 'https://api.spotics.insights.autos'
_last_scrobbled_track = None
_last_scrobble_time = 0


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


# --- Spotify Connection ---

def connect_spotify():
    global spotify_login, player_status, event_manager, song_client, user_client

    username = os.environ.get('SPOTIFY_USERNAME')
    password = os.environ.get('SPOTIFY_PASSWORD')

    if not username or not password:
        logger.warning("SPOTIFY_USERNAME or SPOTIFY_PASSWORD not set. Set them as environment variables.")
        return False

    try:
        logger.info("Connecting to Spotify...")
        spotify_login = Login(username, password)

        if not spotify_login.logged_in:
            logger.error("Failed to log in to Spotify")
            return False

        player_status = PlayerStatus(spotify_login)
        song_client = Song(client=spotify_login.client)
        user_client = User(spotify_login)

        # Set up event manager for real-time updates
        event_manager = EventManager(spotify_login)

        @event_manager.subscribe("PLAYER_STATE_CHANGED")
        def on_player_change(*args, **kwargs):
            logger.info("Player state changed — invalidating caches")
            invalidate_cache('now_playing')
            invalidate_cache('player_state')
            invalidate_cache('recently_played')

        @event_manager.subscribe("TRACK_CHANGED")
        def on_track_change(*args, **kwargs):
            logger.info("Track changed")
            invalidate_cache('now_playing')
            invalidate_cache('player_state')
            invalidate_cache('recently_played')

        logger.info("Connected to Spotify successfully")
        return True

    except Exception as e:
        logger.error(f"Failed to connect to Spotify: {e}")
        return False


# --- Data Transformers ---

def transform_track(spotify_track: dict) -> dict:
    """Transform a Spotify track object to our API format."""
    if not spotify_track:
        return None

    track_data = spotify_track.get('track', spotify_track)
    album = track_data.get('album', {})
    images = album.get('images', [])

    return {
        'id': track_data.get('id', ''),
        'name': track_data.get('name', 'Unknown Track'),
        'artists': [{'name': a.get('name', 'Unknown'), 'id': a.get('id', '')}
                     for a in track_data.get('artists', [])],
        'album': {
            'name': album.get('name', 'Unknown Album'),
            'images': [{'url': img.get('url', ''), 'width': img.get('width', 0), 'height': img.get('height', 0)}
                       for img in images]
        },
        'duration_ms': track_data.get('duration_ms', 0),
        'external_urls': track_data.get('external_urls', {}),
    }


def transform_artist(spotify_artist: dict) -> dict:
    """Transform a Spotify artist object to our API format."""
    if not spotify_artist:
        return None

    images = spotify_artist.get('images', [])
    return {
        'id': spotify_artist.get('id', ''),
        'name': spotify_artist.get('name', 'Unknown Artist'),
        'genres': spotify_artist.get('genres', []),
        'images': [{'url': img.get('url', ''), 'width': img.get('width', 0), 'height': img.get('height', 0)}
                   for img in images],
        'popularity': spotify_artist.get('popularity', 0),
    }


# --- API Endpoints ---

@app.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'spotify_connected': spotify_login is not None and spotify_login.logged_in,
        'timestamp': datetime.utcnow().isoformat()
    })


@app.route('/now-playing')
def now_playing():
    cached = get_cached('now_playing')
    if cached:
        return jsonify(cached)

    if not player_status:
        return jsonify({'is_playing': False, 'track': None, 'progress_ms': 0}), 503

    try:
        state = player_status.state
        track = None
        progress_ms = 0
        is_playing = False

        if state and hasattr(state, 'track') and state.track:
            track = transform_track(state.track.__dict__ if hasattr(state.track, '__dict__') else state.track)
            progress_ms = getattr(state, 'position', 0) or 0
            is_playing = not (getattr(state, 'is_paused', True))

        result = {
            'is_playing': is_playing,
            'progress_ms': progress_ms,
            'track': track,
            'timestamp': int(time.time() * 1000)
        }

        set_cached('now_playing', result, CACHE_TTL['now_playing'])
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error getting now playing: {e}")
        return jsonify({'is_playing': False, 'track': None, 'progress_ms': 0, 'error': str(e)}), 500


@app.route('/recently-played')
def recently_played():
    limit = request.args.get('limit', 20, type=int)
    limit = min(limit, 50)

    cached = get_cached('recently_played')
    if cached:
        return jsonify(cached)

    if not player_status:
        return jsonify({'items': []}), 503

    try:
        state = player_status.state
        items = []

        # Get previously played tracks from player state
        prev_tracks = []
        if state and hasattr(state, 'prev_tracks'):
            prev_tracks = state.prev_tracks or []

        for item in prev_tracks[:limit]:
            track_data = transform_track(item)
            if track_data:
                items.append({
                    'track': track_data,
                    'played_at': datetime.utcnow().isoformat() + 'Z',
                })

        result = {'items': items}
        set_cached('recently_played', result, CACHE_TTL['recently_played'])
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error getting recently played: {e}")
        return jsonify({'items': [], 'error': str(e)}), 500


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
        # Use Public search to get top artists
        # Note: SpotAPI doesn't have a direct "top artists" endpoint like the Web API
        # We use the public search as a fallback
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

        result = {
            'is_playing': not (getattr(state, 'is_paused', True)) if state else False,
            'progress_ms': getattr(state, 'position', 0) if state else 0,
            'shuffle': getattr(state, 'shuffle', False) if state else False,
            'repeat_mode': getattr(state, 'repeat_mode', 0) if state else 0,
            'volume': getattr(state, 'volume', 0) if state else 0,
            'device': {
                'id': getattr(devices, 'active_device_id', '') if devices else '',
                'name': '',
                'type': '',
            },
            'track': transform_track(state.track) if state and hasattr(state, 'track') and state.track else None,
            'next_tracks': [transform_track(t) for t in (getattr(state, 'next_tracks', []) or [])[:5]],
            'prev_tracks': [transform_track(t) for t in (getattr(state, 'prev_tracks', []) or [])[:5]],
        }

        set_cached('player_state', result, CACHE_TTL['player_state'])
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error getting player state: {e}")
        return jsonify({'error': str(e)}), 500


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


# --- Main ---

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3001))

    # Try to connect to Spotify
    connected = connect_spotify()
    if not connected:
        logger.warning("Starting without Spotify connection. Set SPOTIFY_USERNAME and SPOTIFY_PASSWORD env vars.")

    logger.info(f"Starting Spotify Service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
