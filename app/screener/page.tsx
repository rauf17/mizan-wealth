"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "../../components/DashboardShell";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { screenStock } from "../../lib/api";
import { getData, saveData, STORAGE_KEYS } from "../../lib/storage";
import { StockPurityInfo, PortfolioStock } from "../../types";

export default function ScreenerPage() {
  const [mounted, setMounted] = useState(false);
  const [tickerInput, setTickerInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<StockPurityInfo | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioStock[]>([]);

  useEffect(() => {
    setMounted(true);
    setPortfolio(getData<PortfolioStock[]>(STORAGE_KEYS.PORTFOLIO_STOCKS, []));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTickerInput(e.target.value.toUpperCase());
    if (result) {
      setResult(null);
    }
    if (errorMsg) {
      setErrorMsg("");
    }
  };

  const handleScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTicker = tickerInput.trim();
    if (!cleanTicker) return;

    setLoading(true);
    setErrorMsg("");
    setResult(null);

    try {
      const info = await screenStock(cleanTicker);
      setResult(info);
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : "Failed to screen stock.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToPortfolio = () => {
    if (!result) return;
    
    // Check if already exists
    if (portfolio.some(p => p.ticker === result.ticker)) {
      return; // Already exists
    }

    const newStock: PortfolioStock = {
      ticker: result.ticker,
      sharesCount: 0,
      averageCost: 0,
      currentPrice: 0,
      purityInfo: result
    };

    const updatedPortfolio = [...portfolio, newStock];
    setPortfolio(updatedPortfolio);
    saveData(STORAGE_KEYS.PORTFOLIO_STOCKS, updatedPortfolio);
  };

  const handleRemoveStock = (ticker: string) => {
    const updated = portfolio.filter(p => p.ticker !== ticker);
    setPortfolio(updated);
    saveData(STORAGE_KEYS.PORTFOLIO_STOCKS, updated);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-slate-400 animate-pulse font-semibold">Loading screener...</span>
      </div>
    );
  }

  // Progress Bar Helper
  const ProgressBar = ({ label, value, threshold }: { label: string; value: number; threshold: number }) => {
    const isPass = value < threshold;
    const valuePct = Math.min(100, Math.max(0, value * 100));
    const thresholdPct = threshold * 100;
    
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-700">{label}</span>
          <span className={`${isPass ? 'text-primary' : 'text-red-500'}`}>
            {valuePct.toFixed(1)}% (Threshold: &lt;{thresholdPct}%)
          </span>
        </div>
        <div className="relative w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className={`absolute top-0 bottom-0 left-0 rounded-full ${isPass ? 'bg-primary' : 'bg-red-500'}`} 
            style={{ width: `${valuePct}%` }} 
          />
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-slate-800/20 z-10" 
            style={{ left: `${thresholdPct}%` }} 
          />
        </div>
      </div>
    );
  };

  return (
    <DashboardShell>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="font-h1">Purity Screener</h1>
          <p className="text-slate-500 mt-1 text-sm leading-relaxed">
            Screen stock assets against Shariah compliance criteria.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Screener Section */}
          <div className="lg:col-span-6 space-y-6">
            <Card>
              <form onSubmit={handleScreen} className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      type="text"
                      label=""
                      placeholder="Enter ticker (e.g. AAPL)"
                      value={tickerInput}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading || !tickerInput.trim()} className="mt-1 sm:mt-0">
                    {loading ? "Screening..." : "Screen Stock"}
                  </Button>
                </div>
                {errorMsg && (
                  <p className="text-red-500 text-xs font-semibold">{errorMsg}</p>
                )}
              </form>
            </Card>

            {/* Result Card */}
            {result && (
              <Card className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-heading font-bold text-slate-900">{result.name}</h2>
                    <p className="text-slate-500 font-semibold">{result.ticker}</p>
                  </div>
                  {result.compliant ? (
                    <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-sm select-none">
                      Shariah Compliant
                    </span>
                  ) : (
                    <span className="px-4 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold text-sm select-none">
                      Non-Compliant
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <ProgressBar label="Debt Ratio" value={result.debtRatio} threshold={0.33} />
                  <ProgressBar label="Cash Ratio" value={result.cashRatio} threshold={0.33} />
                  <ProgressBar label="Interest Income Ratio" value={result.interestIncomeRatio} threshold={0.05} />
                </div>

                {result.compliant && result.purificationRate > 0 && (
                  <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-lg">
                    <p className="text-xs text-slate-700 font-medium">
                      Purify {(result.purificationRate * 100).toFixed(1)}% of any dividends received.
                    </p>
                  </div>
                )}

                {!result.compliant && (
                  <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-lg">
                    <p className="text-xs text-slate-500 font-medium italic">
                      This stock&apos;s core business model does not meet standard Shariah screening criteria.
                    </p>
                  </div>
                )}

                <Button variant="secondary" onClick={handleSaveToPortfolio} className="w-full">
                  Save to Portfolio
                </Button>
              </Card>
            )}
          </div>

          {/* Saved Portfolio Section */}
          <div className="lg:col-span-6">
            <Card>
              <h2 className="text-sm font-heading font-bold text-slate-800 mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                <span>Saved Portfolio</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 select-none">
                  {portfolio.length} Item{portfolio.length !== 1 ? "s" : ""}
                </span>
              </h2>

              {portfolio.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-400 text-xs font-semibold">
                    No stocks saved yet. Screen a ticker above and save it to your portfolio.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {portfolio.map((item) => (
                    <div key={item.ticker} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 hover:bg-slate-50/30 transition-colors px-1">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm block">
                            {item.ticker}
                          </span>
                          {item.purityInfo?.compliant ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold uppercase tracking-wider">Pass</span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold uppercase tracking-wider">Fail</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          Debt: {((item.purityInfo?.debtRatio || 0) * 100).toFixed(1)}% | Int: {((item.purityInfo?.interestIncomeRatio || 0) * 100).toFixed(1)}% | Purify: {((item.purityInfo?.purificationRate || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveStock(item.ticker)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Remove from portfolio"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
