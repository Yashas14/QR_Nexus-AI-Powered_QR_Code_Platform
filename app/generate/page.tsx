"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  Sparkles,
  Download,
  Copy,
  RefreshCw,
  Wifi,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Globe,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  Palette,
  Settings2,
  Share2,
  CheckCircle,
  AlertTriangle,
  Shield,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import {
  QRType,
  DEFAULT_STYLE,
  QR_PRESETS,
  detectQRType,
  getTypeLabel,
  getTypeColor,
  formatWiFi,
  formatVCard,
  formatEmail,
  formatSMS,
  QRStyle,
} from "@/lib/qr-utils";
import { addToHistory } from "@/lib/storage";

// QR type icons map
const TYPE_ICONS: Record<QRType, React.ElementType> = {
  url: Globe,
  wifi: Wifi,
  vcard: User,
  email: Mail,
  sms: MessageSquare,
  phone: Phone,
  geo: MapPin,
  text: FileText,
  event: FileText,
  payment: FileText,
};

// WiFi form state
interface WiFiState {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
}

// vCard form state
interface VCardState {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  organization: string;
  website: string;
}

export default function GeneratePage() {
  const [content, setContent] = useState("https://example.com");
  const [qrType, setQrType] = useState<QRType>("url");
  const [style, setStyle] = useState<QRStyle>(DEFAULT_STYLE);
  const [qrSrc, setQrSrc] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<null | {
    description?: string;
    riskLevel?: string;
    suggestions?: string[];
    type?: string;
    mock?: boolean;
  }>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [wifiState, setWifiState] = useState<WiFiState>({
    ssid: "",
    password: "",
    encryption: "WPA",
  });
  const [vcardState, setVCardState] = useState<VCardState>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    organization: "",
    website: "",
  });
  const [activeTab, setActiveTab] = useState<"content" | "style">("content");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Build final content based on type
  const buildContent = useCallback(() => {
    switch (qrType) {
      case "wifi":
        if (!wifiState.ssid) return "";
        return formatWiFi(wifiState);
      case "vcard":
        if (!vcardState.firstName) return "";
        return formatVCard({
          firstName: vcardState.firstName,
          lastName: vcardState.lastName,
          phone: vcardState.phone,
          email: vcardState.email,
          organization: vcardState.organization,
          website: vcardState.website,
        });
      case "email":
        if (!content) return "";
        return formatEmail({ to: content });
      case "sms":
        if (!content) return "";
        return formatSMS({ phone: content });
      case "phone":
        return content ? `tel:${content}` : "";
      default:
        return content;
    }
  }, [qrType, content, wifiState, vcardState]);

  // Generate QR code
  const generateQR = useCallback(async () => {
    const finalContent = buildContent();
    if (!finalContent.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: finalContent,
          width: style.width || 400,
          foregroundColor: style.foregroundColor,
          backgroundColor: style.backgroundColor,
          errorCorrectionLevel: style.errorCorrectionLevel,
          margin: style.margin,
        }),
      });

      const data = await res.json();
      if (data.dataUrl) {
        setQrSrc(data.dataUrl);
      }
    } catch (err) {
      console.error("QR generation error:", err);
      toast.error("Failed to generate QR code");
    } finally {
      setIsGenerating(false);
    }
  }, [buildContent, style]);

  // Auto-generate on content/style change
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(generateQR, 600);
    return () => clearTimeout(debounceRef.current);
  }, [generateQR]);

  // Auto-detect type from content
  useEffect(() => {
    if (qrType === "text" || qrType === "url") {
      const detected = detectQRType(content);
      if (detected !== "text") setQrType(detected);
    }
  }, [content, qrType]);

  // AI analyze
  const analyzeWithAI = async () => {
    const finalContent = buildContent();
    if (!finalContent) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/ai-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: finalContent, action: "analyze" }),
      });
      const data = await res.json();
      setAiResult(data);
      if (data.type && data.type !== qrType) {
        setQrType(data.type as QRType);
      }
      toast.success("AI analysis complete!");
    } catch {
      toast.error("AI analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save to history
  const saveToHistory = () => {
    if (!qrSrc) return;
    addToHistory({
      id: uuidv4(),
      content: buildContent(),
      type: qrType,
      dataUrl: qrSrc,
      style,
      createdAt: new Date().toISOString(),
      scanCount: 0,
      aiDescription: aiResult?.description,
    });
    toast.success("Saved to history!");
  };

  // Download QR
  const downloadQR = (format: "png" | "svg") => {
    if (!qrSrc && format === "png") {
      toast.error("Generate a QR code first");
      return;
    }
    const link = document.createElement("a");
    if (format === "png") {
      link.href = qrSrc;
      link.download = `qr-code-${Date.now()}.png`;
    } else {
      // SVG download via API
      const finalContent = buildContent();
      const params = new URLSearchParams({
        content: finalContent,
        format: "svg",
        fg: style.foregroundColor,
        bg: style.backgroundColor,
      });
      link.href = `/api/generate?${params}`;
      link.download = `qr-code-${Date.now()}.svg`;
    }
    link.click();
    toast.success(`Downloaded as ${format.toUpperCase()}!`);
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    if (!qrSrc) return;
    try {
      const res = await fetch(qrSrc);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      toast.success("Copied to clipboard!");
    } catch {
      // Fallback: copy data URL
      await navigator.clipboard.writeText(qrSrc);
      toast.success("Data URL copied!");
    }
  };

  const typeColor = getTypeColor(qrType);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white font-[var(--font-space)] mb-2">
            QR <span className="gradient-text">Generator</span>
          </h1>
          <p className="text-white/50">
            Create custom QR codes with AI-powered analysis and beautiful styling
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* ─── LEFT PANEL ────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Tab switcher */}
            <div className="glass rounded-2xl p-1 flex gap-1">
              {(["content", "style"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                    activeTab === tab
                      ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                      : "text-white/50 hover:text-white/70"
                  }`}
                >
                  {tab === "content" ? (
                    <span className="flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" /> Content
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Palette className="w-4 h-4" /> Style
                    </span>
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "content" ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  {/* QR Type Selector */}
                  <div className="glass rounded-2xl p-5">
                    <label className="text-white/70 text-sm font-medium mb-3 block">
                      QR Code Type
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(
                        [
                          "url",
                          "wifi",
                          "vcard",
                          "email",
                          "sms",
                          "phone",
                          "geo",
                          "text",
                        ] as QRType[]
                      ).map((type) => {
                        const Icon = TYPE_ICONS[type];
                        const color = getTypeColor(type);
                        const active = qrType === type;
                        return (
                          <button
                            key={type}
                            onClick={() => setQrType(type)}
                            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs transition-all ${
                              active
                                ? "border border-[var(--tc)]/50 bg-[var(--tc)]/10 text-white"
                                : "border border-white/5 hover:border-white/15 text-white/50 hover:text-white/80"
                            }`}
                            style={
                              { "--tc": color } as React.CSSProperties
                            }
                          >
                            <Icon
                              className="w-4 h-4"
                              style={{ color: active ? color : undefined }}
                            />
                            <span className="capitalize">{type}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Content Input */}
                  <div className="glass rounded-2xl p-5">
                    <label className="text-white/70 text-sm font-medium mb-3 block flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: typeColor }}
                      />
                      {getTypeLabel(qrType)} Content
                    </label>

                    {/* URL / Text / Phone / Email / Geo */}
                    {["url", "text", "phone", "email", "geo"].includes(
                      qrType
                    ) && (
                      <div className="space-y-3">
                        <textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder={
                            qrType === "url"
                              ? "https://your-website.com"
                              : qrType === "phone"
                              ? "+91 98765 43210"
                              : qrType === "email"
                              ? "hello@example.com"
                              : qrType === "geo"
                              ? "12.9716,77.5946"
                              : "Enter your text here..."
                          }
                          rows={3}
                          className="input-glow w-full resize-none text-sm"
                        />
                        <div className="flex items-center justify-between text-xs text-white/30">
                          <span>{content.length} chars</span>
                          <span>Max ~2950</span>
                        </div>
                      </div>
                    )}

                    {/* SMS */}
                    {qrType === "sms" && (
                      <div className="space-y-3">
                        <input
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Phone number"
                          className="input-glow w-full text-sm"
                        />
                      </div>
                    )}

                    {/* WiFi */}
                    {qrType === "wifi" && (
                      <div className="space-y-3">
                        <input
                          value={wifiState.ssid}
                          onChange={(e) =>
                            setWifiState((s) => ({ ...s, ssid: e.target.value }))
                          }
                          placeholder="Network name (SSID)"
                          className="input-glow w-full text-sm"
                        />
                        <input
                          type="password"
                          value={wifiState.password}
                          onChange={(e) =>
                            setWifiState((s) => ({
                              ...s,
                              password: e.target.value,
                            }))
                          }
                          placeholder="Password"
                          className="input-glow w-full text-sm"
                        />
                        <select
                          value={wifiState.encryption}
                          onChange={(e) =>
                            setWifiState((s) => ({
                              ...s,
                              encryption: e.target.value as WiFiState["encryption"],
                            }))
                          }
                          className="input-glow w-full text-sm"
                        >
                          <option value="WPA">WPA/WPA2</option>
                          <option value="WEP">WEP</option>
                          <option value="nopass">No password</option>
                        </select>
                      </div>
                    )}

                    {/* vCard */}
                    {qrType === "vcard" && (
                      <div className="grid grid-cols-2 gap-3">
                        <input value={vcardState.firstName} onChange={(e) => setVCardState(s => ({...s, firstName: e.target.value}))} placeholder="First name" className="input-glow text-sm" />
                        <input value={vcardState.lastName} onChange={(e) => setVCardState(s => ({...s, lastName: e.target.value}))} placeholder="Last name" className="input-glow text-sm" />
                        <input value={vcardState.phone} onChange={(e) => setVCardState(s => ({...s, phone: e.target.value}))} placeholder="Phone" className="input-glow text-sm" />
                        <input value={vcardState.email} onChange={(e) => setVCardState(s => ({...s, email: e.target.value}))} placeholder="Email" className="input-glow text-sm" />
                        <input value={vcardState.organization} onChange={(e) => setVCardState(s => ({...s, organization: e.target.value}))} placeholder="Organization" className="input-glow text-sm col-span-2" />
                        <input value={vcardState.website} onChange={(e) => setVCardState(s => ({...s, website: e.target.value}))} placeholder="Website" className="input-glow text-sm col-span-2" />
                      </div>
                    )}
                  </div>

                  {/* AI Analysis */}
                  <div className="glass rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-400" />
                        AI Analysis
                      </h3>
                      <button
                        onClick={analyzeWithAI}
                        disabled={isAnalyzing || !buildContent()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 transition-all text-sm disabled:opacity-40"
                      >
                        {isAnalyzing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        {isAnalyzing ? "Analyzing..." : "Analyze"}
                      </button>
                    </div>

                    {aiResult ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                          {aiResult.riskLevel === "safe" ? (
                            <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                          )}
                          <div>
                            <p className="text-white text-sm font-medium">
                              {aiResult.description || "Content analyzed"}
                            </p>
                            <span
                              className={`text-xs mt-0.5 inline-block ${
                                aiResult.riskLevel === "safe"
                                  ? "text-emerald-400"
                                  : "text-amber-400"
                              }`}
                            >
                              {aiResult.riskLevel === "safe"
                                ? "✓ Safe"
                                : "⚠ Review"}
                              {aiResult.mock && " (demo mode)"}
                            </span>
                          </div>
                        </div>
                        {aiResult.suggestions && aiResult.suggestions.length > 0 && (
                          <div>
                            <p className="text-white/50 text-xs mb-2">
                              Suggestions:
                            </p>
                            <ul className="space-y-1">
                              {aiResult.suggestions.map((s, i) => (
                                <li
                                  key={i}
                                  className="text-white/60 text-xs flex items-start gap-2"
                                >
                                  <span className="text-violet-400 mt-0.5">•</span>
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <p className="text-white/30 text-sm">
                        Click Analyze to get AI insights about your QR content —
                        type detection, safety check, and improvement suggestions.
                      </p>
                    )}
                  </div>
                </motion.div>
              ) : (
                /* ── STYLE TAB ─────────────────────────────────── */
                <motion.div
                  key="style"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-5"
                >
                  {/* Presets */}
                  <div className="glass rounded-2xl p-5">
                    <label className="text-white/70 text-sm font-medium mb-3 block">
                      Color Presets
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {QR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() =>
                            setStyle((s) => ({ ...s, ...preset.style }))
                          }
                          className="py-2 px-3 rounded-xl glass hover:border-white/20 transition-all text-xs text-white/70 hover:text-white flex items-center gap-2"
                        >
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${preset.style.foregroundColor}, ${preset.style.gradientColor || preset.style.foregroundColor})`,
                            }}
                          />
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color pickers */}
                  <div className="glass rounded-2xl p-5 space-y-4">
                    <label className="text-white/70 text-sm font-medium block">
                      Custom Colors
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/50 text-xs mb-1.5 block">
                          Foreground
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={style.foregroundColor}
                            onChange={(e) =>
                              setStyle((s) => ({
                                ...s,
                                foregroundColor: e.target.value,
                              }))
                            }
                            className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent"
                          />
                          <input
                            value={style.foregroundColor}
                            onChange={(e) =>
                              setStyle((s) => ({
                                ...s,
                                foregroundColor: e.target.value,
                              }))
                            }
                            className="input-glow flex-1 text-xs font-mono"
                            maxLength={7}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-white/50 text-xs mb-1.5 block">
                          Background
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={style.backgroundColor}
                            onChange={(e) =>
                              setStyle((s) => ({
                                ...s,
                                backgroundColor: e.target.value,
                              }))
                            }
                            className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent"
                          />
                          <input
                            value={style.backgroundColor}
                            onChange={(e) =>
                              setStyle((s) => ({
                                ...s,
                                backgroundColor: e.target.value,
                              }))
                            }
                            className="input-glow flex-1 text-xs font-mono"
                            maxLength={7}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced style options */}
                  <div className="glass rounded-2xl p-5 space-y-4">
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center justify-between w-full text-white/70 text-sm font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <Settings2 className="w-4 h-4" />
                        Advanced Options
                      </span>
                      {showAdvanced ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {showAdvanced && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-4"
                      >
                        {/* Size */}
                        <div>
                          <label className="text-white/50 text-xs mb-1.5 flex justify-between">
                            <span>Size (px)</span>
                            <span className="text-white/70">
                              {style.width}px
                            </span>
                          </label>
                          <input
                            type="range"
                            min={100}
                            max={800}
                            step={50}
                            value={style.width}
                            onChange={(e) =>
                              setStyle((s) => ({
                                ...s,
                                width: parseInt(e.target.value),
                              }))
                            }
                            className="w-full"
                          />
                        </div>

                        {/* Margin */}
                        <div>
                          <label className="text-white/50 text-xs mb-1.5 flex justify-between">
                            <span>Margin</span>
                            <span className="text-white/70">{style.margin}</span>
                          </label>
                          <input
                            type="range"
                            min={0}
                            max={10}
                            value={style.margin}
                            onChange={(e) =>
                              setStyle((s) => ({
                                ...s,
                                margin: parseInt(e.target.value),
                              }))
                            }
                            className="w-full"
                          />
                        </div>

                        {/* Error correction */}
                        <div>
                          <label className="text-white/50 text-xs mb-1.5 block">
                            Error Correction Level
                          </label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {(["L", "M", "Q", "H"] as const).map((level) => (
                              <button
                                key={level}
                                onClick={() =>
                                  setStyle((s) => ({
                                    ...s,
                                    errorCorrectionLevel: level,
                                  }))
                                }
                                className={`py-1.5 rounded-lg text-xs transition-all ${
                                  style.errorCorrectionLevel === level
                                    ? "bg-violet-500/30 text-violet-300 border border-violet-500/40"
                                    : "glass text-white/50 hover:text-white/70"
                                }`}
                              >
                                {level}
                                <p className="text-[9px] mt-0.5 opacity-70">
                                  {level === "L" ? "7%" : level === "M" ? "15%" : level === "Q" ? "25%" : "30%"}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── RIGHT PANEL - QR PREVIEW ─────────────────────── */}
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-6 flex flex-col items-center"
            >
              {/* Type badge */}
              <div
                className="qr-type-badge mb-4"
                style={{ borderColor: `${typeColor}40`, color: typeColor, background: `${typeColor}15` }}
              >
                {React.createElement(TYPE_ICONS[qrType], { className: "w-3 h-3" })}
                {getTypeLabel(qrType)}
              </div>

              {/* QR Preview */}
              <div className="relative w-full aspect-square max-w-[280px] rounded-2xl overflow-hidden border border-white/10 bg-white flex items-center justify-center">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
                    <p className="text-gray-400 text-sm">Generating...</p>
                  </div>
                ) : qrSrc ? (
                  <>
                    <img
                      src={qrSrc}
                      alt="QR Code"
                      className="w-full h-full object-contain"
                    />
                    {/* Scan-line overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-400/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                  </>
                ) : (
                  <div className="text-center p-6">
                    <QrCode className="w-16 h-16 text-gray-300/40 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Enter content above</p>
                  </div>
                )}

                {/* Corner brackets */}
                <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-violet-400/30 rounded-tl-sm" />
                <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-violet-400/30 rounded-tr-sm" />
                <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-violet-400/30 rounded-bl-sm" />
                <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-violet-400/30 rounded-br-sm" />
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 w-full mt-5">
                <button
                  onClick={() => downloadQR("png")}
                  disabled={!qrSrc}
                  className="btn-neon text-sm py-2.5 flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <Download className="w-4 h-4" />
                  PNG
                </button>
                <button
                  onClick={() => downloadQR("svg")}
                  disabled={!buildContent()}
                  className="btn-neon-cyan text-sm py-2.5 flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <Download className="w-4 h-4" />
                  SVG
                </button>
                <button
                  onClick={copyToClipboard}
                  disabled={!qrSrc}
                  className="glass text-white/70 hover:text-white text-sm py-2.5 flex items-center justify-center gap-1.5 rounded-xl transition-all hover:border-white/20 disabled:opacity-40"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                <button
                  onClick={saveToHistory}
                  disabled={!qrSrc}
                  className="glass text-white/70 hover:text-white text-sm py-2.5 flex items-center justify-center gap-1.5 rounded-xl transition-all hover:border-white/20 disabled:opacity-40"
                >
                  <CheckCircle className="w-4 h-4" />
                  Save
                </button>
              </div>

              <button
                onClick={generateQR}
                className="mt-3 w-full flex items-center justify-center gap-2 text-white/50 hover:text-white/80 text-sm py-2 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            </motion.div>

            {/* Share section */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-white/70 text-sm font-medium mb-3 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share QR Code
              </h3>
              <div className="flex gap-2">
                {qrSrc && (
                  <input
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/api/generate?content=${encodeURIComponent(buildContent())}&fg=${encodeURIComponent(style.foregroundColor)}`}
                    className="input-glow flex-1 text-xs truncate"
                  />
                )}
                <button
                  className="glass px-3 py-2 rounded-xl text-white/60 hover:text-white transition-colors text-xs"
                  onClick={() => {
                    const url = `${window.location.origin}/api/generate?content=${encodeURIComponent(buildContent())}&fg=${encodeURIComponent(style.foregroundColor)}`;
                    navigator.clipboard.writeText(url);
                    toast.success("Link copied!");
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Need React import for createElement
import React from "react";
