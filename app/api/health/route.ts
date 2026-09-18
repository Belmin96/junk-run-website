import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "junk-run-website",
    mode: process.env.JUNKRUN_API_BASE_URL ? "backend-configured" : "demo",
    timestamp: new Date().toISOString()
  });
}