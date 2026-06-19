import React from "react";
import Link from "next/link";

interface LogoProps {
  variant?: "full" | "compact";
  className?: string;
  active?: boolean;
}

export default function Logo({ variant = "full", className = "", active = false }: LogoProps) {
  return (
    <Link
      href="/dashboard"
      className={`group inline-flex items-center gap-2.5 select-none focus:outline-none ${className}`}
      title="Mizan Wealth Home"
    >
      {/* Lucide Scale Vector Icon */}
      <div 
        className={`transition-colors duration-200 ${
          active 
            ? "text-primary" 
            : "text-slate-400 group-hover:text-primary"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5.5 h-5.5 transform group-hover:scale-105 transition-transform duration-200 ease-out"
        >
          <path d="m16 16 3-8 3 8c-.87.65-2.24.75-3 .75s-2.13-.1-3-.75Z" />
          <path d="m2 16 3-8 3 8c-.87.65-2.24.75-3 .75s-2.13-.1-3-.75Z" />
          <path d="M7 21h10" />
          <path d="M12 3v18" />
          <path d="M3 7h18" />
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
