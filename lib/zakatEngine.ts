import { ZakatAsset, ZakatCalculationResult, MetalRates } from "../types";

export const SHARIAH_CONSTANTS = {
  GOLD_NISAB_GRAMS: 87.48, // ~7.5 Tola
  SILVER_NISAB_GRAMS: 612.36, // ~52.5 Tola
  ZAKAT_RATE: 0.025, // 2.5%
};

/**
 * Checks if a lunar year (354 days) has passed since the acquisition date.
 */
export function isLunarYearPassed(acquisitionDate: string, currentDate = new Date()): boolean {
  if (!acquisitionDate) return false;
  try {
    const acq = new Date(acquisitionDate);
    if (isNaN(acq.getTime())) return false; // Safe fallback for invalid dates
    const diffTime = currentDate.getTime() - acq.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 354;
  } catch (e) {
    console.error("Failed to parse acquisitionDate:", acquisitionDate, e);
    return false;
  }
}

/**
 * Calculates the Nisab threshold based on gold/silver prices and selected standard.
 */
export function calculateNisabThreshold(
  rates: MetalRates,
  standard: "gold" | "silver" = "silver"
): number {
  // Ensure rates are valid positive numbers
  const goldRate = Math.max(0, rates?.goldPerGram || 0);
  const silverRate = Math.max(0, rates?.silverPerGram || 0);

  if (standard === "gold") {
    return SHARIAH_CONSTANTS.GOLD_NISAB_GRAMS * goldRate;
  }
  // Default to silver standard (standard recommendation for maximum charity benefit)
  return SHARIAH_CONSTANTS.SILVER_NISAB_GRAMS * silverRate;
}

/**
 * Perform the Zakat calculation.
 */
export function calculateZakat(
  assets: ZakatAsset[],
  totalLiabilities: number,
  rates: MetalRates,
  nisabStandard: "gold" | "silver" = "silver",
  calculationDate = new Date()
): ZakatCalculationResult {
  // Standardize liabilities (must be positive number)
  const sanitizedLiabilities = Math.max(0, totalLiabilities || 0);

  // Sum up all asset values and calculate eligible wealth based on Hawl rule
  let totalAssets = 0;
  let netZakatableAssets = 0;

  assets.forEach((asset) => {
    // Value must be non-negative
    const val = Math.max(0, asset.value || 0);
    totalAssets += val;

    // Check lunar year holding condition (Hawl)
    const passedHawl =
      asset.hasPassedHawl !== undefined
        ? asset.hasPassedHawl
        : isLunarYearPassed(asset.acquisitionDate, calculationDate);

    if (passedHawl) {
      netZakatableAssets += Math.max(0, asset.zakatableAmount || 0);
    }
  });

  // Subtract liabilities from eligible zakatable assets
  const netZakatable = Math.max(0, netZakatableAssets - sanitizedLiabilities);

  // Determine Nisab threshold
  const nisabThreshold = calculateNisabThreshold(rates, nisabStandard);

  const isNisabReached = netZakatable >= nisabThreshold;
  const zakatDue = isNisabReached ? netZakatable * SHARIAH_CONSTANTS.ZAKAT_RATE : 0;

  return {
    totalAssets,
    totalLiabilities: sanitizedLiabilities,
    netZakatable,
    nisabThreshold,
    zakatDue: Number(zakatDue.toFixed(2)),
    rate: SHARIAH_CONSTANTS.ZAKAT_RATE,
    isNisabReached,
    calculationDate: calculationDate.toISOString(),
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
    const val = Math.max(0, asset.value || 0);
    const zak = Math.max(0, asset.zakatableAmount || 0);
    summary[asset.type].value += val;
    summary[asset.type].zakatable += zak;
  });

  return summary;
}
