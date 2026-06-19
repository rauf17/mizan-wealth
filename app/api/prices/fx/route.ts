import { NextResponse } from "next/server";

const FALLBACK_FX_DATA = {
  base: "USD",
  rates: {
    CAD: 1.37,
    EUR: 0.93,
    GBP: 0.79,
    AED: 3.67,
    SAR: 3.75,
    INR: 83.50,
    PKR: 278.50,
  },
  source: "Baseline Market Fallback (Local)",
  lastUpdated: new Date().toISOString()
};

export async function GET() {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 14400 } // Cache rates for 4 hours
    });

    if (!response.ok) {
      throw new Error(`ExchangeRates API returned status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      base: "USD",
      rates: {
        CAD: data.rates.CAD || FALLBACK_FX_DATA.rates.CAD,
        EUR: data.rates.EUR || FALLBACK_FX_DATA.rates.EUR,
        GBP: data.rates.GBP || FALLBACK_FX_DATA.rates.GBP,
        AED: data.rates.AED || FALLBACK_FX_DATA.rates.AED,
        SAR: data.rates.SAR || FALLBACK_FX_DATA.rates.SAR,
        INR: data.rates.INR || FALLBACK_FX_DATA.rates.INR,
        PKR: data.rates.PKR || FALLBACK_FX_DATA.rates.PKR,
      },
      source: "ExchangeRates Open API Feed",
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Exchange rates fetch failed, using fallback:", error);
    return NextResponse.json(FALLBACK_FX_DATA);
  }
}
