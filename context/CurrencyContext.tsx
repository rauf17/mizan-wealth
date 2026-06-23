"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export const SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar", locale: "en-US" },
  { code: "PKR", symbol: "₨", label: "Pakistani Rupee", locale: "ur-PK" }
];

interface CurrencyContextType {
  currency: string;
  setCurrency: (c: string) => void;
  fxRates: Record<string, number>;
  convert: (amount: number, from: string, to: string) => number;
  format: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState("USD");
  const [fxRates, setFxRates] = useState<Record<string, number>>({});

  useEffect(() => {
    const saved = localStorage.getItem("mizan_currency");
    if (saved) setCurrencyState(saved);

    fetch("/api/prices/fx?base=USD")
      .then(res => res.json())
      .then(data => {
        if (data.rates) {
          setFxRates(data.rates);
        }
      })
      .catch(err => console.error("Failed to fetch fx rates:", err));
  }, []);

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    localStorage.setItem("mizan_currency", c);
  };

  const convert = (amount: number, from: string, to: string) => {
    if (from === to) return amount;
    if (!fxRates || Object.keys(fxRates).length === 0) return amount;
    
    const amountInUSD = from === "USD" ? amount : amount / (fxRates[from] || 1);
    return to === "USD" ? amountInUSD : amountInUSD * (fxRates[to] || 1);
  };

  const format = (amount: number) => {
    const activeCurrency = SUPPORTED_CURRENCIES.find(c => c.code === currency) || SUPPORTED_CURRENCIES[0];
    return new Intl.NumberFormat(activeCurrency.locale, {
      style: "currency",
      currency: activeCurrency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, fxRates, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
