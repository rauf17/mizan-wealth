"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "../../components/DashboardShell";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Select from "../../components/Select";
import { getData, saveData, STORAGE_KEYS } from "../../lib/storage";
import { ZakatAsset, ZakatLiability, AssetType } from "../../types";

export default function AssetsPage() {
  // Client state loading protection
  const [mounted, setMounted] = useState(false);
  const [assets, setAssets] = useState<ZakatAsset[]>([]);
  const [liabilities, setLiabilities] = useState<ZakatLiability[]>([]);

  // Asset Form State
  const [assetType, setAssetType] = useState<AssetType>("cash");
  const [assetName, setAssetName] = useState("");
  const [assetValue, setAssetValue] = useState("");
  const [zakatablePercent, setZakatablePercent] = useState("100");
  const [acquisitionDate, setAcquisitionDate] = useState("");

  // Liability Form State
  const [liabilityName, setLiabilityName] = useState("");
  const [liabilityValue, setLiabilityValue] = useState("");

  useEffect(() => {
    setMounted(true);
    setAssets(getData<ZakatAsset[]>(STORAGE_KEYS.ZAKAT_ASSETS, []));
    setLiabilities(getData<ZakatLiability[]>(STORAGE_KEYS.ZAKAT_LIABILITIES, []));
    // Default acquisition date to today
    setAcquisitionDate(new Date().toISOString().split("T")[0]);
  }, []);

  // Update localStorage when state changes
  const saveAssetsToStorage = (updated: ZakatAsset[]) => {
    setAssets(updated);
    saveData(STORAGE_KEYS.ZAKAT_ASSETS, updated);
  };

  const saveLiabilitiesToStorage = (updated: ZakatLiability[]) => {
    setLiabilities(updated);
    saveData(STORAGE_KEYS.ZAKAT_LIABILITIES, updated);
  };

  // Asset Form Submission
  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName || !assetValue || isNaN(Number(assetValue))) return;

    const val = Math.max(0, Number(assetValue));
    const pct = Math.min(100, Math.max(0, Number(zakatablePercent))) / 100;
    const zakAmount = val * pct;

    const newAsset: ZakatAsset = {
      id: `asset_${Date.now()}`,
      type: assetType,
      name: assetName.trim(),
      value: val,
      zakatableAmount: zakAmount,
      acquisitionDate: acquisitionDate || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };

    saveAssetsToStorage([...assets, newAsset]);

    // Reset Form fields
    setAssetName("");
    setAssetValue("");
  };

  // Liability Form Submission
  const handleAddLiability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liabilityName || !liabilityValue || isNaN(Number(liabilityValue))) return;

    const val = Math.max(0, Number(liabilityValue));

    const newLiability: ZakatLiability = {
      id: `liability_${Date.now()}`,
      name: liabilityName.trim(),
      value: val,
      createdAt: new Date().toISOString(),
    };

    saveLiabilitiesToStorage([...liabilities, newLiability]);

    // Reset Form fields
    setLiabilityName("");
    setLiabilityValue("");
  };

  // Delete Asset
  const handleDeleteAsset = (id: string) => {
    const updated = assets.filter((item) => item.id !== id);
    saveAssetsToStorage(updated);
  };

  // Delete Liability
  const handleDeleteLiability = (id: string) => {
    const updated = liabilities.filter((item) => item.id !== id);
    saveLiabilitiesToStorage(updated);
  };

  // Set default zakatable ratio on asset type change
  const handleTypeChange = (type: AssetType) => {
    setAssetType(type);
    if (type === "cash" || type === "gold" || type === "silver" || type === "crypto") {
      setZakatablePercent("100");
    } else if (type === "stock") {
      setZakatablePercent("100"); // typical default, screening might purify it
    } else if (type === "real_estate") {
      setZakatablePercent("10"); // e.g. rental income portion baseline
    } else {
      setZakatablePercent("100");
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-slate-400 animate-pulse font-semibold">Loading ledger...</span>
      </div>
    );
  }

  const assetTypeLabels: Record<AssetType, string> = {
    cash: "Cash / Bank savings",
    gold: "Gold (Jewelry/Coins)",
    silver: "Silver (Jewelry/Coins)",
    stock: "Shares / Stocks portfolio",
    real_estate: "Real Estate (Rental/Sales)",
    business: "Business Assets / Merch",
    crypto: "Cryptocurrency",
    other: "Other Assets",
  };

  return (
    <DashboardShell>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Page Header */}
        <div>
          <h1 className="font-h1 text-primary">
            Asset & Liability Ledger
          </h1>
          <p className="text-slate-500 mt-1 text-sm leading-relaxed">
            Maintain your inventory of wealth. Your data is stored fully offline in your browser.
          </p>
        </div>

        {/* Form and List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Forms */}
          <div className="lg:col-span-5 space-y-6">
            {/* Add Asset Form Card */}
            <Card>
              <h2 className="text-sm font-heading font-bold text-slate-800 mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Add Asset
              </h2>
              <form onSubmit={handleAddAsset} className="space-y-4">
                <Select
                  label="Asset Class"
                  value={assetType}
                  onChange={(e) => handleTypeChange(e.target.value as AssetType)}
                >
                  {Object.entries(assetTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>

                <Input
                  type="text"
                  required
                  label="Description / Name"
                  placeholder="e.g. Chase Savings, Gold Ring"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    required
                    min="0"
                    step="any"
                    label="Value ($)"
                    placeholder="0.00"
                    value={assetValue}
                    onChange={(e) => setAssetValue(e.target.value)}
                  />

                  <Input
                    type="number"
                    required
                    min="0"
                    max="100"
                    label="Zakatable %"
                    value={zakatablePercent}
                    onChange={(e) => setZakatablePercent(e.target.value)}
                  />
                </div>

                <Input
                  type="date"
                  required
                  label="Acquisition Date (Hawl Start)"
                  value={acquisitionDate}
                  onChange={(e) => setAcquisitionDate(e.target.value)}
                />

                <Button type="submit" className="w-full">
                  Record Asset
                </Button>
              </form>
            </Card>

            {/* Add Liability Form Card */}
            <Card>
              <h2 className="text-sm font-heading font-bold text-slate-800 mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Add Liability
              </h2>
              <form onSubmit={handleAddLiability} className="space-y-4">
                <Input
                  type="text"
                  required
                  label="Liability Description"
                  placeholder="e.g. Credit Card Balance, Car Loan Installment"
                  value={liabilityName}
                  onChange={(e) => setLiabilityName(e.target.value)}
                />

                <Input
                  type="number"
                  required
                  min="0"
                  step="any"
                  label="Amount ($)"
                  placeholder="0.00"
                  value={liabilityValue}
                  onChange={(e) => setLiabilityValue(e.target.value)}
                />

                <Button type="submit" className="w-full">
                  Record Liability
                </Button>
              </form>
            </Card>
          </div>

          {/* Right Column: Ledger Summaries and Lists */}
          <div className="lg:col-span-7 space-y-6">
            {/* Assets List */}
            <Card>
              <h2 className="text-sm font-heading font-bold text-slate-800 mb-5 flex items-center justify-between">
                <span>Asset Inventory Ledger</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/10 select-none">
                  {assets.length} Item{assets.length !== 1 ? "s" : ""}
                </span>
              </h2>

              {assets.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-400 text-xs font-semibold">No assets recorded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[10px] text-slate-400 uppercase border-b border-slate-100 pb-2">
                        <th className="py-2.5 font-bold tracking-wider">Asset Details</th>
                        <th className="py-2.5 font-bold tracking-wider text-right">Market Value</th>
                        <th className="py-2.5 font-bold tracking-wider text-right">Zakatable</th>
                        <th className="py-2.5 font-bold tracking-wider text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {assets.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 pr-2">
                            <div className="font-bold text-slate-800">{item.name}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>{assetTypeLabels[item.type]}</span>
                              <span>&bull;</span>
                              <span>Held since: {item.acquisitionDate}</span>
                            </div>
                          </td>
                          <td className="py-3 text-right font-semibold text-slate-700">
                            ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 text-right text-primary font-extrabold">
                            ${item.zakatableAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => handleDeleteAsset(item.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-colors"
                              title="Delete item"
                            >
                              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Liabilities List */}
            <Card>
              <h2 className="text-sm font-heading font-bold text-slate-800 mb-5 flex items-center justify-between">
                <span>Liabilities Ledger</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 select-none">
                  {liabilities.length} Item{liabilities.length !== 1 ? "s" : ""}
                </span>
              </h2>

              {liabilities.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-400 text-xs font-semibold">No liabilities recorded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[10px] text-slate-400 uppercase border-b border-slate-100 pb-2">
                        <th className="py-2.5 font-bold tracking-wider">Description</th>
                        <th className="py-2.5 font-bold tracking-wider text-right">Amount</th>
                        <th className="py-2.5 font-bold tracking-wider text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {liabilities.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 pr-2">
                            <div className="font-bold text-slate-800">{item.name}</div>
                          </td>
                          <td className="py-3 text-right font-semibold text-slate-600">
                            -${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => handleDeleteLiability(item.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-colors"
                              title="Delete item"
                            >
                              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
