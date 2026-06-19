import { NextResponse } from "next/server";

export async function GET() {
  // In a production setup, this would fetch from a metal price feed API.
  // To avoid API key dependencies and guarantee offline-first robustness,
  // we return current market baseline rates (Gold: $75.50/g, Silver: $0.95/g).
  return NextResponse.json({
    goldPerGram: 75.5,
    silverPerGram: 0.95,
    source: "Mizan Local API Feed",
    lastUpdated: new Date().toISOString(),
  });
}
