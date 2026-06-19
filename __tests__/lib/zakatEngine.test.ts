import { describe, it, expect } from "vitest";
import {
  isLunarYearPassed,
  calculateNisabThreshold,
  calculateZakat,
  getAssetSummary,
} from "../../lib/zakatEngine";
import { ZakatAsset, MetalRates } from "../../types";

describe("Zakat Calculation Engine", () => {
  describe("isLunarYearPassed", () => {
    it("should return true if 354 days or more have passed", () => {
      const today = new Date("2026-06-19");
      // 355 days ago
      const acqDate = new Date("2025-06-29").toISOString();
      expect(isLunarYearPassed(acqDate, today)).toBe(true);
    });

    it("should return false if less than 354 days have passed", () => {
      const today = new Date("2026-06-19");
      // 353 days ago
      const acqDate = new Date("2025-07-01").toISOString();
      expect(isLunarYearPassed(acqDate, today)).toBe(false);
    });

    it("should handle invalid dates gracefully", () => {
      expect(isLunarYearPassed("invalid-date")).toBe(false);
      expect(isLunarYearPassed("")).toBe(false);
    });
  });

  describe("calculateNisabThreshold", () => {
    const mockRates: MetalRates = {
      goldPerGram: 70, // $70/g
      silverPerGram: 1, // $1/g
      lastUpdated: new Date().toISOString(),
    };

    it("should calculate gold Nisab threshold (85g * goldRate)", () => {
      const goldThreshold = calculateNisabThreshold(mockRates, "gold");
      expect(goldThreshold).toBe(85 * 70); // 5950
    });

    it("should calculate silver Nisab threshold (595g * silverRate)", () => {
      const silverThreshold = calculateNisabThreshold(mockRates, "silver");
      expect(silverThreshold).toBe(595 * 1); // 595
    });

    it("should default to silver standard", () => {
      const defaultThreshold = calculateNisabThreshold(mockRates);
      expect(defaultThreshold).toBe(595 * 1);
    });

    it("should handle 0 or negative rates gracefully", () => {
      const zeroRates = { goldPerGram: -5, silverPerGram: 0, lastUpdated: "" };
      expect(calculateNisabThreshold(zeroRates, "gold")).toBe(0);
      expect(calculateNisabThreshold(zeroRates, "silver")).toBe(0);
    });
  });

  describe("calculateZakat", () => {
    const mockRates: MetalRates = {
      goldPerGram: 70,
      silverPerGram: 1,
      lastUpdated: new Date().toISOString(),
    };

    const mockAssets: ZakatAsset[] = [
      {
        id: "1",
        type: "cash",
        name: "Savings",
        value: 1000,
        zakatableAmount: 1000,
        acquisitionDate: "2025-01-01",
        createdAt: "2025-01-01",
        hasPassedHawl: true,
      },
      {
        id: "2",
        type: "stock",
        name: "Tech Stock",
        value: 2000,
        zakatableAmount: 2000,
        acquisitionDate: "2025-01-01",
        createdAt: "2025-01-01",
        hasPassedHawl: true,
      },
    ];

    it("should calculate Zakat accurately at 2.5% when Nisab is met", () => {
      const result = calculateZakat(mockAssets, 500, mockRates, "silver");
      // total assets = 3000. total liabilities = 500. net eligible assets = 3000 - 500 = 2500.
      // Nisab threshold = 595 * 1 = 595. Net eligible assets (2500) >= 595, so Nisab reached.
      // Zakat due = 2500 * 0.025 = 62.5
      expect(result.totalAssets).toBe(3000);
      expect(result.totalLiabilities).toBe(500);
      expect(result.netZakatable).toBe(2500);
      expect(result.isNisabReached).toBe(true);
      expect(result.zakatDue).toBe(62.5);
    });

    it("should not demand Zakat when Nisab is not met", () => {
      const smallAssets: ZakatAsset[] = [
        {
          id: "1",
          type: "cash",
          name: "Loose Cash",
          value: 300,
          zakatableAmount: 300,
          acquisitionDate: "2025-01-01",
          createdAt: "2025-01-01",
          hasPassedHawl: true,
        },
      ];
      const result = calculateZakat(smallAssets, 0, mockRates, "silver");
      // netZakatable = 300. Nisab threshold = 595.
      // Nisab is not reached, so Zakat due should be 0.
      expect(result.netZakatable).toBe(300);
      expect(result.isNisabReached).toBe(false);
      expect(result.zakatDue).toBe(0);
    });

    it("should respect the Hawl holding rule", () => {
      const assetsMixedHawl: ZakatAsset[] = [
        {
          id: "1",
          type: "cash",
          name: "Old Savings",
          value: 1000,
          zakatableAmount: 1000,
          acquisitionDate: "2020-01-01",
          createdAt: "2020-01-01",
        },
        {
          id: "2",
          type: "cash",
          name: "New Cash Gift",
          value: 2000,
          zakatableAmount: 2000,
          acquisitionDate: new Date().toISOString(), // Today, hawl not passed
          createdAt: new Date().toISOString(),
        },
      ];
      // Since no hasPassedHawl override is provided, we compute it dynamically.
      // Zakat should only apply to asset 1.
      const result = calculateZakat(assetsMixedHawl, 0, mockRates, "silver");
      expect(result.totalAssets).toBe(3000);
      expect(result.netZakatable).toBe(1000); // Only the first asset passed hawl
      expect(result.isNisabReached).toBe(true);
      expect(result.zakatDue).toBe(25); // 1000 * 0.025
    });
  });

  describe("getAssetSummary", () => {
    it("should group and summarize assets by their categories", () => {
      const assets: ZakatAsset[] = [
        {
          id: "1",
          type: "cash",
          name: "Bank A",
          value: 500,
          zakatableAmount: 500,
          acquisitionDate: "",
          createdAt: "",
        },
        {
          id: "2",
          type: "cash",
          name: "Cash in Hand",
          value: 300,
          zakatableAmount: 300,
          acquisitionDate: "",
          createdAt: "",
        },
        {
          id: "3",
          type: "stock",
          name: "Shariah ETF",
          value: 2000,
          zakatableAmount: 1500,
          acquisitionDate: "",
          createdAt: "",
        },
      ];

      const summary = getAssetSummary(assets);
      expect(summary.cash).toEqual({ value: 800, zakatable: 800 });
      expect(summary.stock).toEqual({ value: 2000, zakatable: 1500 });
    });
  });
});
