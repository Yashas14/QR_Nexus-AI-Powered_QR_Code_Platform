"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Trash2,
  Download,
  Copy,
  Search,
  Filter,
  QrCode,
  Globe,
  Wifi,
  User,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  FileText,
  Scan,
  AlertCircle,
  Plus,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";
import {
  getHistory,
  removeFromHistory,
  clearHistory,
} from "@/lib/storage";
import type { QRHistoryItem } from "@/lib/qr-utils";
import { getTypeColor, getTypeLabel } from "@/lib/qr-utils";
import type { QRType } from "@/lib/qr-utils";

const TYPE_ICONS: Record<string, React.ElementType> = {
  url: Globe,
  wifi: Wifi,
  vcard: User,
  email: Mail,
  sms: MessageSquare,
  phone: Phone,
  geo: MapPin,
  text: FileText,
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "scans", label: "Most Scans" },
  { value: "type", label: "By Type" },
];

const TYPE_FILTERS = [
  "all",
  "url",
  "wifi",
  "vcard",
  "email",
  "phone",
  "text",
];

export default function HistoryPage() {
  const [items, setItems] = useState<QRHistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterType, setFilterType] = useState("all");
  const [selectedItem, setSelectedItem] = useState<QRHistoryItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const loadHistory = useCallback(() => {
    setItems(getHistory());
  }, []);

  useEffect(() => {
    loadHistory();
    window.addEventListener("qr_history_updated", loadHistory);
    return () => window.removeEventListener("qr_history_updated", loadHistory);
  }, [loadHistory]);

  const filteredItems = items
    .filter((item) => {
      const matchSearch =
        !search ||
        item.content.toLowerCase().includes(search.toLowerCase()) ||
        item.label?.toLowerCase().includes(search.toLowerCase()) ||
        item.aiDescription?.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === "all" || item.type === filterType;
      return matchSearch && matchType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "scans":
          return (b.scanCount || 0) - (a.scanCount || 0);
        case "type":
          return a.type.localeCompare(b.type);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handleDelete = (id: string) => {
    removeFromHistory(id);
    if (selectedItem?.id === id) setSelectedItem(null);
    toast.success("Removed from history");
  };

  const handleDownload = (item: QRHistoryItem) => {
    const link = document.createElement("a");
    link.href = item.dataUrl;
    link.download = `qr-${item.type}-${Date.now()}.png`;
    link.click();
    toast.success("Downloaded!");
  };

  const handleCopy = async (item: QRHistoryItem) => {
    try {
      const res = await fetch(item.dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      toast.success("Copied to clipboard!");
    } catch {
      await navigator.clipboard.writeText(item.content);
      toast.success("Content copied!");
    }
  };

  const handleClearAll = () => {
    if (confirm("Clear all QR code history? This cannot be undone.")) {
      clearHistory();
      setSelectedItem(null);
      toast.success("History cleared");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-start justify-between flex-wrap gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white font-[var(--font-space)] mb-2">
              QR <span className="gradient-text">History</span>
            </h1>
            <p className="text-white/50">
              {items.length} QR code{items.length !== 1 ? "s" : ""} saved locally
            </p>
          </div>
          <div className="flex gap-3">
            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-red-400/60 hover:text-red-400 hover:border-red-500/30 transition-all text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
            <Link href="/generate">
              <button className="btn-neon text-sm py-2.5 px-5 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New QR
              </button>
            </Link>
          </div>
        </motion.div>

        {items.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-16 text-center max-w-lg mx-auto"
          >
            <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-10 h-10 text-violet-400/40" />
            </div>
            <h2 className="text-white text-xl font-semibold mb-3">
              No QR codes yet
            </h2>
            <p className="text-white/40 mb-8 leading-relaxed">
              QR codes you generate will appear here. They&apos;re saved locally in your
              browser — no account needed.
            </p>
            <Link href="/generate">
              <button className="btn-neon flex items-center gap-2 mx-auto">
                <QrCode className="w-4 h-4" />
                Create your first QR code
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            {/* ─── LIST ──────────────────────────────────────── */}
            <div className="space-y-4">
              {/* Search + Filter */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search content, description..."
                    className="input-glow w-full pl-10 text-sm"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`glass px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all ${
                    showFilters
                      ? "text-violet-300 border-violet-500/30"
                      : "text-white/60 hover:text-white/80"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="glass rounded-2xl p-4 space-y-4"
                >
                  <div>
                    <label className="text-white/50 text-xs mb-2 block">Type</label>
                    <div className="flex flex-wrap gap-2">
                      {TYPE_FILTERS.map((t) => (
                        <button
                          key={t}
                          onClick={() => setFilterType(t)}
                          className={`px-3 py-1.5 rounded-full text-xs transition-all capitalize ${
                            filterType === t
                              ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                              : "glass text-white/50 hover:text-white/70"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs mb-2 block">Sort By</label>
                    <div className="flex flex-wrap gap-2">
                      {SORT_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => setSortBy(o.value)}
                          className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                            sortBy === o.value
                              ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                              : "glass text-white/50 hover:text-white/70"
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Count */}
              <p className="text-white/30 text-xs">
                Showing {filteredItems.length} of {items.length} items
              </p>

              {/* Items */}
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredItems.map((item, i) => {
                    const Icon = TYPE_ICONS[item.type] || FileText;
                    const color = getTypeColor(item.type as QRType);
                    const isSelected = selectedItem?.id === item.id;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: Math.min(i * 0.05, 0.3) }}
                        onClick={() => setSelectedItem(isSelected ? null : item)}
                        className={`glass rounded-2xl p-4 cursor-pointer transition-all hover:border-white/20 ${
                          isSelected ? "border-violet-500/40 bg-violet-500/5" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* QR thumbnail */}
                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-white">
                            <img
                              src={item.dataUrl}
                              alt="QR"
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                                style={{
                                  background: `${color}15`,
                                  color,
                                  border: `1px solid ${color}30`,
                                }}
                              >
                                <Icon className="w-2.5 h-2.5" />
                                {getTypeLabel(item.type as QRType)}
                              </span>
                              {item.scanCount > 0 && (
                                <span className="flex items-center gap-1 text-xs text-white/40">
                                  <Scan className="w-2.5 h-2.5" />
                                  {item.scanCount}
                                </span>
                              )}
                            </div>
                            <p className="text-white/80 text-sm font-medium truncate">
                              {item.label || item.content.slice(0, 60)}
                            </p>
                            {item.aiDescription && (
                              <p className="text-white/40 text-xs mt-0.5 truncate">
                                {item.aiDescription}
                              </p>
                            )}
                            <p className="text-white/25 text-xs mt-1">
                              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleDownload(item)}
                              className="p-2 rounded-lg glass text-white/40 hover:text-white transition-colors"
                              title="Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCopy(item)}
                              className="p-2 rounded-lg glass text-white/40 hover:text-white transition-colors"
                              title="Copy"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 rounded-lg glass text-white/40 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {filteredItems.length === 0 && (
                  <div className="glass rounded-2xl p-10 text-center">
                    <AlertCircle className="w-8 h-8 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40">No QR codes match your search</p>
                    <button
                      onClick={() => { setSearch(""); setFilterType("all"); }}
                      className="mt-3 text-violet-400 text-sm flex items-center gap-1 mx-auto hover:text-violet-300"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ─── DETAIL PANEL ──────────────────────────────── */}
            <div className="sticky top-24 h-fit">
              <AnimatePresence mode="wait">
                {selectedItem ? (
                  <motion.div
                    key={selectedItem.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="space-y-4"
                  >
                    <div className="glass rounded-2xl p-6">
                      <div className="bg-white rounded-xl p-4 mb-5">
                        <img
                          src={selectedItem.dataUrl}
                          alt="QR Code"
                          className="w-full max-w-[200px] mx-auto block"
                        />
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-white/40 text-xs mb-1">Type</p>
                          <p className="text-white/80 text-sm capitalize">
                            {getTypeLabel(selectedItem.type as QRType)}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs mb-1">Content</p>
                          <p className="text-white/70 text-sm font-mono break-all">
                            {selectedItem.content.slice(0, 150)}
                            {selectedItem.content.length > 150 && "..."}
                          </p>
                        </div>
                        {selectedItem.aiDescription && (
                          <div>
                            <p className="text-white/40 text-xs mb-1">AI Description</p>
                            <p className="text-white/70 text-sm">
                              {selectedItem.aiDescription}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-white/40 text-xs mb-1">Created</p>
                          <p className="text-white/70 text-sm">
                            {format(new Date(selectedItem.createdAt), "PPP p")}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div>
                            <p className="text-white/40 text-xs">Scans</p>
                            <p className="text-white font-semibold">
                              {selectedItem.scanCount || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-white/40 text-xs">Error Level</p>
                            <p className="text-white font-semibold">
                              {(selectedItem.style as { errorCorrectionLevel?: string })?.errorCorrectionLevel || "M"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-5">
                        <button
                          onClick={() => handleDownload(selectedItem)}
                          className="btn-neon flex-1 flex items-center justify-center gap-2 text-sm py-2.5"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={() => handleCopy(selectedItem)}
                          className="glass px-4 py-2.5 rounded-xl text-white/60 hover:text-white flex items-center gap-1.5 text-sm"
                        >
                          <Copy className="w-4 h-4" />
                          Copy
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty-detail"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass rounded-2xl p-10 text-center"
                  >
                    <History className="w-10 h-10 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">
                      Select a QR code to see details
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
