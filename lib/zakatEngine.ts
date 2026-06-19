import { ZakatAsset, ZakatCalculationResult, MetalRates } from "../types";

export const SHARIAH_CONSTANTS = {
  GOLD_NISAB_GRAMS: 85,
  SILVER_NISAB_GRAMS: 595,
  ZAKAT_RATE: 0.025, // 2.5%
};

/**
 * Calculates the Nisab threshold based on gold/silver prices and selected standard.
 */
export function calculateNisabThreshold(
  rates: MetalRates,
  standard: "gold" | "silver" = "silver"
): number {
  if (standard === "gold") {
    return SHARIAH_CONSTANTS.GOLD_NISAB_GRAMS * rates.goldPerGram;
  }
  // Default to silver standard (standard recommendation for maximum charity benefit)
  return SHARIAH_CONSTANTS.SILVER_NISAB_GRAMS * rates.silverPerGram;
}

/**
 * Perform the Zakat calculation.
 */
export function calculateZakat(
  assets: ZakatAsset[],
  totalLiabilities: number,
  rates: MetalRates,
  nisabStandard: "gold" | "silver" = "silver"
): ZakatCalculationResult {
  // Sum up all zakatable values
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const netZakatableAssets = assets.reduce((sum, asset) => sum + asset.zakatableAmount, 0);

  // Subtract liabilities from zakatable assets (some jurisprudence allows subtracting short term debt)
  const netZakatable = Math.max(0, netZakatableAssets - totalLiabilities);

  // Determine Nisab threshold
  const nisabThreshold = calculateNisabThreshold(rates, nisabStandard);

  const isNisabReached = netZakatable >= nisabThreshold;
  const zakatDue = isNisabReached ? netZakatable * SHARIAH_CONSTANTS.ZAKAT_RATE : 0;

  return {
    totalAssets,
    totalLiabilities,
    netZakatable,
    nisabThreshold,
    zakatDue,
    rate: SHARIAH_CONSTANTS.ZAKAT_RATE,
    isNisabReached,
    calculationDate: new Date().toISOString(),
  };
}

/**
 * Categorize assets and calculate summaries.
 */
export function getAssetSummary(assets: ZakatAsset[]) {
  const summary: Record<string, { value: number; zakatable: number }> = {};

  assets.forEach((asset) => {
    if (!summary[asset.type]) {
      summary[asset.type] = { value: 0, zakatable: 0 };
    }
    summary[asset.type].value += asset.value;
    summary[asset.type].zakatable += asset.zakatableAmount;
  });

  return summary;
}
