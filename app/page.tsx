"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Button from "../components/Button";
import Card from "../components/Card";
import Logo from "../components/Logo";
import { useLang } from "../context/LanguageContext";

export default function Home() {
  const { lang, setLang } = useLang();
  const [activePopup, setActivePopup] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => {
      setActivePopup(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleInfoClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActivePopup(activePopup === id ? null : id);
  };

  const handlePopupClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-background text-foreground font-sans">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo variant="full" />
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 select-none uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Local-First
            </span>
            <button
              onClick={() => setLang(lang === "en" ? "ur" : "en")}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              اردو / EN
            </button>
            <Button href="/dashboard">
              Enter Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20 flex-1 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-600 mb-8 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Islamic Ethical Wealth Calculator
        </div>

        <div className="animate-fade-in opacity-0" style={{ animationDelay: "0ms" }}>
          <h1 className="font-hero max-w-4xl mb-6">
            Balance Your Wealth with Islamic Principles
          </h1>
        </div>

        <div className="animate-fade-in opacity-0" style={{ animationDelay: "100ms" }}>
          <p className="text-slate-500 text-base md:text-lg max-w-2xl mb-12 leading-relaxed">
            A suite of local-first tools to calculate Zakat, evaluate stock purification, project compound growth, and model inheritance. All data is processed and stored locally in your browser.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="animate-fade-in opacity-0 w-full flex justify-center" style={{ animationDelay: "200ms" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl text-left">
          {/* Card 1: Zakat */}
          <Link href="/dashboard" className="block group h-full">
            <Card className="hover:border-slate-300 relative h-full flex flex-col">
              <button
                className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-primary z-10"
                onClick={(e) => handleInfoClick(e, "zakat")}
                aria-label="More info"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              {activePopup === "zakat" && (
                <div 
                  className="absolute top-10 right-3 bg-white border border-slate-200 rounded-xl p-4 shadow-xl w-72 text-xs text-slate-600 leading-relaxed z-20 animate-fade-in"
                  onClick={handlePopupClick}
                >
                  <h4 className="font-heading font-bold text-slate-900 text-sm mb-2">Zakat Calculator</h4>
                  Calculate your annual Zakat obligation using live gold and silver prices. Add your assets (cash, gold, stocks, real estate) and liabilities. The engine checks the Hawl rule (1 lunar year holding period) and compares your net wealth against the Nisab threshold to determine if Zakat is due and at what amount.
                </div>
              )}

              <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-primary mb-5 group-hover:scale-105 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-h3 mb-2">Zakat Calculator</h3>
              <p className="font-body text-xs flex-1">
                Calculate Nisab thresholds using live rates, list liabilities, and track different asset classes.
              </p>
            </Card>
          </Link>

          {/* Card 2: Stock Purity */}
          <Link href="/screener" className="block group h-full">
            <Card className="hover:border-slate-300 relative h-full flex flex-col">
              <button
                className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-primary z-10"
                onClick={(e) => handleInfoClick(e, "screener")}
                aria-label="More info"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              {activePopup === "screener" && (
                <div 
                  className="absolute top-10 right-3 bg-white border border-slate-200 rounded-xl p-4 shadow-xl w-72 text-xs text-slate-600 leading-relaxed z-20 animate-fade-in"
                  onClick={handlePopupClick}
                >
                  <h4 className="font-heading font-bold text-slate-900 text-sm mb-2">Stock Purity Screener</h4>
                  Screen equity investments against standard Shariah compliance criteria: debt-to-market-cap ratio (&lt; 33%), cash ratio (&lt; 33%), and interest income ratio (&lt; 5%). For compliant stocks, calculates the exact dividend purification percentage required.
                </div>
              )}

              <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-primary mb-5 group-hover:scale-105 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-h3 mb-2">Purity Screener</h3>
              <p className="font-body text-xs flex-1">
                Screen stock assets against debt, cash, and interest income thresholds to identify required purification amounts.
              </p>
            </Card>
          </Link>

          {/* Card 3: Growth */}
          <Link href="/dashboard" className="block group h-full">
            <Card className="hover:border-slate-300 relative h-full flex flex-col">
              <button
                className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-primary z-10"
                onClick={(e) => handleInfoClick(e, "growth")}
                aria-label="More info"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              {activePopup === "growth" && (
                <div 
                  className="absolute top-10 right-3 bg-white border border-slate-200 rounded-xl p-4 shadow-xl w-72 text-xs text-slate-600 leading-relaxed z-20 animate-fade-in"
                  onClick={handlePopupClick}
                >
                  <h4 className="font-heading font-bold text-slate-900 text-sm mb-2">Compound Growth Simulator</h4>
                  Model your wealth growth over 1–30 years with configurable annual return rate and contributions. Optionally deduct annual Zakat (2.5%) and dividend purification rates to see their real long-term effect on your net wealth trajectory.
                </div>
              )}

              <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-primary mb-5 group-hover:scale-105 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-h3 mb-2">Growth Projection</h3>
              <p className="font-body text-xs flex-1">
                Model wealth growth over time by projecting contributions and deducting Zakat or purification rates.
              </p>
            </Card>
          </Link>

          {/* Card 4: Inheritance */}
          <Link href="/inheritance" className="block group h-full">
            <Card className="hover:border-slate-300 relative h-full flex flex-col">
              <button
                className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-primary z-10"
                onClick={(e) => handleInfoClick(e, "inheritance")}
                aria-label="More info"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              {activePopup === "inheritance" && (
                <div 
                  className="absolute top-10 right-3 bg-white border border-slate-200 rounded-xl p-4 shadow-xl w-72 text-xs text-slate-600 leading-relaxed z-20 animate-fade-in"
                  onClick={handlePopupClick}
                >
                  <h4 className="font-heading font-bold text-slate-900 text-sm mb-2">Inheritance Modeler</h4>
                  Calculate the distribution of an estate among heirs according to Islamic jurisprudence (Fard fixed shares + Asabah residuary). Supports spouse, parents, sons, and daughters. Applies Awl proportional reduction if fixed shares exceed the estate.
                </div>
              )}

              <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-primary mb-5 group-hover:scale-105 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-h3 mb-2">Inheritance Modeler</h3>
              <p className="font-body text-xs flex-1">
                Calculate inheritance distributions based on Islamic jurisprudence rules.
              </p>
            </Card>
          </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; 2026 Mizan Wealth. Balance your wealth. Know what&apos;s due.
          </div>
          <div className="flex gap-4">
            <span className="font-medium">Secure & Private (Local Storage Only)</span>
          </div>
        </div>
        <div className="text-center text-slate-400 text-[11px] mt-4">
          Built with <span className="text-accent">♥</span> for the Muslim community
        </div>
      </footer>
    </div>
  );
}
