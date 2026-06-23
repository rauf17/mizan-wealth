"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/Button";
import Card from "../components/Card";
import Logo from "../components/Logo";
import { useLang } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useTypingEffect } from "../hooks/useTypingEffect";

export default function Home() {
  const { lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const { displayedText, isTyping } = useTypingEffect(
    "A suite of local-first tools to calculate Zakat, evaluate stock purification, project compound growth, and model inheritance. All data is processed and stored locally in your browser.",
    18
  );



  const handleInfoClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveModal(activeModal === id ? null : id);
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-background text-foreground font-sans">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo variant="full" />
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 select-none uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Local-First
            </span>
            <span className="hidden sm:inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 select-none uppercase tracking-wide">
              1446 AH
            </span>
            <button
              onClick={toggleTheme}
              className="text-slate-500 hover:text-slate-900 transition-colors"
              title={theme === "dark" ? "Light Mode" : "Dark Mode"}
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
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
          <h1 className="font-hero max-w-4xl mb-6 text-gold-shimmer">
            Balance Your Wealth with Islamic Principles
          </h1>
        </div>

        <div className="animate-fade-in opacity-0 min-h-[80px]" style={{ animationDelay: "100ms" }}>
          <p className="text-slate-500 text-base md:text-lg max-w-2xl mb-12 leading-relaxed">
            {displayedText}
            {isTyping && <span className="animate-[blink_0.8s_ease-in-out_infinite]">|</span>}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="w-full flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl text-left">
          {/* Card 1: Zakat */}
          <div onClick={() => router.push("/dashboard")} className="block group h-full cursor-pointer animate-fade-in opacity-0" style={{ animationDelay: "0ms" }}>
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
          </div>

          {/* Card 2: Stock Purity */}
          <div onClick={() => router.push("/screener")} className="block group h-full cursor-pointer animate-fade-in opacity-0" style={{ animationDelay: "120ms" }}>
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
          </div>

          {/* Card 3: Growth */}
          <div onClick={() => router.push("/dashboard")} className="block group h-full cursor-pointer animate-fade-in opacity-0" style={{ animationDelay: "240ms" }}>
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
          </div>

          {/* Card 4: Inheritance */}
          <div onClick={() => router.push("/inheritance")} className="block group h-full cursor-pointer animate-fade-in opacity-0" style={{ animationDelay: "360ms" }}>
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
          </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-card py-8">
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
      {/* Modal Overlay */}
      {activeModal && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-card rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl animate-fade-in"
            onClick={handleModalClick}
          >
            {activeModal === "zakat" && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-h2 text-foreground">Zakat Calculator</h2>
                  <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="font-body space-y-3 mb-6 text-sm text-slate-600">
                  <p><strong>How it works:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Live gold/silver prices from GoldAPI determine the Nisab threshold.</li>
                    <li>Assets must have been held for one full lunar year (Hawl) to be zakatable.</li>
                    <li>Zakat is 2.5% of net eligible wealth above the Nisab.</li>
                  </ul>
                  <p><strong>Nisab standards explained:</strong> Silver (612g, ~$565 today) vs Gold (87.48g, ~$6,400 today) — silver standard is recommended as it maximises support for Zakat recipients.</p>
                  <p><strong>Quick example:</strong> &quot;$50,000 cash held for 1+ year &rarr; above silver Nisab &rarr; 2.5% = $1,250 due&quot;</p>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <Button variant="secondary" onClick={() => setActiveModal(null)}>Close</Button>
                  <Button onClick={() => router.push("/dashboard")}>Go to Calculator</Button>
                </div>
              </>
            )}

            {activeModal === "screener" && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-h2 text-foreground">Purity Screener</h2>
                  <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="font-body space-y-3 mb-6 text-sm text-slate-600">
                  <p><strong>Three screening criteria with thresholds:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Debt/Market Cap &lt; 33%</li>
                    <li>Cash/Assets &lt; 33%</li>
                    <li>Interest Income/Revenue &lt; 5%</li>
                  </ul>
                  <p><strong>Purification explained:</strong> if a compliant stock generates some interest income, you donate that percentage of your dividends received to charity — not the stock value itself.</p>
                  <p className="text-xs text-slate-400 italic">Note: the screener uses standard AAOIFI-based criteria. Complex cases may differ.</p>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <Button variant="secondary" onClick={() => setActiveModal(null)}>Close</Button>
                  <Button onClick={() => router.push("/screener")}>Go to Screener</Button>
                </div>
              </>
            )}

            {activeModal === "growth" && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-h2 text-foreground">Growth Projection</h2>
                  <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="font-body space-y-3 mb-6 text-sm text-slate-600">
                  <p><strong>What the simulator models:</strong> starting balance + annual contributions, compounded at your chosen return rate, over 1–30 years.</p>
                  <p><strong>Zakat deduction impact:</strong> deducting 2.5% annually shows the true long-term wealth trajectory after obligations — typically 15–20% lower over 20 years vs ignoring Zakat.</p>
                  <p><strong>Purification rate:</strong> an additional % deducted annually, representing stock dividend purification for equity-heavy portfolios.</p>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <Button variant="secondary" onClick={() => setActiveModal(null)}>Close</Button>
                  <Button onClick={() => router.push("/dashboard")}>Go to Projection</Button>
                </div>
              </>
            )}

            {activeModal === "inheritance" && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-h2 text-foreground">Inheritance Modeler</h2>
                  <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="font-body space-y-3 mb-6 text-sm text-slate-600">
                  <p><strong>Fard (fixed shares) vs Asabah (residuary):</strong></p>
                  <p>Some heirs get a fixed fraction first (e.g. wife gets 1/8 if children exist), the remainder goes to Asabah heirs (sons/daughters).</p>
                  <p><strong>Awl:</strong> if fixed shares sum to more than 100%, they are reduced proportionally.</p>
                  <p className="text-xs text-slate-400 italic">Limitation note: covers common scenarios (spouse + parents + children). Complex cases with grandparents, siblings, or multiple generations need a scholar.</p>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <Button variant="secondary" onClick={() => setActiveModal(null)}>Close</Button>
                  <Button onClick={() => router.push("/inheritance")}>Go to Modeler</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
