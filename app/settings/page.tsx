import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-border/40 pb-6">
          <div>
            <h1 className="text-3xl font-heading font-bold text-white">Settings</h1>
            <p className="text-muted-foreground text-sm">Configure currency, metal source options, default jurisprudence and Nisab calculations</p>
          </div>
          <Link
            href="/"
            className="text-xs px-3.5 py-2 rounded-lg bg-card border border-border/50 text-white hover:border-emerald-500/30 transition-colors"
          >
            &larr; Back Home
          </Link>
        </header>

        <main className="p-6 rounded-2xl bg-card border border-border/50">
          <p className="text-muted-foreground text-sm">Jurisprudence and calculations configuration stub page.</p>
        </main>
      </div>
    </div>
  );
}
