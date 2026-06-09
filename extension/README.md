# Spotics Scrobbler — Browser Extension

A Chrome/Firefox browser extension that tracks what you play on Spotify Web Player and sends it to your Spotics dashboard in real time.

## How It Works

1. The content script observes the Spotify Web Player DOM for track changes
2. When a new track starts playing, it extracts the title, artist, and album art
3. After the track plays for >50% of its duration or 4 minutes (standard scrobble rules), it sends a scrobble event to the background script
4. The background script forwards the scrobble to the Spotics API server
5. Your Spotics dashboard displays real-time analytics

## Installation (Development)

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select this `extension/` folder
5. Pin the extension to your toolbar

## Configuration

1. Click the extension icon in your toolbar
2. Click "Generate API Key" to create a Spotics account
3. The API key is automatically saved
4. Open Spotify Web Player and start playing music
5. Visit [spotics.insights.autos/#/live](https://spotics.insights.autos/#/live) to see your live analytics

## File Structure

```
extension/
├── manifest.json          # Extension manifest (MV3)
├── icons/                 # Extension icons
├── popup/
│   ├── popup.html         # Extension popup UI
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup logic (connect/disconnect, stats)
├── scripts/
│   ├── content.js         # Content script (DOM observer on Spotify)
│   └── background.js      # Service worker (API communication)
└── styles/
    └── content.css        # Injected status indicator styles
```

## Privacy

- The extension only runs on `open.spotify.com`
- It reads publicly visible DOM elements (track title, artist, album art)
- It does NOT access Spotify's private APIs or intercept network requests
- Scrobbles are sent only to your Spotics server (api.spotics.insights.autos)
- No data is shared with any third party

## License

MIT — Same license as the Spotics project.
