"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "../../components/DashboardShell";
import { getData, saveData, STORAGE_KEYS } from "../../lib/storage";
import { calculateZakat, getAssetSummary } from "../../lib/zakatEngine";
import { fetchMetalRates, DEFAULT_METAL_RATES } from "../../lib/api";
import { ZakatAsset, ZakatLiability, ZakatRecord, MetalRates, ZakatCalculationResult } from "../../types";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [assets, setAssets] = useState<ZakatAsset[]>([]);
  const [liabilities, setLiabilities] = useState<ZakatLiability[]>([]);
  const [rates, setRates] = useState<MetalRates>(DEFAULT_METAL_RATES);
  const [settings, setSettings] = useState({
    nisabStandard: "silver" as "gold" | "silver",
    currency: "USD",
  });
  
  // Save status notification state
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Load local storage states
    const localAssets = getData<ZakatAsset[]>(STORAGE_KEYS.ZAKAT_ASSETS, []);
    const localLiabilities = getData<ZakatLiability[]>(STORAGE_KEYS.ZAKAT_LIABILITIES, []);
    const localSettings = getData(STORAGE_KEYS.SETTINGS, {
      nisabStandard: "silver" as "gold" | "silver",
      currency: "USD",
    });
    
    setAssets(localAssets);
    setLiabilities(localLiabilities);
    setSettings(localSettings);

    // Fetch live metal rates
    const loadRates = async () => {
      const liveRates = await fetchMetalRates();
      setRates(liveRates);
    };
    loadRates();
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground animate-pulse font-medium">Loading metrics...</span>
      </div>
    );
  }

  // Calculate sum of liabilities
  const totalLiabilitiesVal = liabilities.reduce((sum, item) => sum + item.value, 0);

  // Compute Zakat result using our core engine
  const calculationResult: ZakatCalculationResult = calculateZakat(
    assets,
    totalLiabilitiesVal,
    rates,
    settings.nisabStandard
  );

  const assetSummary = getAssetSummary(assets);

  // Trigger snapshot save
  const handleSaveSnapshot = () => {
    const history = getData<ZakatRecord[]>(STORAGE_KEYS.CALCULATION_HISTORY, []);
    
    const newRecord: ZakatRecord = {
      id: `calc_${Date.now()}`,
      assets: [...assets],
      liabilities: [...liabilities],
      result: { ...calculationResult },
      createdAt: new Date().toISOString(),
    };

    saveData(STORAGE_KEYS.CALCULATION_HISTORY, [newRecord, ...history]);
    
    setSaveStatus("Declaration saved successfully to history.");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Progress to Nisab calculation
  const progressPercent = Math.min(
    100,
    Math.round((calculationResult.netZakatable / calculationResult.nisabThreshold) * 100) || 0
  );

  const assetTypeNames: Record<string, string> = {
    cash: "Liquid Cash",
    gold: "Gold Metals",
    silver: "Silver Metals",
    stock: "Equities/Stocks",
    real_estate: "Real Estate",
    business: "Business Trade",
    crypto: "Cryptocurrency",
    other: "Other Holdings",
  };

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-extrabold text-primary tracking-tight">
              Mizan Position Overview
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Real-time Shariah wealth evaluation based on your recorded ledger.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSaveSnapshot}
              disabled={assets.length === 0}
              className="px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/95 shadow-md shadow-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Declaration
            </button>
            <Link
              href="/assets"
              className="px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-primary bg-white font-semibold text-sm transition-all"
            >
              Manage Ledger
            </Link>
          </div>
        </div>

        {/* Save Status Banner */}
        {saveStatus && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{saveStatus}</span>
          </div>
        )}

        {/* Wealth Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Assets */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Gross Wealth
            </div>
            <div className="text-2xl font-bold text-primary">
              ${calculationResult.totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
              Combined value of all asset inventory holdings.
            </div>
          </div>

          {/* Card 2: Liabilities */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Total Liabilities
            </div>
            <div className="text-2xl font-bold text-red-600">
              -${calculationResult.totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
              Outstanding short-term debts and bills deducted.
            </div>
          </div>

          {/* Card 3: Net Zakatable */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Zakatable Wealth
            </div>
            <div className="text-2xl font-bold text-emerald-800">
              ${calculationResult.netZakatable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
              Eligible wealth matching lunar holding constraints.
            </div>
          </div>

          {/* Card 4: Zakat Due */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm ring-1 ring-primary/5">
            <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">
              Zakat Due (2.5%)
            </div>
            <div className="text-3xl font-extrabold text-primary">
              ${calculationResult.zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
              {calculationResult.isNisabReached
                ? "Calculated relative to standard Nisab rate of 2.5%."
                : "Wealth is below the Nisab threshold. Zakat is not due."}
            </div>
          </div>
        </div>

        {/* Nisab Progress and Rate Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Nisab Progress Card */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm lg:col-span-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
              <div>
                <h2 className="text-lg font-heading font-bold text-primary">Nisab Threshold Status</h2>
                <p className="text-xs text-muted-foreground">
                  Using the <strong className="text-primary font-bold">{settings.nisabStandard.toUpperCase()}</strong> standard.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Nisab Limit:</span>
                <span className="text-sm font-bold text-primary">
                  ${calculationResult.nisabThreshold.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Zakat Wealth Nisab Progress</span>
                <span className="text-primary">{progressPercent}%</span>
              </div>
              <div className="w-full bg-muted h-3.5 rounded-full overflow-hidden border border-border/40">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500 shadow-inner"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Status Callout Banner */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              calculationResult.isNisabReached
                ? "bg-amber-50/60 border-accent/20 text-emerald-950"
                : "bg-muted/40 border-border/60 text-muted-foreground"
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                calculationResult.isNisabReached ? "bg-accent shadow-sm" : "bg-muted-foreground/60"
              }`}>
                {calculationResult.isNisabReached ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 text-sm">
                <strong className={`block font-heading font-bold ${calculationResult.isNisabReached ? "text-primary" : "text-primary/70"}`}>
                  {calculationResult.isNisabReached ? "Nisab Threshold Met" : "Nisab Threshold Not Reached"}
                </strong>
                <p className="mt-0.5 leading-relaxed text-xs">
                  {calculationResult.isNisabReached
                    ? "Your net eligible assets exceed the Nisab limit. Zakat is duty-bound at 2.5% of your net zakatable wealth."
                    : "Your net assets have not reached the Nisab value threshold. Zakat is not mandatory for your current assets."}
                </p>
              </div>
            </div>
          </div>

          {/* Precious Metals Market Rates Feed */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm lg:col-span-4 space-y-4">
            <h2 className="text-base font-heading font-bold text-primary">Precious Metal Rates</h2>
            <p className="text-xs text-muted-foreground">
              Market rates used to determine Nisab limits (updated dynamically).
            </p>
            <div className="divide-y divide-border/40">
              <div className="py-2.5 flex justify-between text-sm">
                <span className="font-semibold text-primary">Gold Rate (24k)</span>
                <span className="font-bold text-primary">${rates.goldPerGram.toFixed(2)}/g</span>
              </div>
              <div className="py-2.5 flex justify-between text-sm">
                <span className="font-semibold text-primary">Silver Rate</span>
                <span className="font-bold text-primary">${rates.silverPerGram.toFixed(2)}/g</span>
              </div>
              <div className="py-2.5 flex justify-between text-xs text-muted-foreground">
                <span>Calculated Gold Nisab (85g)</span>
                <span>${(rates.goldPerGram * 85).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="py-2.5 flex justify-between text-xs text-muted-foreground">
                <span>Calculated Silver Nisab (595g)</span>
                <span>${(rates.silverPerGram * 595).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground text-center pt-2">
              Feed updated on: {new Date(rates.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Asset Breakdown Chart Grid */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="text-base font-heading font-bold text-primary mb-4">Asset Class Distribution</h2>
          {assets.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              Add assets in the inventory ledger to see distribution metrics.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(assetSummary).map(([type, summary]) => {
                const percent = Math.round((summary.value / calculationResult.totalAssets) * 100) || 0;
                return (
                  <div key={type} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-primary">{assetTypeNames[type] || type}</span>
                      <span className="text-muted-foreground">${summary.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div className="bg-accent h-full rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
