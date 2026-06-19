"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "../../components/DashboardShell";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { getData, STORAGE_KEYS } from "../../lib/storage";
import { calculateZakat } from "../../lib/zakatEngine";
import { fetchMetalRates, DEFAULT_METAL_RATES } from "../../lib/api";
import { exportToPDF } from "../../lib/pdfExport";
import { exportToExcel } from "../../lib/excelExport";
import { ZakatAsset, ZakatLiability, MetalRates, ZakatCalculationResult } from "../../types";

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [assets, setAssets] = useState<ZakatAsset[]>([]);
  const [liabilities, setLiabilities] = useState<ZakatLiability[]>([]);
  const [rates, setRates] = useState<MetalRates>(DEFAULT_METAL_RATES);
  const [settings, setSettings] = useState({
    nisabStandard: "silver" as "gold" | "silver",
    currency: "USD",
  });
  
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setAssets(getData<ZakatAsset[]>(STORAGE_KEYS.ZAKAT_ASSETS, []));
    setLiabilities(getData<ZakatLiability[]>(STORAGE_KEYS.ZAKAT_LIABILITIES, []));
    setSettings(getData(STORAGE_KEYS.SETTINGS, {
      nisabStandard: "silver" as "gold" | "silver",
      currency: "USD",
    }));

    const loadRates = async () => {
      const liveRates = await fetchMetalRates();
      setRates(liveRates);
    };
    loadRates();
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-slate-400 animate-pulse font-semibold">Loading reports...</span>
      </div>
    );
  }

  const totalLiabilitiesVal = liabilities.reduce((sum, item) => sum + item.value, 0);
  const result: ZakatCalculationResult = calculateZakat(
    assets,
    totalLiabilitiesVal,
    rates,
    settings.nisabStandard
  );

  const triggerPDFExport = async () => {
    setExportMessage("Compiling PDF document...");
    const success = await exportToPDF({
      calculation: result,
      assets,
      liabilities: totalLiabilitiesVal,
    });
    if (success) {
      setExportMessage("PDF statement exported successfully.");
    } else {
      setExportMessage("Failed to export PDF statement.");
    }
    setTimeout(() => setExportMessage(null), 3000);
  };

  const triggerCSVExport = async () => {
    setExportMessage("Compiling spreadsheet report...");
    const success = await exportToExcel(assets);
    if (success) {
      setExportMessage("Spreadsheet CSV statement downloaded successfully.");
    } else {
      setExportMessage("Failed to export spreadsheet.");
    }
    setTimeout(() => setExportMessage(null), 3000);
  };

  return (
    <DashboardShell>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="font-h1 text-primary">
            Financial Statement Reports
          </h1>
          <p className="text-slate-500 mt-1 text-sm leading-relaxed">
            Generate and export offline declarations of your Shariah asset inventories.
          </p>
        </div>

        {/* Action Message Banner */}
        {exportMessage && (
          <div className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-4 py-3 text-xs font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-500 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{exportMessage}</span>
          </div>
        )}

        {/* Export Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: PDF Export */}
          <Card className="flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-heading font-bold text-slate-800">Print Wealth Statement (PDF)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compile a professional, print-ready document containing your declaration summary, asset allocations ledger, and calculations variables.
              </p>
            </div>
            <Button
              onClick={triggerPDFExport}
              disabled={assets.length === 0}
              className="w-full"
            >
              Export PDF Statement
            </Button>
          </Card>

          {/* Card 2: CSV Spreadsheet Export */}
          <Card className="flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-sm font-heading font-bold text-slate-800">Spreadsheet Ledger (CSV)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Download a comma-separated values (.csv) spreadsheet file containing all recorded asset details. Easily importable into Microsoft Excel, Google Sheets, or Numbers.
              </p>
            </div>
            <Button
              onClick={triggerCSVExport}
              disabled={assets.length === 0}
              variant="secondary"
              className="w-full"
            >
              Download CSV Ledger
            </Button>
          </Card>
        </div>

        {/* Current Calculations Preview Panel */}
        <Card className="space-y-4">
          <h3 className="text-sm font-heading font-bold text-slate-800 pb-3 border-b border-slate-100">
            Statement Metadata Preview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Gross Assets</span>
              <strong className="text-base font-bold text-slate-900">${result.totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Deductions</span>
              <strong className="text-base font-bold text-slate-700">${result.totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Net Zakat Value</span>
              <strong className="text-base font-bold text-slate-900">${result.netZakatable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-accent uppercase tracking-wider block mb-1">Zakat Obligation</span>
              <strong className="text-base font-extrabold text-primary">${result.zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
