import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveData,
  getData,
  updateData,
  clearData,
  clearAppStorage,
  STORAGE_KEYS,
} from "../../lib/storage";

describe("Storage Abstraction Layer", () => {
  beforeEach(() => {
    // Clear localStorage mockup before each test run
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("saveData and getData", () => {
    it("should successfully save and retrieve complex object structures", () => {
      const complexObj = { name: "Cash Assets", total: 15000, active: true };
      saveData("mizan_test_key", complexObj);

      const retrieved = getData<typeof complexObj>("mizan_test_key");
      expect(retrieved).toEqual(complexObj);
    });

    it("should return the default value when key does not exist", () => {
      const defaultValue = [{ id: "1", val: 50 }];
      const retrieved = getData("mizan_non_existent", defaultValue);
      expect(retrieved).toEqual(defaultValue);
    });

    it("should return null if key does not exist and no default value is provided", () => {
      const retrieved = getData("mizan_non_existent");
      expect(retrieved).toBeNull();
    });

    it("should return default value and catch JSON parsing failures gracefully", () => {
      // Set corrupt string value directly to storage
      window.localStorage.setItem("mizan_corrupt_key", "invalid-json{");

      const consoleWarnSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const retrieved = getData("mizan_corrupt_key", { fallback: true });
      
      expect(retrieved).toEqual({ fallback: true });
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe("updateData", () => {
    it("should perform partial updates and merge values correctly", () => {
      const initialSetting = {
        nisabStandard: "silver" as "gold" | "silver",
        currency: "USD",
        userProfile: "Standard",
      };
      saveData("mizan_settings_test", initialSetting);

      // Perform a partial update modifying standard and currency
      updateData<typeof initialSetting>("mizan_settings_test", {
        nisabStandard: "gold",
        currency: "EUR",
      });

      const updated = getData<typeof initialSetting>("mizan_settings_test");
      expect(updated).toEqual({
        nisabStandard: "gold",
        currency: "EUR",
        userProfile: "Standard",
      });
    });

    it("should initialize a new object state if key does not exist yet", () => {
      const partial = { premium: true, count: 5 };
      updateData("mizan_new_key", partial);

      const retrieved = getData("mizan_new_key");
      expect(retrieved).toEqual(partial);
    });
  });

  describe("clearData", () => {
    it("should delete targeted storage keys from localStorage", () => {
      saveData("mizan_temp_key", "active");
      expect(getData("mizan_temp_key")).toBe("active");

      clearData("mizan_temp_key");
      expect(getData("mizan_temp_key")).toBeNull();
    });
  });

  describe("clearAppStorage", () => {
    it("should remove all keys with the mizan_ prefix and keep unrelated keys untouched", () => {
      saveData(STORAGE_KEYS.ZAKAT_ASSETS, [{ value: 5000 }]);
      saveData(STORAGE_KEYS.SETTINGS, { currency: "USD" });
      
      // Set an unrelated key not managed by the app
      window.localStorage.setItem("unrelated_key", "donotdelete");

      clearAppStorage();

      expect(getData(STORAGE_KEYS.ZAKAT_ASSETS)).toBeNull();
      expect(getData(STORAGE_KEYS.SETTINGS)).toBeNull();
      expect(window.localStorage.getItem("unrelated_key")).toBe("donotdelete");
    });
  });
});
