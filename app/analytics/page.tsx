"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  QrCode,
  Scan,
  Globe,
  Smartphone,
  RefreshCw,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { getAnalyticsSummary } from "@/lib/storage";

interface ServerAnalytics {
  overview: {
    totalGenerated: number;
    totalScans: number;
    avgScansPerCode: number;
    uniqueVisitors: number;
  };
  daily: { date: string; generated: number; scanned: number }[];
  typeBreakdown: { type: string; count: number; percentage: number }[];
  topCountries: { country: string; scans: number }[];
  deviceBreakdown: { device: string; percentage: number }[];
  hourlyActivity: { hour: number; scans: number }[];
}

const TYPE_COLORS: Record<string, string> = {
  url: "#8B5CF6",
  vcard: "#10B981",
  wifi: "#06B6D4",
  email: "#F59E0B",
  sms: "#EC4899",
  text: "#94A3B8",
  phone: "#22C55E",
  geo: "#EF4444",
};

const DEVICE_COLORS = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"];

export default function AnalyticsPage() {
  const [serverData, setServerData] = useState<ServerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [localSummary] = useState(getAnalyticsSummary);
  const [activeRange, setActiveRange] = useState<7 | 14 | 30>(14);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => setServerData(d))
      .finally(() => setLoading(false));
  }, []);

  const dailyData = serverData?.daily
    .slice(-activeRange)
    .map((d) => ({
      ...d,
      label: format(parseISO(d.date), "MMM d"),
    })) || [];

  const hourlyData =
    serverData?.hourlyActivity.map((h) => ({
      label: `${h.hour}:00`,
      scans: h.scans,
    })) || [];

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
          <p className="text-white/50">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-start justify-between"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white font-[var(--font-space)] mb-2">
              <span className="gradient-text">Analytics</span> Dashboard
            </h1>
            <p className="text-white/50">
              Platform-wide QR code generation and scan statistics
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="glass px-4 py-2.5 rounded-xl text-white/60 hover:text-white flex items-center gap-2 text-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </motion.div>

        {/* ─── OVERVIEW STATS ──────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "QR Codes Generated",
              value: (
                serverData?.overview.totalGenerated || localSummary.totalGenerated
              ).toLocaleString(),
              icon: QrCode,
              color: "#8B5CF6",
              change: "+12%",
            },
            {
              label: "Total Scans",
              value: (
                serverData?.overview.totalScans || localSummary.totalScans
              ).toLocaleString(),
              icon: Scan,
              color: "#06B6D4",
              change: "+8%",
            },
            {
              label: "Avg Scans/Code",
              value: serverData?.overview.avgScansPerCode.toFixed(1) || "0",
              icon: TrendingUp,
              color: "#10B981",
              change: "+3%",
            },
            {
              label: "Unique Visitors",
              value: (serverData?.overview.uniqueVisitors || 0).toLocaleString(),
              icon: Globe,
              color: "#F59E0B",
              change: "+5%",
            },
          ].map(({ label, value, icon: Icon, color, change }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className="flex items-center gap-1 text-emerald-400 text-xs">
                  <ArrowUpRight className="w-3 h-3" />
                  {change}
                </span>
              </div>
              <p
                className="text-2xl font-bold font-[var(--font-space)]"
                style={{ color }}
              >
                {value}
              </p>
              <p className="text-white/50 text-xs">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* ─── DAILY ACTIVITY ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-400" />
              Daily Activity
            </h2>
            <div className="flex gap-1">
              {([7, 14, 30] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setActiveRange(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    activeRange === d
                      ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                      : "text-white/50 hover:text-white/70 hover:bg-white/5"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="gradGen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradScan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "rgba(10,10,20,0.95)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Legend wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }} />
              <Area type="monotone" dataKey="generated" stroke="#8B5CF6" fill="url(#gradGen)" strokeWidth={2} name="Generated" />
              <Area type="monotone" dataKey="scanned" stroke="#06B6D4" fill="url(#gradScan)" strokeWidth={2} name="Scanned" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Type Breakdown Pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-white font-semibold mb-4">QR Type Breakdown</h2>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={serverData?.typeBreakdown || []}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {serverData?.typeBreakdown.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={TYPE_COLORS[entry.type] || "#64748B"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,10,20,0.95)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(val: number, name: string) => [val, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2">
              {serverData?.typeBreakdown.slice(0, 5).map((t) => (
                <div key={t.type} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: TYPE_COLORS[t.type] || "#64748B" }}
                  />
                  <span className="text-white/60 capitalize">{t.type}</span>
                  <span className="text-white/40">({t.percentage}%)</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Device breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              Device Types
            </h2>
            <div className="space-y-3 mt-2">
              {serverData?.deviceBreakdown.map(({ device, percentage }, i) => (
                <div key={device}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">{device}</span>
                    <span className="text-white/50">{percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ background: DEVICE_COLORS[i] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Countries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Top Countries
            </h2>
            <div className="space-y-3">
              {serverData?.topCountries.map(({ country, scans }, i) => {
                const max = serverData.topCountries[0].scans;
                return (
                  <div key={country} className="flex items-center gap-3">
                    <span className="text-white/40 text-xs w-4">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-white/70">{country}</span>
                        <span className="text-white/40">{scans.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(scans / max) * 100}%` }}
                          transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }}
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Hourly activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-pink-400" />
            Hourly Scan Activity
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={hourlyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 10 }} />
              <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: "rgba(10,10,20,0.95)",
                  border: "1px solid rgba(236,72,153,0.3)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="scans" fill="#EC4899" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Local stats section */}
        {localSummary.totalGenerated > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-2xl p-6 mt-6 border border-violet-500/20"
          >
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-violet-400" />
              Your Local Stats
              <span className="text-xs text-white/40 font-normal">(stored in your browser)</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-2xl font-bold text-violet-400 font-[var(--font-space)]">
                  {localSummary.totalGenerated}
                </p>
                <p className="text-white/50 text-xs">QR codes created</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-cyan-400 font-[var(--font-space)]">
                  {localSummary.totalScans}
                </p>
                <p className="text-white/50 text-xs">Total scans tracked</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400 font-[var(--font-space)]">
                  {localSummary.topTypes[0]?.type || "—"}
                </p>
                <p className="text-white/50 text-xs">Most used type</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-pink-400 font-[var(--font-space)]">
                  {localSummary.recentActivity.filter(d => d.count > 0).length}
                </p>
                <p className="text-white/50 text-xs">Active days (14d)</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
