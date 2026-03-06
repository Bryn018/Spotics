import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

function mask(value?: string) {
  if (!value) return null;
  if (value.length <= 8) return "***";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, message: "Debug endpoint disabled in production." }, { status: 404 });
  }

  const clientIp = getClientIp(req.headers);
  const limiter = consumeRateLimit(`debug:${clientIp}`, 20, 60_000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many requests." },
      { status: 429, headers: { "retry-after": String(limiter.retryAfterSeconds) } },
    );
  }

  if (process.env.NEXTAUTH_DEBUG !== "true") {
    return NextResponse.json(
      { ok: false, message: "Enable NEXTAUTH_DEBUG=true to use this debug endpoint." },
      { status: 403 },
    );
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const nextAuthUrl = process.env.NEXTAUTH_URL;

  const callbackUrl = nextAuthUrl
    ? `${nextAuthUrl.replace(/\/$/, "")}/api/auth/callback/spotify`
    : null;

  let tokenProbe: {
    ok: boolean;
    status?: number;
    body?: unknown;
    error?: string;
  } = { ok: false };

  try {
    if (!clientId || !clientSecret) {
      tokenProbe = { ok: false, error: "Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET" };
    } else {
      const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          authorization: `Basic ${basic}`,
        },
        body: new URLSearchParams({ grant_type: "client_credentials" }),
      });

      let body: unknown = null;
      try {
        body = await res.json();
      } catch {
        body = await res.text();
      }

      tokenProbe = {
        ok: res.ok,
        status: res.status,
        body,
      };
    }
  } catch (e) {
    tokenProbe = {
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }

  return NextResponse.json({
    ok: true,
    checks: {
      hasClientId: Boolean(clientId),
      hasClientSecret: Boolean(clientSecret),
      hasNextAuthUrl: Boolean(nextAuthUrl),
      nextAuthUrl,
      expectedSpotifyCallback: callbackUrl,
      clientIdMasked: mask(clientId),
      clientSecretMasked: mask(clientSecret),
      trustHost: process.env.AUTH_TRUST_HOST,
    },
    tokenProbe,
  });
}
