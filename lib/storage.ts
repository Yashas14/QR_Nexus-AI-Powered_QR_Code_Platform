// Local storage utilities for QR history and preferences
import type { QRHistoryItem } from "./qr-utils";

const HISTORY_KEY = "qr_nexus_history";
const MAX_HISTORY = 100;

// ─── History ─────────────────────────────────────────────────
export function getHistory(): QRHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(item: QRHistoryItem): void {
  if (typeof window === "undefined") return;
  try {
    const history = getHistory();
    const filtered = history.filter((h) => h.id !== item.id);
    const updated = [item, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("qr_history_updated"));
  } catch (e) {
    console.error("Failed to save to history:", e);
  }
}

export function removeFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  const history = getHistory().filter((h) => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  window.dispatchEvent(new Event("qr_history_updated"));
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
  window.dispatchEvent(new Event("qr_history_updated"));
}

export function incrementScanCount(id: string): void {
  if (typeof window === "undefined") return;
  const history = getHistory().map((item) =>
    item.id === id ? { ...item, scanCount: (item.scanCount || 0) + 1 } : item
  );
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function updateHistoryItem(id: string, updates: Partial<QRHistoryItem>): void {
  if (typeof window === "undefined") return;
  const history = getHistory().map((item) =>
    item.id === id ? { ...item, ...updates } : item
  );
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  window.dispatchEvent(new Event("qr_history_updated"));
}

// ─── Analytics helpers ───────────────────────────────────────
export interface AnalyticsSummary {
  totalGenerated: number;
  totalScans: number;
  topTypes: { type: string; count: number }[];
  recentActivity: { date: string; count: number }[];
  favoritePreset: string;
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const history = getHistory();
  
  // Count by type
  const typeCounts = history.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});
  const topTypes = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // Daily activity (last 14 days)
  const now = new Date();
  const recentActivity = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const count = history.filter(
      (h) => h.createdAt.slice(0, 10) === dateStr
    ).length;
    return { date: dateStr, count };
  });

  const totalScans = history.reduce((sum, h) => sum + (h.scanCount || 0), 0);

  return {
    totalGenerated: history.length,
    totalScans,
    topTypes,
    recentActivity,
    favoritePreset: topTypes[0]?.type ?? "url",
  };
}

