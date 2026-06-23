"use client";

import React, { useState, useEffect } from "react";
import LoadingScreen from "./LoadingScreen";

export default function AppLoadingWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {loading && <LoadingScreen />}
      {children}
    </>
  );
}
