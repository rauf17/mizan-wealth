import React from "react";
import Link from "next/link";

interface LogoProps {
  variant?: "full" | "compact";
  className?: string;
  active?: boolean;
}

export default function Logo({ variant = "full", className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 select-none focus:outline-none ${className}`}
      title="Mizan Wealth Home Page"
    >
      {/* Lucide Scale Vector Icon - Colored & Interactive */}
      <div className="relative w-6 h-6 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ease-out"
        >
          {/* Central Post and Base - Deep Teal */}
          <path d="M7 21h10" stroke="var(--primary)" />
          <path d="M12 3v18" stroke="var(--primary)" />
          <path d="M3 7h18" stroke="var(--primary)" />
          
          {/* Left Pan suspended - Muted Gold */}
          <path 
            d="m2 16 3-8 3 8c-.87.65-2.24.75-3 .75s-2.13-.1-3-.75Z" 
            stroke="var(--accent)" 
            className="transform group-hover:translate-y-[1px] transition-transform duration-300 ease-out"
          />
          
          {/* Right Pan suspended - Muted Gold */}
          <path 
            d="m16 16 3-8 3 8c-.87.65-2.24.75-3 .75s-2.13-.1-3-.75Z" 
            stroke="var(--accent)" 
            className="transform group-hover:translate-y-[-1px] transition-transform duration-300 ease-out"
          />
        </svg>
      </div>

      {/* Wordmark: Mizan Wealth */}
      {variant === "full" && (
        <span className="font-sans text-slate-900 select-none text-sm tracking-wide leading-none flex items-center">
          <span className="font-semibold text-slate-800">Mizan</span>
          <span className="font-light ml-1 text-slate-500">Wealth</span>
        </span>
      )}
    </Link>
  );
}
