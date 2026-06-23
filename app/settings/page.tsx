"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "../../components/DashboardShell";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";
import { getData, saveData, clearAppStorage, STORAGE_KEYS, exportAllData, importAllData } from "../../lib/storage";
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

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const result = await importAllData(file);
    setStatusMessage(result.message);
    setTimeout(() => setStatusMessage(null), 4000);
    e.target.value = "";
  };

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
    if (confirm("Confirming this action will delete all assets, liabilities, history, and settings from local storage. This cannot be undone. Do you wish to proceed?")) {
      clearAppStorage();
      alert("All application data has been cleared.");
      window.location.href = "/dashboard";
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-slate-400 animate-pulse font-semibold">Loading settings...</span>
      </div>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="font-h1">
            Jurisprudence Settings
          </h1>
          <p className="text-slate-500 mt-1 text-sm leading-relaxed">
            Configure calculations limits, Nisab standard, and live rate feeds.
          </p>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-4 py-3 text-xs font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            {/* Settings Form */}
            <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Nisab settings */}
            <Card className="space-y-4">
              <h2 className="text-sm font-heading font-bold text-slate-800 pb-3 border-b border-slate-100">
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
                    <strong className="block text-slate-800 font-semibold">Silver Nisab Standard (595 grams) - Recommended</strong>
                    <span className="text-xs text-slate-400 mt-0.5 block leading-relaxed">
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
                    <strong className="block text-slate-800 font-semibold">Gold Nisab Standard (85 grams)</strong>
                    <span className="text-xs text-slate-400 mt-0.5 block leading-relaxed">
                      Traditionally preferred for gold jewelry owners or specific financial conditions.
                    </span>
                  </div>
                </label>
              </div>
            </Card>

            {/* Metal rates settings */}
            <Card className="space-y-4">
              <h2 className="text-sm font-heading font-bold text-slate-800 pb-3 border-b border-slate-100">
                Precious Metal Rates Source
              </h2>
              
              <div className="flex items-center justify-between pb-2">
                <div className="text-sm pr-4">
                  <strong className="block text-slate-800 font-semibold">Use Live Prices Feed</strong>
                  <span className="text-xs text-slate-400 mt-0.5 block leading-relaxed">
                    Automatically retrieve current gold and silver prices.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUseLiveRates(!useLiveRates)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    useLiveRates ? "bg-primary" : "bg-slate-200"
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
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 animate-fade-in">
                  <Input
                    type="number"
                    required
                    step="any"
                    min="0"
                    label="Gold Price ($ per gram)"
                    value={goldPrice}
                    onChange={(e) => setGoldPrice(e.target.value)}
                  />
                  <Input
                    type="number"
                    required
                    step="any"
                    min="0"
                    label="Silver Price ($ per gram)"
                    value={silverPrice}
                    onChange={(e) => setSilverPrice(e.target.value)}
                  />
                </div>
              )}
            </Card>

            <Button type="submit">
              Update Configuration
            </Button>
          </form>

          {/* Data Portability */}
          <Card className="space-y-4">
            <h2 className="text-sm font-heading font-bold text-slate-800 pb-3 border-b border-slate-100">
              Data Portability
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed pb-2">
              Export all your settings, assets, liabilities, history, and portfolio to a JSON backup file. You can restore this backup on another device.
            </p>
            <div className="flex gap-4">
              <Button type="button" variant="secondary" onClick={() => exportAllData()}>
                Export All Data
              </Button>
              <label className="btn-secondary cursor-pointer flex items-center justify-center m-0">
                Import Backup
                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
              </label>
            </div>
          </Card>
        </div>

          {/* Core System Reset Options */}
          <Card className="lg:col-span-4 space-y-4">
            <h2 className="text-sm font-heading font-bold text-red-600">Danger Zone</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clear browser database memory. This will purge all logged assets, calculations logs, and overrides completely.
            </p>
            <button
              type="button"
              onClick={handleClearAllData}
              className="w-full py-2.5 border border-red-200 hover:bg-red-50 text-red-600 font-bold rounded-lg text-xs tracking-wide transition-colors text-center uppercase"
            >
              Flush All App Data
            </button>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
