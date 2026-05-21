"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scan,
  Camera,
  Upload,
  Copy,
  ExternalLink,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Globe,
  Wifi,
  User,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  FileText,
  X,
  RefreshCw,
  FlipHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import jsQR from "jsqr";
import { detectQRType, getTypeLabel, getTypeColor } from "@/lib/qr-utils";

interface ScanResult {
  rawContent: string;
  type: string;
  summary?: string;
  action?: string;
  safe?: boolean;
  details?: Record<string, string>;
  aiAnalyzed?: boolean;
}

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

export default function ScanPage() {
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">(
    "environment"
  );
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setPermissionDenied(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);
      }
    } catch (err) {
      if ((err as Error).name === "NotAllowedError") {
        setPermissionDenied(true);
        toast.error("Camera permission denied");
      } else {
        toast.error("Failed to access camera");
      }
    }
  }, [cameraFacing]);

  // Stop camera
  const stopCamera = useCallback(() => {
    setScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    cancelAnimationFrame(animFrameRef.current!);
  }, []);

  // Scan loop
  useEffect(() => {
    if (!scanning || mode !== "camera") return;

    const scanFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        handleScanSuccess(code.data);
        return;
      }

      animFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animFrameRef.current = requestAnimationFrame(scanFrame);
    return () => cancelAnimationFrame(animFrameRef.current!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning, mode]);

  // Start/stop on mode change
  useEffect(() => {
    if (mode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode, startCamera, stopCamera]);

  // Restart with flipped camera
  useEffect(() => {
    if (scanning) {
      stopCamera();
      setTimeout(() => startCamera(), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraFacing]);

  const handleScanSuccess = async (rawContent: string) => {
    stopCamera();
    setScanning(false);

    const type = detectQRType(rawContent);
    const basicResult: ScanResult = {
      rawContent,
      type,
      summary: `${getTypeLabel(type as never)} detected`,
      action: getDefaultAction(type),
      safe: true,
    };
    setScanResult(basicResult);

    // AI analysis
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/ai-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: rawContent, action: "describe-scan" }),
      });
      const data = await res.json();
      setScanResult({
        rawContent,
        type: data.type || type,
        summary: data.summary || basicResult.summary,
        action: data.action || basicResult.action,
        safe: data.safe !== false,
        details: data.details,
        aiAnalyzed: true,
      });
    } catch {
      // Keep basic result
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const src = e.target?.result as string;
      setUploadPreview(src);

      // Decode with jsQR
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });
        if (code) {
          handleScanSuccess(code.data);
        } else {
          toast.error("No QR code found in the image");
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const resetScan = () => {
    setScanResult(null);
    setUploadPreview(null);
    if (mode === "camera") {
      startCamera();
    }
  };

  const getDefaultAction = (type: string) => {
    const actions: Record<string, string> = {
      url: "Open this link in your browser",
      wifi: "Connect to this WiFi network",
      vcard: "Save this contact",
      email: "Send an email",
      phone: "Call this number",
      sms: "Send a text message",
      geo: "Open location on maps",
      text: "Read this message",
    };
    return actions[type] || "View content";
  };

  const handleAction = () => {
    if (!scanResult) return;
    const { rawContent, type } = scanResult;
    if (type === "url" && (rawContent.startsWith("http://") || rawContent.startsWith("https://"))) {
      window.open(rawContent, "_blank", "noopener");
    } else if (type === "phone" || rawContent.startsWith("tel:")) {
      window.location.href = rawContent.startsWith("tel:") ? rawContent : `tel:${rawContent}`;
    } else if (type === "email" || rawContent.startsWith("mailto:")) {
      window.location.href = rawContent.startsWith("mailto:") ? rawContent : `mailto:${rawContent}`;
    } else if (type === "geo" || rawContent.startsWith("geo:")) {
      const coords = rawContent.replace("geo:", "").split(",");
      window.open(`https://maps.google.com/?q=${coords[0]},${coords[1]}`, "_blank");
    } else {
      navigator.clipboard.writeText(rawContent);
      toast.success("Content copied!");
    }
  };

  const typeColor = scanResult ? getTypeColor(scanResult.type as never) : "#8B5CF6";
  const TypeIcon = scanResult ? (TYPE_ICONS[scanResult.type] || FileText) : FileText;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white font-[var(--font-space)] mb-2">
            QR <span className="gradient-text">Scanner</span>
          </h1>
          <p className="text-white/50">
            Scan QR codes with your camera or upload an image — AI analysis included
          </p>
        </motion.div>

        <div className="grid md:grid-cols-[1fr_360px] gap-6">
          {/* ─── SCANNER ─────────────────────────────────── */}
          <div className="space-y-5">
            {/* Mode Switch */}
            <div className="glass rounded-2xl p-1 flex gap-1">
              <button
                onClick={() => { setScanResult(null); setMode("camera"); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  mode === "camera"
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "text-white/50 hover:text-white/70"
                }`}
              >
                <Camera className="w-4 h-4" />
                Live Camera
              </button>
              <button
                onClick={() => { setScanResult(null); setMode("upload"); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  mode === "upload"
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "text-white/50 hover:text-white/70"
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload Image
              </button>
            </div>

            {/* Camera View */}
            {mode === "camera" && (
              <div className="glass rounded-2xl overflow-hidden relative">
                {permissionDenied ? (
                  <div className="aspect-video flex flex-col items-center justify-center gap-4 p-8">
                    <Camera className="w-12 h-12 text-white/20" />
                    <p className="text-white/60 text-center">
                      Camera permission denied. Please allow camera access in your browser settings.
                    </p>
                    <button onClick={startCamera} className="btn-neon text-sm">
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="relative aspect-video bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Scan overlay */}
                    {scanning && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Corner guides */}
                        <div className="relative w-48 h-48">
                          <div className="absolute top-0 left-0 w-8 h-8 border-l-3 border-t-3 border-cyan-400 rounded-tl-lg border-l-4 border-t-4" />
                          <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-cyan-400 rounded-tr-lg" />
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-cyan-400 rounded-bl-lg" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-cyan-400 rounded-br-lg" />

                          {/* Scan line */}
                          <div className="absolute left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent scan-overlay" />
                        </div>
                      </div>
                    )}

                    {/* Controls overlay */}
                    <div className="absolute bottom-3 right-3 flex gap-2">
                      <button
                        onClick={() => setCameraFacing(f => f === "environment" ? "user" : "environment")}
                        className="p-2 rounded-xl glass text-white/70 hover:text-white"
                        title="Flip camera"
                      >
                        <FlipHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {scanning && (
                      <div className="absolute top-3 left-3">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur text-xs text-cyan-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          Scanning...
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Upload View */}
            {mode === "upload" && (
              <div
                className="glass rounded-2xl overflow-hidden"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleFileUpload(file);
                }}
              >
                {uploadPreview ? (
                  <div className="relative">
                    <img
                      src={uploadPreview}
                      alt="Uploaded"
                      className="w-full max-h-80 object-contain"
                    />
                    <button
                      onClick={() => { setUploadPreview(null); setScanResult(null); }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="aspect-video flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-colors p-8 border-2 border-dashed border-white/10 hover:border-violet-500/30 rounded-2xl"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 text-violet-400/60" />
                    <div className="text-center">
                      <p className="text-white/70 font-medium">Drop image here or click to upload</p>
                      <p className="text-white/30 text-sm mt-1">PNG, JPG, WebP, GIF supported</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Tips */}
            {!scanResult && (
              <div className="glass rounded-xl p-4">
                <p className="text-white/40 text-xs font-medium mb-2">Tips for best results:</p>
                <ul className="space-y-1 text-white/30 text-xs">
                  <li>• Hold the QR code steady and well-lit</li>
                  <li>• Keep it within 10–50cm of the camera</li>
                  <li>• Avoid glare and blurry images</li>
                  <li>• Use H error correction for damaged codes</li>
                </ul>
              </div>
            )}
          </div>

          {/* ─── RESULT PANEL ──────────────────────────────── */}
          <div>
            <AnimatePresence mode="wait">
              {isAnalyzing && !scanResult && (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass rounded-2xl p-8 flex flex-col items-center gap-4"
                >
                  <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
                  <p className="text-white/60">AI is analyzing the QR code...</p>
                </motion.div>
              )}

              {scanResult && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4"
                >
                  {/* Type header */}
                  <div className="glass rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl"
                        style={{
                          background: `${typeColor}15`,
                          border: `1px solid ${typeColor}30`,
                        }}
                      >
                        <TypeIcon
                          className="w-4 h-4"
                          style={{ color: typeColor }}
                        />
                        <span className="text-sm font-medium" style={{ color: typeColor }}>
                          {getTypeLabel(scanResult.type as never)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {scanResult.safe !== false ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 text-xs">Safe</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-400 text-xs">Review</span>
                          </>
                        )}
                        {scanResult.aiAnalyzed && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 text-xs border border-violet-500/25">
                            <Sparkles className="w-2.5 h-2.5" />
                            AI
                          </span>
                        )}
                        {isAnalyzing && (
                          <Loader2 className="w-3 h-3 text-violet-400 animate-spin" />
                        )}
                      </div>
                    </div>

                    {scanResult.summary && (
                      <p className="text-white/80 text-sm mb-3">{scanResult.summary}</p>
                    )}

                    {scanResult.action && (
                      <p className="text-white/40 text-xs mb-4">→ {scanResult.action}</p>
                    )}

                    {/* Raw content */}
                    <div className="bg-white/5 rounded-xl p-3 mb-4">
                      <p className="text-white/40 text-xs mb-1">Raw Content</p>
                      <p className="text-white/80 text-sm font-mono break-all leading-relaxed">
                        {scanResult.rawContent.slice(0, 300)}
                        {scanResult.rawContent.length > 300 && (
                          <span className="text-white/30">
                            ... ({scanResult.rawContent.length - 300} more chars)
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Details */}
                    {scanResult.details && Object.keys(scanResult.details).length > 0 && (
                      <div className="mb-4 space-y-2">
                        <p className="text-white/40 text-xs">Parsed Details</p>
                        {Object.entries(scanResult.details).map(([k, v]) => (
                          <div key={k} className="flex items-start gap-2 text-sm">
                            <span className="text-white/40 capitalize min-w-[80px]">{k}:</span>
                            <span className="text-white/80 break-all">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleAction}
                        className="btn-neon flex-1 flex items-center justify-center gap-2 text-sm py-2.5"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {scanResult.type === "url" ? "Open Link" : 
                         scanResult.type === "wifi" ? "View WiFi" :
                         scanResult.type === "vcard" ? "Save Contact" : "Open"}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(scanResult.rawContent);
                          toast.success("Copied!");
                        }}
                        className="glass px-4 py-2.5 rounded-xl text-white/60 hover:text-white text-sm flex items-center gap-1.5 transition-all"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Scan again */}
                  <button
                    onClick={resetScan}
                    className="w-full flex items-center justify-center gap-2 py-3 glass rounded-xl text-white/60 hover:text-white text-sm transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Scan Another
                  </button>
                </motion.div>
              )}

              {!scanResult && !isAnalyzing && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-8 flex flex-col items-center gap-4 text-center"
                >
                  <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center">
                    <Scan className="w-10 h-10 text-violet-400/60" />
                  </div>
                  <div>
                    <p className="text-white/60 font-medium">
                      Waiting for QR code
                    </p>
                    <p className="text-white/30 text-sm mt-1">
                      Point camera at a QR code or upload an image to begin scanning
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full mt-2">
                    <p className="text-white/30 text-xs">Supports all QR types:</p>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {["URL", "WiFi", "vCard", "Email", "Phone", "SMS", "Location", "Text"].map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-xs border border-white/5">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
