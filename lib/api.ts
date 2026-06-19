import { MetalRates, StockPurityInfo } from "../types";

// Default/fallback metal prices per gram (in USD)
// Gold: ~ $75/gram, Silver: ~ $0.95/gram
export const DEFAULT_METAL_RATES: MetalRates = {
  goldPerGram: 75.5,
  silverPerGram: 0.95,
  lastUpdated: new Date().toISOString(),
};

/**
 * Fetch precious metal prices from a public API or fallback to default values.
 */
export async function fetchMetalRates(): Promise<MetalRates> {
  try {
    // We can fetch from a public endpoint or route, e.g., our internal API route
    // which delegates to external metal price endpoints.
    const res = await fetch("/api/prices/metals", {
      next: { revalidate: 3600 }, // cache for 1 hour
    });
    if (!res.ok) throw new Error("Failed to fetch rates from server route");
    const data = await res.json();
    return {
      goldPerGram: data.goldPerGram || DEFAULT_METAL_RATES.goldPerGram,
      silverPerGram: data.silverPerGram || DEFAULT_METAL_RATES.silverPerGram,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.warn("Using fallback metal rates due to fetch error:", error);
    return {
      ...DEFAULT_METAL_RATES,
      lastUpdated: new Date().toISOString(),
    };
  }
}

// Local mock database of screened stocks for demonstration and offline screening
const MOCK_STOCK_SCREENER_DB: Record<string, Omit<StockPurityInfo, "ticker">> = {
  AAPL: {
    name: "Apple Inc.",
    compliant: true,
    debtRatio: 0.12,
    cashRatio: 0.08,
    interestIncomeRatio: 0.015,
    purificationRate: 0.0012, // 0.12% of dividend to purify
    lastUpdated: new Date().toISOString(),
  },
  MSFT: {
    name: "Microsoft Corp.",
    compliant: true,
    debtRatio: 0.09,
    cashRatio: 0.14,
    interestIncomeRatio: 0.008,
    purificationRate: 0.0006,
    lastUpdated: new Date().toISOString(),
  },
  TSLA: {
    name: "Tesla Inc.",
    compliant: true,
    debtRatio: 0.04,
    cashRatio: 0.18,
    interestIncomeRatio: 0.011,
    purificationRate: 0.0,
    lastUpdated: new Date().toISOString(),
  },
  AMZN: {
    name: "Amazon.com Inc.",
    compliant: true,
    debtRatio: 0.15,
    cashRatio: 0.11,
    interestIncomeRatio: 0.005,
    purificationRate: 0.0,
    lastUpdated: new Date().toISOString(),
  },
  NVDA: {
    name: "NVIDIA Corp.",
    compliant: true,
    debtRatio: 0.03,
    cashRatio: 0.22,
    interestIncomeRatio: 0.003,
    purificationRate: 0.0002,
    lastUpdated: new Date().toISOString(),
  },
  JPM: {
    name: "JPMorgan Chase & Co.",
    compliant: false, // Bank, core business is interest-based (Ribawi)
    debtRatio: 0.85,
    cashRatio: 0.05,
    interestIncomeRatio: 0.72,
    purificationRate: 1.0, // Non-purifiable (entire business is non-compliant)
    lastUpdated: new Date().toISOString(),
  },
  GS: {
    name: "Goldman Sachs Group Inc.",
    compliant: false, // Bank
    debtRatio: 0.88,
    cashRatio: 0.04,
    interestIncomeRatio: 0.68,
    purificationRate: 1.0,
    lastUpdated: new Date().toISOString(),
  },
  KO: {
    name: "Coca-Cola Co.",
    compliant: true,
    debtRatio: 0.28,
    cashRatio: 0.09,
    interestIncomeRatio: 0.018,
    purificationRate: 0.0025,
    lastUpdated: new Date().toISOString(),
  },
};

/**
 * Screen a stock symbol for compliance.
 */
export async function screenStock(ticker: string): Promise<StockPurityInfo> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const uppercaseTicker = ticker.toUpperCase().trim();
  const dbMatch = MOCK_STOCK_SCREENER_DB[uppercaseTicker];

  if (dbMatch) {
    return {
      ticker: uppercaseTicker,
      ...dbMatch,
    };
  }

  // Generate dynamic (random but stable) compliance status for non-db stocks
  // so the user can test any ticker
  const charSum = uppercaseTicker.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const isCompliant = charSum % 3 !== 0; // ~66% of tickers will be compliant

  const debtRatio = Number((0.05 + (charSum % 30) / 100).toFixed(4));
  const cashRatio = Number((0.02 + (charSum % 25) / 100).toFixed(4));
  const interestIncomeRatio = Number(((charSum % 8) / 100).toFixed(4));

  // A stock is non-compliant if interest income is > 5% or debt ratio is > 33%
  const finalCompliant = isCompliant && interestIncomeRatio < 0.05 && debtRatio < 0.33;

  return {
    ticker: uppercaseTicker,
    name: `${uppercaseTicker} Corporation`,
    compliant: finalCompliant,
    debtRatio,
    cashRatio,
    interestIncomeRatio,
    purificationRate: finalCompliant ? Number(((charSum % 15) / 1000).toFixed(4)) : 1.0,
    lastUpdated: new Date().toISOString(),
  };
}
