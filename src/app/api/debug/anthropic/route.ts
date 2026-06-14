import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY ?? "";
  const exists = key.length > 0;

  return NextResponse.json({
    exists,
    length: key.length,
    first12: exists ? key.slice(0, 12) : null,
    last6: exists ? key.slice(-6) : null,
  });
}
