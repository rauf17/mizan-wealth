"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "../../components/DashboardShell";
import { getData, saveData, STORAGE_KEYS } from "../../lib/storage";
import { ZakatRecord } from "../../types";

export default function HistoryPage() {
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
        <span className="text-muted-foreground animate-pulse font-medium">Loading history...</span>
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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-primary tracking-tight">
            Declaration Log Book
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review historically compiled snapshots of your wealth balances.
          </p>
        </div>

        {/* Records Checklist */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          {records.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border/80 rounded-xl">
              <svg className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="font-bold text-primary mb-1">No Saved Declarations</h3>
              <p className="text-muted-foreground text-xs max-w-sm mx-auto leading-relaxed">
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
                    className="border border-border/60 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white"
                    onClick={() => toggleExpand(record.id)}
                  >
                    {/* Header Row */}
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-primary text-sm tracking-wide">
                            Declaration Snapshot
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/10">
                            {record.assets.length} Assets
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">{dateString}</div>
                      </div>

                      <div className="flex items-center gap-8">
                        {/* Net Zakatable */}
                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                            Net Assets
                          </span>
                          <span className="text-sm font-bold text-primary">
                            ${record.result.netZakatable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Zakat Due */}
                        <div className="text-right">
                          <span className="text-[10px] text-accent uppercase font-bold block">
                            Zakat Paid/Due
                          </span>
                          <span className="text-sm font-extrabold text-primary">
                            ${record.result.zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleDeleteRecord(record.id, e)}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                            title="Delete snapshot log"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <span className="text-muted-foreground/60">
                            {isExpanded ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Asset and Liability Breakdown */}
                    {isExpanded && (
                      <div className="p-5 border-t border-border/40 bg-white grid grid-cols-1 md:grid-cols-2 gap-8 cursor-default" onClick={(e) => e.stopPropagation()}>
                        {/* Assets list */}
                        <div>
                          <h4 className="font-heading font-bold text-sm text-primary mb-3">Recorded Assets</h4>
                          {record.assets.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No assets in this declaration.</p>
                          ) : (
                            <div className="space-y-2">
                              {record.assets.map((asset) => (
                                <div key={asset.id} className="flex justify-between items-center text-xs p-2 rounded-lg bg-muted/40">
                                  <div>
                                    <span className="font-semibold text-primary">{asset.name}</span>
                                    <span className="text-[10px] text-muted-foreground block">
                                      {assetTypeNames[asset.type]} &bull; Held since: {asset.acquisitionDate}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="block font-medium">${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    <span className="text-[10px] text-emerald-800 font-semibold block">
                                      Zakatable: ${asset.zakatableAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Liabilities list */}
                        <div>
                          <h4 className="font-heading font-bold text-sm text-primary mb-3">Deducted Liabilities</h4>
                          {record.liabilities.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No liabilities in this declaration.</p>
                          ) : (
                            <div className="space-y-2">
                              {record.liabilities.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-xs p-2 rounded-lg bg-muted/40">
                                  <span className="font-semibold text-primary">{item.name}</span>
                                  <span className="font-medium text-red-600">
                                    -${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </span>
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
        </div>
      </div>
    </DashboardShell>
  );
}
