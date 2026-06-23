"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { useCurrency } from "../context/CurrencyContext";
import { useLang } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currency, setCurrency } = useCurrency();
  const { lang, setLang, t } = useLang();
  const { theme, toggleTheme } = useTheme();

  const navigationItems = [
    {
      name: t("dashboard"),
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      name: t("assets"),
      href: "/assets",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: t("screener"),
      href: "/screener",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      ),
    },
    {
      name: t("inheritance"),
      href: "/inheritance",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      name: t("history"),
      href: "/history",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: t("reports"),
      href: "/reports",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: t("settings"),
      href: "/settings",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-slate-200/80 sticky top-0 h-screen">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Logo variant="full" />
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 pr-4 py-6 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 pl-5 pr-4 py-3 rounded-r-lg text-sm font-semibold transition-all duration-150 border-l-2 ${
                  isActive
                    ? "border-accent bg-slate-50 text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-slate-100 space-y-4">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {theme === "dark" ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Light Mode
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Dark Mode
              </>
            )}
          </button>
          <button
            onClick={() => setLang(lang === "en" ? "ur" : "en")}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 w-full text-center transition-colors"
          >
            {lang === "en" ? "اردو" : <span className="font-medium">English</span>}
          </button>
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setCurrency("USD")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${currency === "USD" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
            >
              $ USD
            </button>
            <button
              onClick={() => setCurrency("PKR")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${currency === "PKR" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
            >
              ₨ PKR
            </button>
          </div>
          <div className="text-center">
            <span className="text-[10px] font-semibold text-accent uppercase tracking-wider block mb-1 font-heading">
              {t("secureLocal")}
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t("localDesc")}
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Shell Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-card border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-40">
          <Logo variant="full" />

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-primary transition-colors"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </header>

        {/* Mobile Menu Slide-over */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-30 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Content Drawer */}
            <nav className="relative flex flex-col w-4/5 max-w-sm bg-card h-full p-6 shadow-xl space-y-1.5 border-r border-slate-200 animate-slide-in">
              <div className="flex items-center mb-6 pb-4 border-b border-slate-100">
                <Logo variant="full" />
              </div>

              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 pl-4 pr-3 py-3 rounded-r-lg text-sm font-semibold transition-all duration-150 border-l-2 ${
                      isActive
                        ? "border-accent bg-slate-50 text-primary"
                        : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}

              <div className="absolute bottom-8 left-6 right-6 space-y-4 text-center overflow-y-auto max-h-[40vh] pb-4">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  {theme === "dark" ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Light Mode
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      Dark Mode
                    </>
                  )}
                </button>
                <button
                  onClick={() => setLang(lang === "en" ? "ur" : "en")}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 w-full text-center transition-colors"
                >
                  {lang === "en" ? "اردو" : <span className="font-medium">English</span>}
                </button>
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setCurrency("USD")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${currency === "USD" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                  >
                    $ USD
                  </button>
                  <button
                    onClick={() => setCurrency("PKR")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${currency === "PKR" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                  >
                    ₨ PKR
                  </button>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-accent uppercase tracking-wider block mb-1 font-heading">
                    {t("secureLocal")}
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {t("localDesc")}
                  </p>
                </div>
              </div>
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8 md:py-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
