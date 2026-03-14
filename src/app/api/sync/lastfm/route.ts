import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { syncLastFmProfile } from "@/lib/sync";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.lastfmUsername) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncLastFmProfile(session.lastfmUsername, 200);
    return NextResponse.redirect(new URL("/dashboard", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown sync error" },
      { status: 500 },
    );
  }
}
