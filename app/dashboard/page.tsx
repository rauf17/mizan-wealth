"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardShell from "../../components/DashboardShell";
import TrendChart from "../../components/TrendChart";
import GrowthChart from "../../components/GrowthChart";
import { getData, saveData, STORAGE_KEYS } from "../../lib/storage";
import { calculateZakat, getAssetSummary } from "../../lib/zakatEngine";
import { fetchMetalRates, DEFAULT_METAL_RATES } from "../../lib/api";
import {
  ZakatAsset,
  ZakatLiability,
  ZakatRecord,
  MetalRates,
  ZakatCalculationResult,
  GrowthProjectionYear,
} from "../../types";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [assets, setAssets] = useState<ZakatAsset[]>([]);
  const [liabilities, setLiabilities] = useState<ZakatLiability[]>([]);
  const [rates, setRates] = useState<MetalRates>(DEFAULT_METAL_RATES);
  const [settings, setSettings] = useState({
    nisabStandard: "silver" as "gold" | "silver",
    currency: "USD",
  });

  // History & Analytics States
  const [historyRecords, setHistoryRecords] = useState<ZakatRecord[]>([]);

  // Growth Modeler States
  const [growthPrincipal, setGrowthPrincipal] = useState("10000");
  const [annualContribution, setAnnualContribution] = useState("2000");
  const [growthExpectedReturn, setGrowthExpectedReturn] = useState("8");
  const [growthDuration, setGrowthDuration] = useState("10");
  const [deductZakat, setDeductZakat] = useState(true);
  const [deductPurification, setDeductPurification] = useState(false);
  const [purificationRate, setPurificationRate] = useState("0.5");
  const [growthData, setGrowthData] = useState<GrowthProjectionYear[]>([]);

  // AI Insights States
  const [aiInsights, setAiInsights] = useState<{ position: string; optimization: string; donations: string } | null>(null);
  const [insightsSource, setInsightsSource] = useState<string>("");
  const [loadingInsights, setLoadingInsights] = useState(false);

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Helper to render markdown bullets with custom styles and bolding
  const renderInsightList = (text: string, dotColorClass: string) => {
    if (!text) return null;
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    return (
      <ul className="space-y-3">
        {lines.map((line, idx) => {
          const cleanText = line.replace(/^\s*[-*•]\s*/, "").trim();
          const parts = cleanText.split(/(\*\*.*?\*\*)/g);
          return (
            <li key={idx} className="flex items-start gap-2.5 text-[11px] text-muted-foreground leading-relaxed">
              <span className={`w-1.5 h-1.5 rounded-full ${dotColorClass} mt-1.5 flex-shrink-0`} />
              <span className="flex-1">
                {parts.map((part, pIdx) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return (
                      <strong key={pIdx} className="font-semibold text-primary font-heading mr-0.5">
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  return <span key={pIdx}>{part}</span>;
                })}
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  // Generate Growth Projection Logic
  const generateGrowthProjection = useCallback(() => {
    const principal = Math.max(0, Number(growthPrincipal) || 0);
    const contribution = Math.max(0, Number(annualContribution) || 0);
    const rate = Math.max(0, Number(growthExpectedReturn) || 0) / 100;
    const years = Math.min(30, Math.max(1, Number(growthDuration) || 10));
    const purifRate = Math.max(0, Number(purificationRate) || 0) / 100;

    const projection: GrowthProjectionYear[] = [];
    let balance = principal;

    for (let yr = 1; yr <= years; yr++) {
      const starting = balance;
      const gains = balance * rate;
      const totalBeforeDeductions = balance + contribution + gains;

      // Zakat Deduction (2.5% of wealth)
      const zakatDeducted = deductZakat ? totalBeforeDeductions * 0.025 : 0;
      const purifiedDeducted = deductPurification ? totalBeforeDeductions * purifRate : 0;

      const ending = totalBeforeDeductions - zakatDeducted - purifiedDeducted;

      projection.push({
        year: yr,
        startingBalance: starting,
        contributions: contribution,
        investmentGains: gains,
        zakatDeducted,
        purifiedDeducted,
        endingBalance: ending,
      });

      balance = ending;
    }

    setGrowthData(projection);
  }, [
    growthPrincipal,
    annualContribution,
    growthExpectedReturn,
    growthDuration,
    deductZakat,
    deductPurification,
    purificationRate,
  ]);

  useEffect(() => {
    setMounted(true);

    // Load local storage states
    const localAssets = getData<ZakatAsset[]>(STORAGE_KEYS.ZAKAT_ASSETS, []);
    const localLiabilities = getData<ZakatLiability[]>(STORAGE_KEYS.ZAKAT_LIABILITIES, []);
    const localSettings = getData(STORAGE_KEYS.SETTINGS, {
      nisabStandard: "silver" as "gold" | "silver",
      currency: "USD",
    });
    const localHistory = getData<ZakatRecord[]>(STORAGE_KEYS.CALCULATION_HISTORY, []);

    setAssets(localAssets);
    setLiabilities(localLiabilities);
    setSettings(localSettings);
    setHistoryRecords(localHistory);

    // Set default growth modeler starting balance based on actual current net assets
    const totalLiab = localLiabilities.reduce((sum, item) => sum + item.value, 0);
    const result = calculateZakat(localAssets, totalLiab, DEFAULT_METAL_RATES, localSettings.nisabStandard);
    setGrowthPrincipal(Math.round(result.netZakatable || 10000).toString());

    // Fetch live metal rates
    const loadRates = async () => {
      const liveRates = await fetchMetalRates();
      setRates(liveRates);
    };
    loadRates();
  }, []);

  // Recalculate growth projection when inputs change
  useEffect(() => {
    if (!mounted) return;
    generateGrowthProjection();
  }, [mounted, generateGrowthProjection]);

  // Fetch AI insights when assets change
  useEffect(() => {
    if (!mounted || assets.length === 0) return;

    const getInsights = async () => {
      setLoadingInsights(true);
      try {
        const totalLiabilitiesVal = liabilities.reduce((sum, item) => sum + item.value, 0);
        const calculationResult = calculateZakat(assets, totalLiabilitiesVal, rates, settings.nisabStandard);
        
        const response = await fetch("/api/ai/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assets,
            calculation: calculationResult,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          setAiInsights(data.insights);
          setInsightsSource(data.source || "");
        }
      } catch (err) {
        console.error("Failed to load insights:", err);
      } finally {
        setLoadingInsights(false);
      }
    };

    getInsights();
  }, [mounted, assets, liabilities, rates, settings.nisabStandard]);

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

    const updatedHistory = [newRecord, ...history];
    saveData(STORAGE_KEYS.CALCULATION_HISTORY, updatedHistory);
    setHistoryRecords(updatedHistory);

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

  // Compute total simulated summary values
  const totalSimulatedContributions = growthData.reduce((sum, y) => sum + y.contributions, 0);
  const totalSimulatedGains = growthData.reduce((sum, y) => sum + y.investmentGains, 0);
  const totalSimulatedZakat = growthData.reduce((sum, y) => sum + y.zakatDeducted, 0);
  const finalBalance = growthData[growthData.length - 1]?.endingBalance || 0;

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
              ${calculationResult.totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
              -${calculationResult.totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
              ${calculationResult.netZakatable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
              ${calculationResult.zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
              {calculationResult.isNisabReached
                ? "Calculated relative to standard Nisab rate of 2.5%."
                : "Wealth is below the Nisab threshold. Zakat is not due."}
            </div>
          </div>
        </div>

        {/* AI Advisor Insights Panel */}
        {assets.length > 0 && (
          <div className="bg-gradient-to-br from-white to-background rounded-2xl border border-border/85 p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
            {/* Top decorative gold/pine gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/40">
              <h2 className="text-base font-heading font-bold text-primary flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                AI Wealth Advisor Insights
              </h2>
              {insightsSource && !loadingInsights && (
                <span className="text-[10px] bg-muted/70 border border-border/40 px-2.5 py-1 rounded-full text-muted-foreground font-medium select-none self-start sm:self-auto">
                  {insightsSource}
                </span>
              )}
            </div>

            {loadingInsights ? (
              <div className="space-y-3 py-6">
                <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
              </div>
            ) : aiInsights ? (
              <div className="space-y-6 pt-2">
                {/* Position Summary Banner */}
                <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl">
                  <p className="text-xs text-primary font-medium leading-relaxed">
                    {aiInsights.position}
                  </p>
                </div>

                {/* Sub-grid of Optimization and Donations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Optimization */}
                  <div className="p-5 rounded-xl bg-white border border-border/50 shadow-sm space-y-4 hover:border-primary/20 transition-colors duration-200">
                    <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-2 font-heading">
                      <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
                        <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      Wealth Optimization
                    </h3>
                    {renderInsightList(aiInsights.optimization, "bg-primary")}
                  </div>

                  {/* Donations */}
                  <div className="p-5 rounded-xl bg-white border border-border/50 shadow-sm space-y-4 hover:border-accent/20 transition-colors duration-200">
                    <h3 className="text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-2 font-heading">
                      <div className="w-5 h-5 rounded bg-accent/10 flex items-center justify-center">
                        <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 21l-8.244-8.244a5.5 5.5 0 017.778-7.778L12 5.515l.466-.466a5.5 5.5 0 117.778 7.778L12 21z" />
                        </svg>
                      </div>
                      Donation & Zakat Channels
                    </h3>
                    {renderInsightList(aiInsights.donations, "bg-accent")}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-muted-foreground">
                No insights could be computed. Please check your asset inputs.
              </div>
            )}
          </div>
        )}

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
                  ${calculationResult.nisabThreshold.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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

        {/* Wealth Trend Tracking Charts (localStorage history) */}
        {historyRecords.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <h2 className="text-base font-heading font-bold text-primary">Historical Wealth Trend</h2>
            <TrendChart records={historyRecords} />
          </div>
        )}

        {/* Growth Projection Modeler Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Growth Settings Card */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm lg:col-span-4 space-y-5">
            <h2 className="text-base font-heading font-bold text-primary">Growth Calculator</h2>
            <p className="text-xs text-muted-foreground">
              Simulate investment compounds with annual Zakat/Purification rates.
            </p>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Starting Balance ($)
                </label>
                <input
                  type="number"
                  value={growthPrincipal}
                  onChange={(e) => setGrowthPrincipal(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Annual Contribution ($)
                </label>
                <input
                  type="number"
                  value={annualContribution}
                  onChange={(e) => setAnnualContribution(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Expected Return (%)
                  </label>
                  <input
                    type="number"
                    value={growthExpectedReturn}
                    onChange={(e) => setGrowthExpectedReturn(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Duration (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={growthDuration}
                    onChange={(e) => setGrowthDuration(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/40">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deductZakat}
                    onChange={() => setDeductZakat(!deductZakat)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="text-xs text-primary font-semibold">Deduct Annual Zakat (2.5%)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deductPurification}
                    onChange={() => setDeductPurification(!deductPurification)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="text-xs text-primary font-semibold">Deduct Dividend Purification</span>
                </label>
              </div>

              {deductPurification && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Purification Rate (%)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={purificationRate}
                    onChange={(e) => setPurificationRate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Growth Chart View */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm lg:col-span-8 flex flex-col justify-between space-y-6">
            <h2 className="text-base font-heading font-bold text-primary">Halal Net Yield Projections</h2>
            <GrowthChart data={growthData} />

            {/* Simulated summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-4 border-t border-border/40">
              <div>
                <span className="text-muted-foreground block">Contributions</span>
                <strong className="text-primary text-sm font-bold">${Math.round(totalSimulatedContributions).toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Investment Gains</span>
                <strong className="text-primary text-sm font-bold">${Math.round(totalSimulatedGains).toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-accent">Zakat Generosity</span>
                <strong className="text-primary text-sm font-bold">${Math.round(totalSimulatedZakat).toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Final Balance</span>
                <strong className="text-emerald-800 text-sm font-extrabold">${Math.round(finalBalance).toLocaleString()}</strong>
              </div>
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
                      <span className="text-muted-foreground">
                        ${summary.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({percent}%)
                      </span>
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
