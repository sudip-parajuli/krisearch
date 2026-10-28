"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { parseSaved, SAVED_KEY, type SavedItem } from "@/lib/saved";

const Context = createContext<{ items: SavedItem[]; ready: boolean; toggle: (item: Omit<SavedItem, "savedAt">) => string | null } | null>(null);
export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => { try { setItems(parseSaved(localStorage.getItem(SAVED_KEY))); } catch { setItems([]); } setReady(true); };
    const frame = requestAnimationFrame(sync);
    const listener = (e: StorageEvent) => { if (e.key === SAVED_KEY || e.key === null) sync(); };
    window.addEventListener("storage", listener);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("storage", listener); };
  }, []);
  function toggle(item: Omit<SavedItem, "savedAt">) {
    try {
      const current = parseSaved(localStorage.getItem(SAVED_KEY));
      const exists = current.some(v => v.href === item.href);
      if (!exists && current.length >= 200) return "limit";
      const next = exists ? current.filter(v => v.href !== item.href) : [{ ...item, title: item.title.slice(0, 300), savedAt: new Date().toISOString() }, ...current];
      localStorage.setItem(SAVED_KEY, JSON.stringify(next)); setItems(next); return null;
    } catch { return "storage"; }
  }
  return <Context.Provider value={{ items, ready, toggle }}>{children}</Context.Provider>;
}
export function useSaved() { const value = useContext(Context); if (!value) throw new Error("SavedProvider missing"); return value; }
