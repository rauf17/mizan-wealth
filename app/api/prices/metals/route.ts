import { NextResponse } from "next/server";

// Fallback rates if external calls fail or API key is missing
const FALLBACK_METALS_DATA = {
  goldPerGram: 75.50,
  silverPerGram: 0.95,
  source: "Baseline Market Fallback (Local)",
  lastUpdated: new Date().toISOString()
};

export async function GET() {
  const apiKey = process.env.METAL_PRICE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      ...FALLBACK_METALS_DATA,
      reason: "API key is missing (set METAL_PRICE_API_KEY in environment)"
    });
  }

  try {
    // goldapi.io provides rates in USD for XAU (Gold) and XAG (Silver)
    // Results are returned per troy ounce. 1 troy ounce = 31.1035 grams.
    const goldResponse = await fetch("https://www.goldapi.io/api/XAU/USD", {
      headers: { "x-access-token": apiKey },
      next: { revalidate: 3600 } // Cache results for 1 hour
    });
    
    const silverResponse = await fetch("https://www.goldapi.io/api/XAG/USD", {
      headers: { "x-access-token": apiKey },
      next: { revalidate: 3600 }
    });

    if (!goldResponse.ok || !silverResponse.ok) {
      throw new Error(`GoldAPI returned non-OK status: Gold=${goldResponse.status}, Silver=${silverResponse.status}`);
    }

    const goldData = await goldResponse.json();
    const silverData = await silverResponse.json();

    const goldPerGram = goldData.price / 31.1035;
    const silverPerGram = silverData.price / 31.1035;

    return NextResponse.json({
      goldPerGram: Number(goldPerGram.toFixed(2)),
      silverPerGram: Number(silverPerGram.toFixed(2)),
      source: "GoldAPI.io Feed",
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Failed to fetch from GoldAPI, falling back:", error);
    return NextResponse.json({
      ...FALLBACK_METALS_DATA,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
