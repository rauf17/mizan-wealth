"use client";

/**
 * Client-safe helper to check if window and localStorage are available.
 */
const isClient = (): boolean => typeof window !== "undefined" && window.localStorage !== undefined;

/**
 * Storage keys used across the app
 */
export const STORAGE_KEYS = {
  ZAKAT_ASSETS: "mizan_zakat_assets",
  ZAKAT_LIABILITIES: "mizan_zakat_liabilities",
  PORTFOLIO_STOCKS: "mizan_portfolio_stocks",
  METAL_RATES: "mizan_metal_rates",
  CALCULATION_HISTORY: "mizan_calculation_history",
  SETTINGS: "mizan_settings",
};

/**
 * Get an item from localStorage
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isClient()) return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Set an item in localStorage
 */
export function setStorageItem<T>(key: string, value: T): void {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

/**
 * Remove an item from localStorage
 */
export function removeStorageItem(key: string): void {
  if (!isClient()) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

/**
 * Clear all localStorage keys starting with the app prefix
 */
export function clearAppStorage(): void {
  if (!isClient()) return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith("mizan_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  } catch (error) {
    console.error("Error clearing application storage:", error);
  }
}
