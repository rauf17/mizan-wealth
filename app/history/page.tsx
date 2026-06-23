"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "../../components/DashboardShell";
import Card from "../../components/Card";
import { useCurrency } from "../../context/CurrencyContext";
import { getData, saveData, STORAGE_KEYS } from "../../lib/storage";
import { ZakatRecord } from "../../types";

export default function HistoryPage() {
  const { currency, convert, format } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [records, setRecords] = useState<ZakatRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setRecords(getData<ZakatRecord[]>(STORAGE_KEYS.CALCULATION_HISTORY, []));
  }, []);

  const handleDeleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid expanding/collapsing when clicking delete
    const updated = records.filter((item) => item.id !== id);
    setRecords(updated);
    saveData(STORAGE_KEYS.CALCULATION_HISTORY, updated);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-slate-400 animate-pulse font-semibold">Loading history...</span>
      </div>
    );
  }

  const assetTypeNames: Record<string, string> = {
    cash: "Cash/Bank",
    gold: "Gold Gold",
    silver: "Silver Silver",
    stock: "Shares Portfolio",
    real_estate: "Real Estate",
    business: "Business Trade",
    crypto: "Cryptocurrency",
    other: "Other Asset",
  };

  return (
    <DashboardShell>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="font-h1">
            Declaration Log Book
          </h1>
          <p className="text-slate-500 mt-1 text-sm leading-relaxed">
            Review historically compiled snapshots of your wealth balances.
          </p>
        </div>

        {/* Records Checklist */}
        <Card>
          {records.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl">
              <svg className="w-10 h-10 text-slate-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="font-bold text-slate-800 mb-1">No Saved Declarations</h3>
              <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                Calculate your position and select &ldquo;Save Declaration&rdquo; on the Overview screen to create historical logs.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => {
                const isExpanded = expandedId === record.id;
                const dateString = new Date(record.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={record.id}
                    className="mizan-card overflow-hidden transition-all duration-200 cursor-pointer p-0"
                    onClick={() => toggleExpand(record.id)}
                  >
                    {/* Header Row */}
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50/80 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-slate-800 text-sm tracking-wide">
                            Declaration Snapshot
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/10 select-none">
                            {record.assets.length} Assets
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-medium">{dateString}</div>
                      </div>

                      <div className="flex items-center gap-8">
                        {/* Net Zakatable */}
                        <div className="text-right">
                          <span className="text-xs text-slate-500 font-medium block mb-0.5">Net Zakatable</span>
                          <strong className="text-sm font-bold text-slate-900">
                            {format(convert(record.result.netZakatable, "USD", currency))}
                          </strong>
                        </div>

                        {/* Zakat Due */}
                        <div className="text-right">
                          <span className="text-xs text-slate-500 font-medium block mb-0.5">Zakat Due</span>
                          <strong className="text-sm font-bold text-accent">
                            {format(convert(record.result.zakatDue, "USD", currency))}
                          </strong>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => handleDeleteRecord(record.id, e)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                            title="Delete snapshot log"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <span className="text-slate-400">
                            {isExpanded ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Asset and Liability Breakdown */}
                    {isExpanded && (
                      <div className="p-5 border-t border-slate-100 bg-white grid grid-cols-1 md:grid-cols-2 gap-8 cursor-default" onClick={(e) => e.stopPropagation()}>
                        {/* Assets list */}
                        <div>
                          <h4 className="font-heading font-bold text-xs text-slate-800 uppercase tracking-wider mb-3">Recorded Assets</h4>
                          {record.assets.length === 0 ? (
                            <p className="text-xs text-slate-400">No assets in this declaration.</p>
                          ) : (
                            <div className="space-y-2">
                              {record.assets.map((asset) => (
                                <div key={asset.id} className="mizan-glass flex justify-between items-center text-xs p-2.5 rounded-lg border border-slate-100/50 shadow-sm hover:shadow-md transition-shadow">
                                  <div>
                                    <span className="font-bold text-slate-700">{asset.name}</span>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                      {assetTypeNames[asset.type]} &bull; Held since: {asset.acquisitionDate}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="block font-semibold text-slate-800">{format(convert(asset.value, "USD", currency))}</span>
                                    <span className="block text-[10px] text-slate-400">
                                      Zakatable: {format(convert(asset.zakatableAmount, "USD", currency))}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Liabilities list */}
                        <div>
                          <h4 className="font-heading font-bold text-xs text-slate-800 uppercase tracking-wider mb-3">Deducted Liabilities</h4>
                          {record.liabilities.length === 0 ? (
                            <p className="text-xs text-slate-400">No liabilities in this declaration.</p>
                          ) : (
                            <div className="space-y-2">
                              {record.liabilities.map((item) => (
                                <div key={item.id} className="mizan-glass flex justify-between items-center text-xs p-2.5 rounded-lg border border-slate-100/50 shadow-sm hover:shadow-md transition-shadow">
                                  <span className="font-bold text-slate-700">{item.name}</span>
                                  <div className="text-right">
                                    <span className="block font-semibold text-slate-800">
                                      -{format(convert(item.value, "USD", currency))}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
