export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col justify-between">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-500/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center font-heading font-bold text-white shadow-lg shadow-emerald-500/20">
              M
            </div>
            <span className="font-heading font-bold text-lg tracking-wider text-white">
              MIZAN WEALTH
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Local-First
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20 flex-1 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-sm text-emerald-400 mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Modern Halal Wealth Management
        </div>

        <h1 className="text-4xl md:text-6xl font-heading font-extrabold tracking-tight max-w-4xl leading-tight mb-6">
          Balance Your Wealth with{" "}
          <span className="text-gradient">Islamic Principles</span>
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-12">
          An elegant suite of local-first tools designed to calculate zakat, analyze stock purity, project growth, and model inheritance — all securely stored in your browser.
        </p>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl text-left">
          {/* Card 1: Zakat */}
          <div className="group relative p-6 rounded-2xl bg-card border border-border/50 hover:border-emerald-500/30 transition-all duration-300 shadow-xl shadow-black/20 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-heading font-bold text-lg text-white mb-2">Zakat Calculator</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Calculate Nisab values in real-time, deduct liabilities, and track different asset classes seamlessly.
            </p>
          </div>

          {/* Card 2: Stock Purity */}
          <div className="group relative p-6 rounded-2xl bg-card border border-border/50 hover:border-emerald-500/30 transition-all duration-300 shadow-xl shadow-black/20 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-heading font-bold text-lg text-white mb-2">Purity Screener</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Assess stock portfolios based on debt, cash, interest income ratios, and purify non-compliant gains.
            </p>
          </div>

          {/* Card 3: Growth */}
          <div className="group relative p-6 rounded-2xl bg-card border border-border/50 hover:border-emerald-500/30 transition-all duration-300 shadow-xl shadow-black/20 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-heading font-bold text-lg text-white mb-2">Growth Projection</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Model compound growth, simulate regular contributions, and deduct zakat/purification rates to see net halal yield.
            </p>
          </div>

          {/* Card 4: Inheritance */}
          <div className="group relative p-6 rounded-2xl bg-card border border-border/50 hover:border-emerald-500/30 transition-all duration-300 shadow-xl shadow-black/20 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="font-heading font-bold text-lg text-white mb-2">Inheritance Modeler</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Calculate legal shares of your estate for heirs automatically based on Islamic jurisprudence rules.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 py-8 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>
            &copy; 2026 Mizan Wealth. All rights reserved.
          </div>
          <div className="flex gap-4">
            <span>Secure & Private (Local Storage Only)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
