import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { syncLastFmProfile } from "@/lib/sync";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.lastfmUsername) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accept = request.headers.get("accept") || "";
  const wantsJson = accept.includes("application/json");

  try {
    const result = await syncLastFmProfile(session.lastfmUsername, 200);

    if (wantsJson) {
      return NextResponse.json({ ok: true, ...result });
    }

    return NextResponse.redirect(new URL("/dashboard", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  } catch (error) {
    const body = { ok: false, error: error instanceof Error ? error.message : "Unknown sync error" };
    if (wantsJson) {
      return NextResponse.json(body, { status: 500 });
    }
    return NextResponse.redirect(new URL(`/dashboard?syncError=${encodeURIComponent(body.error)}`, process.env.NEXTAUTH_URL || "http://localhost:3000"));
  }
}
