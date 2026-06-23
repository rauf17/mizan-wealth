"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardShell from "../../components/DashboardShell";
import TrendChart from "../../components/TrendChart";
import GrowthChart from "../../components/GrowthChart";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";
import { useCountUp } from "../../hooks/useCountUp";
import { useCurrency } from "../../context/CurrencyContext";
import { useLang } from "../../context/LanguageContext";
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
  const { currency, convert, format } = useCurrency();
  const { t } = useLang();
  const [mounted, setMounted] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
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

  // Collapsible accordion states
  const [showAI, setShowAI] = useState(false);
  const [showGrowth, setShowGrowth] = useState(false);

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

    if (!window.localStorage.getItem("mizan_privacy_dismissed")) {
      setShowPrivacyNotice(true);
    }

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

  const hasFetched = React.useRef(false);

  // Generate AI Insights manually
  const generateInsights = async () => {
    if (assets.length === 0 || hasFetched.current) return;

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
        hasFetched.current = true;
      }
    } catch (err) {
      console.error("Failed to load insights:", err);
    } finally {
      setLoadingInsights(false);
    }
  };

  // Reset fetch flag if inputs change
  useEffect(() => {
    hasFetched.current = false;
  }, [assets, liabilities, rates, settings.nisabStandard]);

  // Calculate sum of liabilities
  const totalLiabilitiesVal = liabilities.reduce((sum, item) => sum + item.value, 0);

  // Compute Zakat result using our core engine
  const calculationResult: ZakatCalculationResult = calculateZakat(
    assets,
    totalLiabilitiesVal,
    rates,
    settings.nisabStandard
  );

  const animatedZakatDue = useCountUp(calculationResult.zakatDue);
  const animatedTotalAssets = useCountUp(calculationResult.totalAssets);
  const animatedNetZakatable = useCountUp(calculationResult.netZakatable);

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
      <div className="animate-fade-in space-y-8 max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="font-h1">
              {t("appName")} &mdash; {t("dashboard")}
            </h1>
            <p className="text-slate-500 mt-1 text-sm leading-relaxed">
              {t("tagline")}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSaveSnapshot}
              disabled={assets.length === 0}
            >
              {t("saveDeclaration")}
            </Button>
            <Button
              href="/assets"
              variant="secondary"
            >
              {t("manageLedger")}
            </Button>
          </div>
        </div>

        {/* Privacy Notice Banner */}
        {showPrivacyNotice && (
          <div className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-4 text-sm relative animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="leading-relaxed pr-8">
              Your data stays in this browser — nothing is sent to a server except anonymous calculation totals when you use AI Insights. Back up your data anytime in Settings.
            </span>
            <Button 
              variant="secondary"
              onClick={() => {
                window.localStorage.setItem("mizan_privacy_dismissed", "1");
                setShowPrivacyNotice(false);
              }}
              className="flex-shrink-0"
            >
              Got it
            </Button>
          </div>
        )}

        {/* Save Status Banner */}
        {saveStatus && (
          <div className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-4 py-3 text-xs font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{saveStatus}</span>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1 & 2: Wealth Summary & History */}
          <div className="lg:col-span-2 space-y-8">
            {/* Wealth Summary Card (Top Priority) */}
            <Card className="mizan-hero-card">
              <div className="hero-glow-blob" />
              
              {/* Zakat Status Panel (Integrated) */}
              <div className="relative z-10 flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-heading">
                  {t("wealthSummary")}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${calculationResult.isNisabReached ? "bg-accent" : "bg-slate-300"}`} />
                  <span className={`text-xs font-bold uppercase tracking-wider select-none ${calculationResult.isNisabReached ? "text-accent" : "text-slate-500"}`}>
                    {calculationResult.isNisabReached ? t("aboveNisab") : t("belowNisab")}
                  </span>
                </div>
              </div>

              {/* Core Zakat Figure */}
              <div className="relative z-10 space-y-1.5 mb-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-heading flex items-center gap-2">
                  {t("zakatDue")}
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] tracking-widest">{currency}</span>
                </span>
                <div className="text-5xl font-extrabold text-accent font-heading tracking-tight text-glow-accent select-all">
                  {format(convert(animatedZakatDue, "USD", currency))}
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {t("grossAssets")}
                  </span>
                  <strong className="text-base sm:text-lg font-bold text-gradient-teal block">
                    {format(convert(animatedTotalAssets, "USD", currency))}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {t("liabilities")}
                  </span>
                  <strong className="text-base sm:text-lg font-bold text-slate-600 block">
                    {format(convert(calculationResult.totalLiabilities, "USD", currency))}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {t("netZakatable")}
                  </span>
                  <strong className="text-base sm:text-lg font-bold text-gradient-teal block">
                    {format(convert(animatedNetZakatable, "USD", currency))}
                  </strong>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-2 -m-2">
                  <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider block mb-1">
                    {t("nisabMultiplier")}
                  </span>
                  <strong className="text-base sm:text-lg font-bold text-primary block">
                    {calculationResult.isNisabReached ? `${(calculationResult.netZakatable / calculationResult.nisabThreshold).toFixed(1)}×` : "—"}
                  </strong>
                </div>
              </div>

              {/* Nisab Comparison Indicator */}
              <div className={`mt-6 p-4 rounded-lg bg-slate-50/50 flex items-start gap-3 border ${calculationResult.isNisabReached ? "border-[var(--accent)]/20" : "border-slate-100"}`}>
                <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${calculationResult.isNisabReached ? "text-accent" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {calculationResult.isNisabReached ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                <div className="text-xs text-slate-500 leading-relaxed">
                  {calculationResult.isNisabReached ? (
                    <span>
                      {t("nisabReachedText")
                        .replace("{amount}", format(convert(calculationResult.netZakatable, "USD", currency)))
                        .replace("{threshold}", format(convert(calculationResult.nisabThreshold, "USD", currency)))
                        .replace("{multiplier}", (calculationResult.netZakatable / calculationResult.nisabThreshold).toFixed(1))}
                    </span>
                  ) : (
                    <span>
                      {t("nisabNotReachedText")
                        .replace("{amount}", format(convert(calculationResult.netZakatable, "USD", currency)))
                        .replace("{threshold}", format(convert(calculationResult.nisabThreshold, "USD", currency)))}
                    </span>
                  )}
                </div>
              </div>
            </Card>

            {/* Historical Snapshot (If Exists) */}
            {historyRecords.length > 0 && (
              <Card>
                <h3 className="font-h3 text-slate-900 mb-4 font-heading font-bold">Historical Wealth Trend</h3>
                <TrendChart records={historyRecords} />
              </Card>
            )}
          </div>

          {/* Column 3: Asset Breakdown & Market Rates */}
          <div className="space-y-8">
            {/* Asset Breakdown */}
            <Card className="min-h-[280px]">
              <h3 className="font-h3 text-slate-900 mb-4 font-heading font-bold">{t("assetBreakdown")}</h3>
              {assets.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                  {t("assetBreakdownEmpty")}
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(assetSummary).map(([type, summary]) => {
                    const percent = Math.round((summary.value / calculationResult.totalAssets) * 100) || 0;
                    return (
                      <div key={type} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold items-center">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0"></span>
                            <span className="text-slate-700">{assetTypeNames[type] || type}</span>
                          </div>
                          <span className="text-slate-500 font-medium">
                            {format(convert(summary.value, "USD", currency))} ({percent}%)
                          </span>
                        </div>
                         <div className="w-full bg-slate-100/50 h-1.5 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
                          <div className="bg-accent h-full rounded-full transition-all duration-700 ease-out" style={{ width: mounted ? `${percent}%` : "0%" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Market Rates Card */}
            <Card className="space-y-4 min-h-[280px]">
              <h3 className="font-h3 text-slate-900 font-heading font-bold">{t("metalRates")}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t("metalRatesDesc")}
              </p>
              
              {/* Premium Side-by-Side Commodity pricing boxes */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="mizan-card border-accent/20 rounded-lg p-3 text-center shadow-sm relative overflow-hidden" style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.06) 50%, transparent 100%)",
                  backgroundSize: "200% auto",
                  animation: "shimmer 3s linear infinite"
                }}>
                  <div className="relative z-10">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                      {t("goldPrice")}
                    </span>
                    <strong className="text-base font-bold text-slate-900">
                      {format(convert(rates.goldPerGram, "USD", currency))}<span className="text-[10px] text-slate-400 font-normal">/g</span>
                    </strong>
                  </div>
                </div>
                <div className="mizan-card border-accent/20 rounded-lg p-3 text-center shadow-sm">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    {t("silverPrice")}
                  </span>
                  <strong className="text-base font-bold text-slate-900">
                    {format(convert(rates.silverPerGram, "USD", currency))}<span className="text-[10px] text-slate-400 font-normal">/g</span>
                  </strong>
                </div>
              </div>

              {/* Calculated standard thresholds */}
              <div className="divide-y divide-slate-100 text-xs pt-2">
                <div className="py-2.5 flex justify-between text-slate-500 font-medium">
                  <span>{t("goldNisab")}</span>
                  <span className="font-bold text-slate-800">{format(convert(rates.goldPerGram * 85, "USD", currency))}</span>
                </div>
                <div className="py-2.5 flex justify-between text-slate-500 font-medium">
                  <span>{t("silverNisab")}</span>
                  <span className="font-bold text-slate-800">{format(convert(rates.silverPerGram * 595, "USD", currency))}</span>
                </div>
              </div>

              <div suppressHydrationWarning className="text-[10px] text-slate-400 text-center pt-2 select-none">
                Feed updated: {new Date(rates.lastUpdated).toLocaleTimeString()}
              </div>
            </Card>
          </div>
        </div>

        {/* Collapsible Secondary Analysis & Tools */}
        <div className="space-y-4 pt-6 border-t border-slate-200/50">
          <div className="flex flex-col gap-4">
            {/* AI Insights Accordion */}
            {assets.length > 0 && (
              <div className="mizan-card overflow-hidden p-0">
                <button
                  onClick={() => setShowAI(!showAI)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="font-heading font-bold text-slate-800 text-sm">{t("aiInsights")}</span>
                  </div>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${showAI ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showAI && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 animate-fade-in">
                    {!aiInsights && !loadingInsights && (
                      <div className="py-6 flex justify-center">
                        <Button onClick={generateInsights}>Generate Insights</Button>
                      </div>
                    )}

                    {insightsSource && !loadingInsights && (
                      <div className="flex justify-end mb-4 pt-4">
                        <span className="text-[10px] bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-full text-slate-500 font-semibold uppercase tracking-wider select-none">
                          {insightsSource}
                        </span>
                      </div>
                    )}

                    {loadingInsights ? (
                      <div className="space-y-3 py-6">
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-5/6"></div>
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3"></div>
                      </div>
                    ) : aiInsights ? (
                      <div className="space-y-6 pt-2">
                        {/* Position Summary */}
                        <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-lg">
                          <p className="text-xs text-slate-700 font-medium leading-relaxed">
                            {aiInsights.position}
                          </p>
                        </div>

                        {/* Optimization & Channels Sub-grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Optimization */}
                          <div className="p-5 rounded-lg bg-slate-50/50 border border-slate-200/60 space-y-4">
                            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-heading">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Wealth Optimization
                            </h3>
                            {renderInsightList(aiInsights.optimization, "bg-primary")}
                          </div>

                          {/* Donations */}
                          <div className="p-5 rounded-lg bg-slate-50/50 border border-slate-200/60 space-y-4">
                            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-heading">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                              Donation & Zakat Channels
                            </h3>
                            {renderInsightList(aiInsights.donations, "bg-accent")}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-xs text-slate-500">
                        No insights could be computed. Please check your asset inputs.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Growth Modeler Accordion */}
            <div className="mizan-card overflow-hidden p-0">
              <button
                onClick={() => setShowGrowth(!showGrowth)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="font-heading font-bold text-slate-800 text-sm">{t("growthSimulator")}</span>
                </div>
                <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${showGrowth ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showGrowth && (
                <div className="px-6 pb-6 pt-4 border-t border-slate-100 space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Settings Panel */}
                    <div className="md:col-span-4 space-y-4 text-xs">
                      <Input
                        type="number"
                        label="Starting Balance ($)"
                        value={growthPrincipal}
                        onChange={(e) => setGrowthPrincipal(e.target.value)}
                      />

                      <Input
                        type="number"
                        label="Annual Contribution ($)"
                        value={annualContribution}
                        onChange={(e) => setAnnualContribution(e.target.value)}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="number"
                          label="Return (%)"
                          value={growthExpectedReturn}
                          onChange={(e) => setGrowthExpectedReturn(e.target.value)}
                        />
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          label="Years"
                          value={growthDuration}
                          onChange={(e) => setGrowthDuration(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2.5 pt-3 border-t border-slate-100">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={deductZakat}
                            onChange={() => setDeductZakat(!deductZakat)}
                            className="rounded text-primary focus:ring-primary h-4 w-4 border-slate-300"
                          />
                          <span className="text-[11px] text-slate-600 font-semibold">Deduct Annual Zakat (2.5%)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={deductPurification}
                            onChange={() => setDeductPurification(!deductPurification)}
                            className="rounded text-primary focus:ring-primary h-4 w-4 border-slate-300"
                          />
                          <span className="text-[11px] text-slate-600 font-semibold">Deduct Dividend Purification</span>
                        </label>
                      </div>

                      {deductPurification && (
                        <div className="animate-fade-in">
                          <Input
                            type="number"
                            step="any"
                            label="Purification Rate (%)"
                            value={purificationRate}
                            onChange={(e) => setPurificationRate(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Chart panel */}
                    <div className="md:col-span-8 space-y-6">
                      <GrowthChart data={growthData} />

                      {/* Simulated Summary Table */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-4 border-t border-slate-100">
                        <div>
                          <span className="text-slate-400 block font-medium">Contributions</span>
                          <strong className="text-slate-900 text-sm font-bold">{format(convert(totalSimulatedContributions, "USD", currency))}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Investment Gains</span>
                          <strong className="text-slate-900 text-sm font-bold">{format(convert(totalSimulatedGains, "USD", currency))}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Zakat Deductions</span>
                          <strong className="text-accent text-sm font-bold">{format(convert(totalSimulatedZakat, "USD", currency))}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block font-bold">Final Balance</span>
                          <strong className="text-slate-900 text-sm font-extrabold">{format(convert(finalBalance, "USD", currency))}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
