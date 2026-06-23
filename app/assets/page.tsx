"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "../../components/DashboardShell";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Select from "../../components/Select";
import { useCurrency } from "../../context/CurrencyContext";
import { getData, saveData, STORAGE_KEYS } from "../../lib/storage";
import { ZakatAsset, ZakatLiability, AssetType } from "../../types";

export default function AssetsPage() {
  const { currency, convert, format } = useCurrency();
  // Client state loading protection
  const [mounted, setMounted] = useState(false);
  const [assets, setAssets] = useState<ZakatAsset[]>([]);
  const [liabilities, setLiabilities] = useState<ZakatLiability[]>([]);

  // Editing state
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editingLiabilityId, setEditingLiabilityId] = useState<string | null>(null);

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

    if (editingAssetId) {
      const updated = assets.map(a => 
        a.id === editingAssetId 
          ? { ...a, type: assetType, name: assetName.trim(), value: val, zakatableAmount: zakAmount, acquisitionDate: acquisitionDate || a.acquisitionDate } 
          : a
      );
      saveAssetsToStorage(updated);
      setEditingAssetId(null);
    } else {
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
    }

    // Reset Form fields
    setAssetName("");
    setAssetValue("");
    setZakatablePercent("100");
    setAssetType("cash");
    setAcquisitionDate(new Date().toISOString().split("T")[0]);
  };

  // Liability Form Submission
  const handleAddLiability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liabilityName || !liabilityValue || isNaN(Number(liabilityValue))) return;

    const val = Math.max(0, Number(liabilityValue));

    if (editingLiabilityId) {
      const updated = liabilities.map(l => 
        l.id === editingLiabilityId 
          ? { ...l, name: liabilityName.trim(), value: val } 
          : l
      );
      saveLiabilitiesToStorage(updated);
      setEditingLiabilityId(null);
    } else {
      const newLiability: ZakatLiability = {
        id: `liability_${Date.now()}`,
        name: liabilityName.trim(),
        value: val,
        createdAt: new Date().toISOString(),
      };
      saveLiabilitiesToStorage([...liabilities, newLiability]);
    }

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

  // Edit Handlers
  const handleEditAsset = (asset: ZakatAsset) => {
    setAssetType(asset.type);
    setAssetName(asset.name);
    setAssetValue(asset.value.toString());
    setZakatablePercent(Math.round((asset.zakatableAmount / asset.value) * 100).toString());
    setAcquisitionDate(asset.acquisitionDate);
    setEditingAssetId(asset.id);
  };

  const handleEditLiability = (liability: ZakatLiability) => {
    setLiabilityName(liability.name);
    setLiabilityValue(liability.value.toString());
    setEditingLiabilityId(liability.id);
  };

  const cancelAssetEdit = () => {
    setEditingAssetId(null);
    setAssetName("");
    setAssetValue("");
  };

  const cancelLiabilityEdit = () => {
    setEditingLiabilityId(null);
    setLiabilityName("");
    setLiabilityValue("");
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
          <h1 className="font-h1">
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
              <form onSubmit={handleAddAsset} className="space-y-6">
                {/* Group 1: Classification */}
                <div className="space-y-4">
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
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100" />

                {/* Group 2: Valuation */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Valuation & Timing
                  </span>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      required
                      min="0"
                      step="any"
                      label={`Value (${currency})`}
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
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">
                    {editingAssetId ? "Update Asset" : "Record Asset"}
                  </Button>
                  {editingAssetId && (
                    <Button type="button" variant="secondary" onClick={cancelAssetEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
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
              <form onSubmit={handleAddLiability} className="space-y-6">
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
                  label={`Amount (${currency})`}
                  placeholder="0.00"
                  value={liabilityValue}
                  onChange={(e) => setLiabilityValue(e.target.value)}
                />

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">
                    {editingLiabilityId ? "Update Liability" : "Record Liability"}
                  </Button>
                  {editingLiabilityId && (
                    <Button type="button" variant="secondary" onClick={cancelLiabilityEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </div>

          {/* Right Column: Ledger Summaries and Lists */}
          <div className="lg:col-span-7 space-y-6">
            {/* Assets List */}
            <Card>
              <h2 className="text-sm font-heading font-bold text-slate-800 mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                <span>Asset Inventory Ledger</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/10 select-none">
                  {assets.length} Item{assets.length !== 1 ? "s" : ""}
                </span>
              </h2>

              {assets.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-400 text-xs font-semibold">No assets recorded yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {assets.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between py-4 first:pt-0 last:pb-0 gap-4 hover:bg-slate-50/30 transition-colors px-1"
                    >
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800 text-sm block">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          <span>{assetTypeLabels[item.type]}</span>
                          <span>&bull;</span>
                          <span>Held since {item.acquisitionDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-8">
                        <div className="text-right hidden sm:block">
                          <span className="block font-semibold text-slate-700">
                            {format(convert(item.value, "USD", currency))}
                          </span>
                          <span className="block text-[10px] text-slate-400 uppercase">
                            Market Value
                          </span>
                        </div>

                        <div className="text-right hidden sm:block">
                          <span className="block font-semibold text-primary">
                            {format(convert(item.zakatableAmount, "USD", currency))}
                          </span>
                          <span className="block text-[10px] text-slate-400 uppercase">
                            Zakatable
                          </span>
                        </div>

                        <div className="flex items-center">
                          <button
                            onClick={() => handleEditAsset(item)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors"
                            title="Edit asset"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(item.id)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                            title="Delete asset"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Liabilities List */}
            <Card>
              <h2 className="text-sm font-heading font-bold text-slate-800 mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                <span>Liabilities Ledger</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 select-none">
                  {liabilities.length} Item{liabilities.length !== 1 ? "s" : ""}
                </span>
              </h2>

              {liabilities.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-400 text-xs font-semibold">No liabilities recorded yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {liabilities.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4 hover:bg-slate-50/30 transition-colors px-1"
                    >
                      <div>
                        <span className="font-bold text-slate-800 text-sm block">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">
                          Short-Term Debt Deduction
                        </span>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="block font-semibold text-slate-800">
                            {format(convert(item.value, "USD", currency))}
                          </span>
                          <span className="block text-[10px] text-slate-400 uppercase">
                            Deducted
                          </span>
                        </div>

                        <div className="flex items-center">
                          <button
                            onClick={() => handleEditLiability(item)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors"
                            title="Edit liability"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteLiability(item.id)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                            title="Delete liability"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
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
