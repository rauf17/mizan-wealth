import { describe, it, expect } from "vitest";
import { calculateZakat, isLunarYearPassed } from "../../lib/zakatEngine";
import { ZakatAsset, MetalRates } from "../../types";

describe("Calculation Edge Cases", () => {
  const mockRates: MetalRates = {
    goldPerGram: 70, // $70/g -> Nisab: 70 * 85 = $5,950
    silverPerGram: 1, // $1/g -> Nisab: 1 * 595 = $595
    lastUpdated: new Date().toISOString(),
  };

  describe("Zero Assets Case", () => {
    it("should calculate correctly with an empty assets list and zero liabilities", () => {
      const result = calculateZakat([], 0, mockRates, "silver");
      expect(result.totalAssets).toBe(0);
      expect(result.totalLiabilities).toBe(0);
      expect(result.netZakatable).toBe(0);
      expect(result.isNisabReached).toBe(false);
      expect(result.zakatDue).toBe(0);
    });

    it("should handle empty assets list even with positive liabilities", () => {
      const result = calculateZakat([], 1000, mockRates, "silver");
      expect(result.totalAssets).toBe(0);
      expect(result.totalLiabilities).toBe(1000);
      expect(result.netZakatable).toBe(0); // Cannot go below zero
      expect(result.isNisabReached).toBe(false);
      expect(result.zakatDue).toBe(0);
    });
  });

  describe("High Wealth Case", () => {
    it("should correctly compute 2.5% Zakat on extremely high wealth figures", () => {
      const megaAssets: ZakatAsset[] = [
        {
          id: "1",
          type: "cash",
          name: "Sovereign Fund",
          value: 100_000_000,
          zakatableAmount: 100_000_000,
          acquisitionDate: "2020-01-01",
          createdAt: "2020-01-01",
          hasPassedHawl: true,
        },
      ];
      
      const result = calculateZakat(megaAssets, 10_000_000, mockRates, "gold");
      // netZakatable = 100M - 10M = 90M.
      // Gold Nisab threshold = 85 * 70 = 5950.
      // Nisab is met. Zakat due = 90M * 0.025 = 2.25M
      expect(result.totalAssets).toBe(100_000_000);
      expect(result.totalLiabilities).toBe(10_000_000);
      expect(result.netZakatable).toBe(90_000_000);
      expect(result.isNisabReached).toBe(true);
      expect(result.zakatDue).toBe(2_250_000);
    });
  });

  describe("Negative Liabilities Case", () => {
    it("should sanitize negative liabilities value to zero and not artificially boost net assets", () => {
      const assets: ZakatAsset[] = [
        {
          id: "1",
          type: "cash",
          name: "Savings Account",
          value: 10_000,
          zakatableAmount: 10_000,
          acquisitionDate: "2020-01-01",
          createdAt: "2020-01-01",
          hasPassedHawl: true,
        },
      ];
      
      const result = calculateZakat(assets, -5000, mockRates, "silver");
      // Liabilities should be sanitized to 0. Net wealth = 10,000.
      // Nisab silver threshold = 595.
      // Zakat due = 10,000 * 0.025 = 250
      expect(result.totalLiabilities).toBe(0);
      expect(result.netZakatable).toBe(10_000);
      expect(result.zakatDue).toBe(250);
    });
  });

  describe("Hawl Boundaries and Overrides", () => {
    it("should check day-level boundaries for Hawl holding calculations", () => {
      const today = new Date("2026-06-19");
      
      // exactly 354 days ago (boundary met)
      const exactlyPassed = new Date("2025-06-30").toISOString(); 
      expect(isLunarYearPassed(exactlyPassed, today)).toBe(true);

      // exactly 353 days ago (not met)
      const notPassedYet = new Date("2025-07-01").toISOString();
      expect(isLunarYearPassed(notPassedYet, today)).toBe(false);
    });

    it("should prioritize user-defined hasPassedHawl overrides over date calculations", () => {
      const assets: ZakatAsset[] = [
        {
          id: "1",
          type: "cash",
          name: "Newly Acquired Asset (Override true)",
          value: 10_000,
          zakatableAmount: 10_000,
          acquisitionDate: new Date().toISOString(), // acquired today, but hasPassedHawl is overridden to true
          createdAt: new Date().toISOString(),
          hasPassedHawl: true,
        },
        {
          id: "2",
          type: "cash",
          name: "Old Asset (Override false)",
          value: 20_000,
          zakatableAmount: 20_000,
          acquisitionDate: "2020-01-01", // acquired years ago, but hasPassedHawl is overridden to false
          createdAt: "2020-01-01",
          hasPassedHawl: false,
        },
      ];

      const result = calculateZakat(assets, 0, mockRates, "silver");
      // Only asset 1 should be counted as zakatable because it has hasPassedHawl: true
      expect(result.totalAssets).toBe(30_000);
      expect(result.netZakatable).toBe(10_000);
      expect(result.zakatDue).toBe(250);
    });
  });
});
