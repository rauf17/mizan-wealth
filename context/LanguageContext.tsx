"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, en } from "../lib/translations";

interface LanguageContextType {
  lang: "en" | "ur";
  setLang: (lang: "en" | "ur") => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<"en" | "ur">("en");

  useEffect(() => {
    const saved = localStorage.getItem("mizan_lang") as "en" | "ur";
    if (saved === "en" || saved === "ur") {
      setLangState(saved);
    }
  }, []);

  useEffect(() => {
    if (lang === "ur") {
      document.documentElement.setAttribute("dir", "rtl");
      document.documentElement.setAttribute("lang", "ur");
    } else {
      document.documentElement.setAttribute("dir", "ltr");
      document.documentElement.setAttribute("lang", "en");
    }
  }, [lang]);

  const setLang = (newLang: "en" | "ur") => {
    setLangState(newLang);
    localStorage.setItem("mizan_lang", newLang);
  };

  const t = (key: string) => {
    const dict = translations[lang] || en;
    return dict[key] || en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLang must be used within a LanguageProvider");
  }
  return context;
}
