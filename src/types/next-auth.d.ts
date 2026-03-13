import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    error?: string;
    provider?: "lastfm";
    lastfmUsername?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    error?: string;
    provider?: "lastfm";
    lastfmUsername?: string;
  }
}
