import { calculateNisabThreshold, calculateZakat, isLunarYearPassed } from "../lib/zakatEngine";
import { ZakatAsset, MetalRates } from "../types";

// Mock metal rates: Gold = $75/gram, Silver = $1.00/gram
const mockRates: MetalRates = {
  goldPerGram: 75,
  silverPerGram: 1,
  lastUpdated: new Date().toISOString(),
};

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`\x1b[31m❌ Assertion Failed: ${message}\x1b[0m`);
    process.exit(1);
  }
}

function runTests() {
  console.log("Starting Zakat Calculation Engine Tests...\n");

  // ==========================================
  // Test 1: isLunarYearPassed helper
  // ==========================================
  console.log("Running Test 1: Lunar Year (Hawl) calculation...");
  const today = new Date("2026-06-19");
  
  // Held for 355 days (more than lunar year of 354 days)
  const datePassed = "2025-06-29";
  assert(isLunarYearPassed(datePassed, today) === true, "Should pass Hawl (355 days difference)");

  // Held for 350 days (less than lunar year)
  const dateNotPassed = "2025-07-04";
  assert(isLunarYearPassed(dateNotPassed, today) === false, "Should not pass Hawl (350 days difference)");

  // Edge cases
  assert(isLunarYearPassed("", today) === false, "Empty date should return false");
  assert(isLunarYearPassed("invalid-date", today) === false, "Invalid date should return false");
  console.log("\x1b[32m✓ Test 1 Passed!\x1b[0m\n");

  // ==========================================
  // Test 2: Nisab Threshold Calculations
  // ==========================================
  console.log("Running Test 2: Nisab threshold calculations...");
  // Gold Nisab: 85g * $75 = 6375
  const goldNisab = calculateNisabThreshold(mockRates, "gold");
  assert(goldNisab === 6375, `Gold Nisab should be 6375, got ${goldNisab}`);

  // Silver Nisab: 595g * $1 = 595
  const silverNisab = calculateNisabThreshold(mockRates, "silver");
  assert(silverNisab === 595, `Silver Nisab should be 595, got ${silverNisab}`);

  // Zero rates edge case
  const zeroNisab = calculateNisabThreshold({ goldPerGram: 0, silverPerGram: 0, lastUpdated: "" }, "gold");
  assert(zeroNisab === 0, "Zero metal price should yield zero Nisab");
  console.log("\x1b[32m✓ Test 2 Passed!\x1b[0m\n");

  // ==========================================
  // Test 3: Zakat calculation (Below Nisab)
  // ==========================================
  console.log("Running Test 3: Zakat calculation below Nisab...");
  const lowAssets: ZakatAsset[] = [
    {
      id: "1",
      type: "cash",
      name: "Cash in Hand",
      value: 500,
      zakatableAmount: 500,
      acquisitionDate: "2025-01-01",
      createdAt: "",
    },
  ];
  // Net wealth = 500. Silver Nisab = 595. Should not be reached.
  const resultLow = calculateZakat(lowAssets, 0, mockRates, "silver", today);
  assert(resultLow.isNisabReached === false, "Nisab should not be reached for $500 assets");
  assert(resultLow.zakatDue === 0, `Zakat due should be 0, got ${resultLow.zakatDue}`);
  console.log("\x1b[32m✓ Test 3 Passed!\x1b[0m\n");

  // ==========================================
  // Test 4: Zakat calculation (Above Nisab + Hawl Rule)
  // ==========================================
  console.log("Running Test 4: Zakat calculation with Hawl eligibility...");
  const mixAssets: ZakatAsset[] = [
    {
      id: "1",
      type: "cash",
      name: "Old Savings",
      value: 1000,
      zakatableAmount: 1000,
      acquisitionDate: "2025-01-01", // Passed Hawl
      createdAt: "",
    },
    {
      id: "2",
      type: "gold",
      name: "New Gold Coin",
      value: 800,
      zakatableAmount: 800,
      acquisitionDate: "2026-06-01", // Held only 18 days, failed Hawl
      createdAt: "",
    },
  ];

  // Net eligible assets should only be $1000 (gold coin excluded).
  // Total liabilities = $200. Net wealth = $800.
  // Silver Nisab = 595. reached.
  // Zakat due: 800 * 0.025 = 20.
  const resultMix = calculateZakat(mixAssets, 200, mockRates, "silver", today);
  assert(resultMix.totalAssets === 1800, `Total assets should be 1800, got ${resultMix.totalAssets}`);
  assert(resultMix.totalLiabilities === 200, "Liabilities should be 200");
  assert(resultMix.netZakatable === 800, `Net zakatable should be 800, got ${resultMix.netZakatable}`);
  assert(resultMix.isNisabReached === true, "Nisab should be reached");
  assert(resultMix.zakatDue === 20, `Zakat due should be 20.00, got ${resultMix.zakatDue}`);
  console.log("\x1b[32m✓ Test 4 Passed!\x1b[0m\n");

  // ==========================================
  // Test 5: Edge cases (Negative values)
  // ==========================================
  console.log("Running Test 5: Zakat engine edge cases...");
  const badAssets: ZakatAsset[] = [
    {
      id: "1",
      type: "cash",
      name: "Negative cash?",
      value: -500, // Should be normalized to 0
      zakatableAmount: -500, // Should be normalized to 0
      acquisitionDate: "2025-01-01",
      createdAt: "",
    },
  ];
  const resultBad = calculateZakat(badAssets, -100, mockRates, "silver", today);
  assert(resultBad.totalAssets === 0, "Negative assets should normalize to 0");
  assert(resultBad.totalLiabilities === 0, "Negative liabilities should normalize to 0");
  assert(resultBad.netZakatable === 0, "Net zakatable wealth should be 0");
  assert(resultBad.zakatDue === 0, "Zakat due should be 0");
  console.log("\x1b[32m✓ Test 5 Passed!\x1b[0m\n");

  console.log("\x1b[32m🎉 All Zakat Calculation Engine Tests Passed Successfully!\x1b[0m");
}

runTests();
