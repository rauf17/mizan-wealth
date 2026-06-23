import React, { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 bg-[#FAFAF8] z-[9999] flex flex-col items-center justify-center gap-6 ${
        fading ? "animate-fade-out" : ""
      }`}
    >
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-16 h-16"
          style={{ animation: "tiltScale 1.2s ease-in-out forwards" }}
        >
          <path d="M7 21h10" stroke="var(--primary)" />
          <path d="M12 3v18" stroke="var(--primary)" />
          <path d="M3 7h18" stroke="var(--primary)" />
          
          <path 
            d="m2 16 3-8 3 8c-.87.65-2.24.75-3 .75s-2.13-.1-3-.75Z" 
            stroke="var(--accent)" 
          />
          
          <path 
            d="m16 16 3-8 3 8c-.87.65-2.24.75-3 .75s-2.13-.1-3-.75Z" 
            stroke="var(--accent)" 
          />
        </svg>
      </div>

      <div 
        className="text-primary font-heading font-bold text-2xl opacity-0"
        style={{ animation: "fadeIn 0.5s ease-out 0.3s forwards" }}
      >
        Mizan Wealth
      </div>

      <div className="w-48 h-0.5 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-accent rounded-full" 
          style={{
            animation: "progressFill 1.6s ease-out forwards"
          }} 
        />
      </div>

      <div 
        className="absolute bottom-12 text-slate-400 text-xs text-center opacity-0 font-body"
        style={{ animation: "fadeIn 0.5s ease-out 0.5s forwards" }}
        dir="rtl"
        lang="ar"
      >
        الزكاة ركن من أركان الإسلام
      </div>
    </div>
  );
}
