import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "../context/CurrencyContext";
import { LanguageProvider } from "../context/LanguageContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Mizan Wealth | Shariah-Compliant Wealth Management",
  description: "Calculate your zakat, analyze stock purity, project shariah-compliant growth, and model inheritance distribution using modern halal finance tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground`}
      >
        <CurrencyProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
