"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "../../components/DashboardShell";
import { getData, saveData, clearAppStorage, STORAGE_KEYS } from "../../lib/storage";
import { DEFAULT_METAL_RATES } from "../../lib/api";
import { MetalRates } from "../../types";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);

  // Settings states
  const [nisabStandard, setNisabStandard] = useState<"gold" | "silver">("silver");
  const [useLiveRates, setUseLiveRates] = useState(true);
  const [goldPrice, setGoldPrice] = useState("75.50");
  const [silverPrice, setSilverPrice] = useState("0.95");
  
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Load local settings
    const settings = getData(STORAGE_KEYS.SETTINGS, {
      nisabStandard: "silver" as "gold" | "silver",
      useLiveRates: true,
    });
    setNisabStandard(settings.nisabStandard);
    setUseLiveRates(settings.useLiveRates);

    // Load override metal rates if set
    const savedRates = getData<MetalRates | null>(STORAGE_KEYS.METAL_RATES, null);
    if (savedRates) {
      setGoldPrice(savedRates.goldPerGram.toString());
      setSilverPrice(savedRates.silverPerGram.toString());
    } else {
      setGoldPrice(DEFAULT_METAL_RATES.goldPerGram.toString());
      setSilverPrice(DEFAULT_METAL_RATES.silverPerGram.toString());
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(Number(goldPrice)) || isNaN(Number(silverPrice))) return;

    // Save global settings
    saveData(STORAGE_KEYS.SETTINGS, {
      nisabStandard,
      useLiveRates,
    });

    // Save metal rate overrides if not live rates
    if (!useLiveRates) {
      const customRates: MetalRates = {
        goldPerGram: Math.max(0, Number(goldPrice)),
        silverPerGram: Math.max(0, Number(silverPrice)),
        lastUpdated: new Date().toISOString(),
      };
      saveData(STORAGE_KEYS.METAL_RATES, customRates);
    } else {
      // If live rates, delete override key so API fetch handles it
      saveData(STORAGE_KEYS.METAL_RATES, null);
    }

    setStatusMessage("Settings updated successfully.");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleClearAllData = () => {
    if (confirm("Are you sure you want to delete all assets, liabilities, history, and settings from this browser? This action is irreversible.")) {
      clearAppStorage();
      alert("All data cleared successfully.");
      window.location.href = "/dashboard";
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground animate-pulse font-medium">Loading settings...</span>
      </div>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-primary tracking-tight">
            Jurisprudence Settings
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Configure calculations limits, Nisab standard, and live rate feeds.
          </p>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Settings Form */}
          <form onSubmit={handleSaveSettings} className="lg:col-span-8 space-y-6">
            {/* Nisab settings */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
              <h2 className="text-base font-heading font-bold text-primary pb-3 border-b border-border/40">
                Nisab Standard Jurisprudence
              </h2>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="nisabStandard"
                    value="silver"
                    checked={nisabStandard === "silver"}
                    onChange={() => setNisabStandard("silver")}
                    className="mt-1 text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <div className="text-sm">
                    <strong className="block text-primary">Silver Nisab Standard (595 grams) - Recommended</strong>
                    <span className="text-xs text-muted-foreground">
                      Most commonly recommended by contemporary Shariah councils for liquid wealth, as it sets a lower threshold and maximises support for Zakat recipients.
                    </span>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="nisabStandard"
                    value="gold"
                    checked={nisabStandard === "gold"}
                    onChange={() => setNisabStandard("gold")}
                    className="mt-1 text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <div className="text-sm">
                    <strong className="block text-primary">Gold Nisab Standard (85 grams)</strong>
                    <span className="text-xs text-muted-foreground">
                      Traditionally preferred for gold jewelry owners or specific financial conditions.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Metal rates settings */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
              <h2 className="text-base font-heading font-bold text-primary pb-3 border-b border-border/40">
                Precious Metal Rates Source
              </h2>
              
              <div className="flex items-center justify-between pb-2">
                <div className="text-sm">
                  <strong className="block text-primary">Use Live Prices Feed</strong>
                  <span className="text-xs text-muted-foreground">
                    Automatically retrieve current gold and silver prices.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUseLiveRates(!useLiveRates)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    useLiveRates ? "bg-primary" : "bg-border"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      useLiveRates ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {!useLiveRates && (
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/40 animate-fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Gold Price ($ per gram)
                    </label>
                    <input
                      type="number"
                      required
                      step="any"
                      min="0"
                      value={goldPrice}
                      onChange={(e) => setGoldPrice(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Silver Price ($ per gram)
                    </label>
                    <input
                      type="number"
                      required
                      step="any"
                      min="0"
                      value={silverPrice}
                      onChange={(e) => setSilverPrice(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/95 shadow-md shadow-primary/10 transition-colors text-sm"
            >
              Update Configuration
            </button>
          </form>

          {/* Core System Reset Options */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <h2 className="text-base font-heading font-bold text-red-700">Danger Zone</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Clear browser database memory. This will purge all logged assets, calculations logs, and overrides completely.
            </p>
            <button
              type="button"
              onClick={handleClearAllData}
              className="w-full py-2.5 border border-red-200 hover:bg-red-50 text-red-600 font-semibold rounded-xl text-sm transition-colors text-center"
            >
              Flush All App Data
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
