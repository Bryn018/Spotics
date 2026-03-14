import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, service: "spotics", database: "reachable" });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        service: "spotics",
        database: "unreachable",
        error: error instanceof Error ? error.message : "Unknown healthcheck failure",
      },
      { status: 500 },
    );
  }
}
