# Spotics Last.fm Listener

Client-side Spotify listening tracker built on Last.fm. All data stays in the browser via IndexedDB, and it works with free Spotify accounts.

## How It Works
- Uses the Last.fm Web API to fetch recent tracks.
- Stores listening history locally using IndexedDB.
- Supports PKCE-free auth via `auth.getSession` for Last.fm.
- Deduplicates tracks by composite key: `played_at + track_id`.

## Setup
1. Create a Last.fm API account at https://www.last.fm/api/account/create
2. Add redirect/whitelist URIs in the Last.fm app settings if needed.
3. Update the client/secret/username in the app config (or use environment variables).
4. Serve the `spotics-listener` folder with any static HTTP server.
5. Visit `/spotics-listener/` in your browser and follow the auth flow.

## Deployment
This is the Last.fm-based `spotics-listener` branch, deployed as the listener interface at `https://spotics.insights.autos/spotics-listener/`. The main Spotics app remains on the `feature/fullstack-ready` branch.

## Auth Flow
- User visits the app and clicks **Connect Last.fm**.
- Browser redirects through Last.fm's token auth.
- After callback, `auth.getSession` is exchanged and the session key is saved in IndexedDB.
- The UI then polls for recent tracks and stores them.

## Notes
- IndexedDB stores session keys/history only for the current user's browser.
- Last.fm API rate limits may apply; this app polls at a configured interval.
- If you host this behind GitHub Pages or another static host, make sure the redirect URI matches what Last.fm expects.

## Status
- Last.fm listener reconfigured for the Post-Spotify-client-id config.
- Session flow uses `auth.getSession` from `js/lastfm.js`.
- Repository state: `feature/lastfm-listener` with `spotics-listener/` files applied.

## TODO
- Fill in config values for your Last.fm application.
- Test auth callback end-to-end.
- Optionally replace/rotate the Spotify client ID references in this folder.
