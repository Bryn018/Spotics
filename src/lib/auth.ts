import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { validateLastFmUser } from "@/lib/lastfm";

export const authOptions: NextAuthOptions = {
  debug: process.env.NEXTAUTH_DEBUG === "true",
  providers: [
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
      }
      return token;
    },
    async session({ session, token }) {
      session.error = token.error as string | undefined;
      session.provider = "lastfm";
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
      if (env.NEXTAUTH_DEBUG === "true") {
        console.log("[next-auth][debug]", code, metadata);
      }
    },
  },
  session: {
    strategy: "jwt",
  },
};
ext-auth][debug]", code, metadata);
      }
    },
  },
  session: {
    strategy: "jwt",
  },
};
