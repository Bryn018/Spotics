import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import SpotifyProvider from "next-auth/providers/spotify";
import { validateLastFmUser } from "@/lib/lastfm";

const scopes = [
  "user-read-email",
  "user-read-private",
  "user-top-read",
  "user-read-recently-played",
].join(" ");

export const authOptions: NextAuthOptions = {
  debug: process.env.NEXTAUTH_DEBUG === "true",
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID || "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: scopes,
        },
      },
    }),
    CredentialsProvider({
      id: "lastfm",
      name: "Last.fm",
      credentials: {
        username: { label: "Last.fm username", type: "text", placeholder: "your_lastfm_username" },
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim();
        if (!username) return null;

        try {
          const resolved = await validateLastFmUser(username);
          if (!resolved) return null;
          return {
            id: `lastfm:${resolved}`,
            name: resolved,
            email: null,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account?.provider === "lastfm") {
        token.provider = "lastfm";
        token.lastfmUsername = user?.name || undefined;
        token.accessToken = undefined;
        token.refreshToken = undefined;
        token.expiresAt = undefined;
        return token;
      }

      if (account?.provider === "spotify") {
        token.provider = "spotify";
      }

      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at ? account.expires_at * 1000 : undefined;
      }

      const expiresAt = typeof token.expiresAt === "number" ? token.expiresAt : 0;
      if (Date.now() < expiresAt - 60_000) return token;

      if (!token.refreshToken) return token;

      try {
        const params = new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: String(token.refreshToken),
        });

        const basic = Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
        ).toString("base64");

        const res = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            authorization: `Basic ${basic}`,
          },
          body: params,
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.error_description || "spotify_refresh_failed");

        token.accessToken = json.access_token;
        token.expiresAt = Date.now() + json.expires_in * 1000;
        token.refreshToken = json.refresh_token ?? token.refreshToken;
      } catch {
        token.error = "RefreshAccessTokenError";
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error as string | undefined;
      session.provider = token.provider as "spotify" | "lastfm" | undefined;
      session.lastfmUsername = token.lastfmUsername as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  logger: {
    error(code, metadata) {
      console.error("[next-auth][error]", code, metadata);
    },
    warn(code) {
      console.warn("[next-auth][warn]", code);
    },
    debug(code, metadata) {
      if (process.env.NEXTAUTH_DEBUG === "true") {
        console.log("[next-auth][debug]", code, metadata);
      }
    },
  },
  session: {
    strategy: "jwt",
  },
};
