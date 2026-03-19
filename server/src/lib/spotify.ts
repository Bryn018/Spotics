import SpotifyWebApi from 'spotify-web-api-node';
import { env } from '../config/env';

export const spotify = new SpotifyWebApi({
  clientId: env.spotifyClientId,
  clientSecret: env.spotifyClientSecret,
  redirectUri: env.spotifyRedirectUri,
});

export const scopes = [
  'user-read-private',
  'user-read-email',
  'user-read-playback-position',
  'user-top-read',
  'user-read-recently-played',
  'user-read-currently-playing',
];
