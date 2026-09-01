"use client"

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

// 5 minutes of inactivity before auto-logout (300,000 ms)
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

export default function IdleLogout() {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const performLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login?reason=inactivity");
      router.refresh();
    } catch (e) {
      console.error("Auto logout failed:", e);
    }
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // Only set inactivity timer if user is not already on the login page
    if (pathname !== "/login") {
      timerRef.current = setTimeout(performLogout, INACTIVITY_TIMEOUT_MS);
    }
  };

  useEffect(() => {
    // If on login page, don't set timer
    if (pathname === "/login") return;

    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    
    // Reset timer on any user activity
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [pathname]);

  return null;
}
