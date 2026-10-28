"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export function useAutoRefresh(milliseconds = 300000) {
  const router = useRouter();
  useEffect(() => {
    const refresh = () => {
      const active = document.activeElement;
      if (document.visibilityState !== "visible" || !navigator.onLine || active?.matches("input,textarea,select,[contenteditable=true]")) return;
      router.refresh();
    };
    const timer = setInterval(refresh, milliseconds);
    document.addEventListener("visibilitychange", refresh);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, [router, milliseconds]);
}
