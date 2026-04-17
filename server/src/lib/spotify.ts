import SpotifyWebApi from 'spotify-web-api-node';

// Create a global spotify client instance
export const spotify = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

export const scopes = [
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'user-library-read',
  'user-top-read',
].join(' ');

// Helper to create authorize URL (spotify doesn't have this built-in)
export function createAuthorizeURL(scopes: string, state: string, showDialog = false): string {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    state,
    scope: scopes,
    show_dialog: showDialog ? 'true' : 'false',
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Helper to exchange code for token
export async function authorizationCodeGrant(code: string): Promise<any> {
  const result = await spotify.authorizationCodeGrant(code);
  return result;
}
