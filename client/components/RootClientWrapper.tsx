// client/components/RootClientWrapper.tsx
"use client";

import { useEffect } from "react";

export default function RootClientWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initial theme sync
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <div className="min-h-full flex flex-col relative" suppressHydrationWarning>
      {/* Subtle animated wave mesh */}
      <div className="wave-mesh wave-mesh-active" />

      {/* Floating Blurred Blobs (Low Opacity) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="bg-blob w-[500px] h-[500px] bg-blue-500/10 top-10 left-10" />
        <div className="bg-blob w-[450px] h-[450px] bg-indigo-500/8 bottom-20 right-10" style={{ animationDelay: "-6s" }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}

