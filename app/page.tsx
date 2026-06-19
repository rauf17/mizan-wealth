import Link from "next/link";
import Button from "../components/Button";
import Card from "../components/Card";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-background text-foreground font-sans">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-heading font-bold text-white shadow-sm">
              M
            </div>
            <span className="font-heading font-bold text-base tracking-wider text-primary">
              MIZAN WEALTH
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 select-none uppercase tracking-wide">
              Local-First
            </span>
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
          Modern Halal Wealth Management
        </div>

        <h1 className="font-hero max-w-4xl mb-6">
          Balance Your Wealth with Islamic Principles
        </h1>

        <p className="text-slate-500 text-base md:text-lg max-w-2xl mb-12 leading-relaxed">
          An elegant suite of local-first tools designed to calculate Zakat, analyze stock purity, project growth, and model inheritance — all securely stored in your browser.
        </p>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl text-left">
          {/* Card 1: Zakat */}
          <Link href="/dashboard" className="block group">
            <Card className="hover:border-slate-300">
              <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-primary mb-5 group-hover:scale-105 transition-transform duration-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-h3 mb-2">Zakat Calculator</h3>
              <p className="font-body text-xs">
                Calculate Nisab values in real-time, deduct liabilities, and track different asset classes seamlessly.
              </p>
            </Card>
          </Link>

          {/* Card 2: Stock Purity */}
          <Link href="/dashboard" className="block group">
            <Card className="hover:border-slate-300">
              <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-primary mb-5 group-hover:scale-105 transition-transform duration-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-h3 mb-2">Purity Screener</h3>
              <p className="font-body text-xs">
                Assess stock portfolios based on debt, cash, interest income ratios, and purify non-compliant gains.
              </p>
            </Card>
          </Link>

          {/* Card 3: Growth */}
          <Link href="/dashboard" className="block group">
            <Card className="hover:border-slate-300">
              <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-primary mb-5 group-hover:scale-105 transition-transform duration-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-h3 mb-2">Growth Projection</h3>
              <p className="font-body text-xs">
                Model compound growth, simulate regular contributions, and deduct Zakat/purification rates to see net halal yield.
              </p>
            </Card>
          </Link>

          {/* Card 4: Inheritance */}
          <Link href="/dashboard" className="block group">
            <Card className="hover:border-slate-300">
              <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-primary mb-5 group-hover:scale-105 transition-transform duration-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-h3 mb-2">Inheritance Modeler</h3>
              <p className="font-body text-xs">
                Calculate legal shares of your estate for heirs automatically based on Islamic jurisprudence rules.
              </p>
            </Card>
          </Link>
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
      </footer>
    </div>
  );
}
