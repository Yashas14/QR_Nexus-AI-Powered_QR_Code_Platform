"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  QrCode,
  Scan,
  Sparkles,
  Zap,
  Shield,
  BarChart3,
  Palette,
  Download,
  Share2,
  History,
  ArrowRight,
  Star,
  CheckCircle2,
  Layers,
  Globe,
  Wifi,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Calendar,
  CreditCard,
  Rocket,
  Brain,
  Lock,
  Cpu,
} from "lucide-react";

const TYPEWRITER_TEXTS = [
  "URLs & Links",
  "WiFi Credentials",
  "vCards & Contacts",
  "Payment Info",
  "Location Data",
  "Custom Messages",
];

const FEATURES = [
  {
    icon: Brain,
    title: "AI Content Analysis",
    description:
      "Paste any text and our AI instantly detects the type — URL, WiFi, vCard, email — and formats it perfectly with GPT-4o intelligence.",
    gradient: "from-violet-500 to-purple-600",
    glow: "rgba(139,92,246,0.3)",
  },
  {
    icon: Palette,
    title: "Custom QR Styling",
    description:
      "Design stunning QR codes with gradient colors, custom dot shapes, embedded logos, and eye styles — all real-time preview.",
    gradient: "from-pink-500 to-rose-600",
    glow: "rgba(236,72,153,0.3)",
  },
  {
    icon: Scan,
    title: "Real-Time Scanner",
    description:
      "Scan QR codes instantly via camera or file upload with WebRTC. AI decodes content and provides smart security analysis.",
    gradient: "from-cyan-500 to-blue-600",
    glow: "rgba(6,182,212,0.3)",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description:
      "Track scan counts, geography, device types, and time trends with beautiful interactive Recharts dashboards.",
    gradient: "from-emerald-500 to-teal-600",
    glow: "rgba(16,185,129,0.3)",
  },
  {
    icon: Layers,
    title: "Batch Generation",
    description:
      "Generate hundreds of QR codes at once from CSV data. Perfect for events, products, and marketing campaigns.",
    gradient: "from-orange-500 to-amber-600",
    glow: "rgba(245,158,11,0.3)",
  },
  {
    icon: Share2,
    title: "One-Click Sharing",
    description:
      "Export as PNG, SVG, or PDF with custom resolution. Share via link, embed code, or direct social media integration.",
    gradient: "from-indigo-500 to-violet-600",
    glow: "rgba(99,102,241,0.3)",
  },
];

const QR_TYPES = [
  { icon: Globe, label: "URL", color: "#8B5CF6" },
  { icon: Wifi, label: "WiFi", color: "#06B6D4" },
  { icon: Phone, label: "Phone", color: "#10B981" },
  { icon: Mail, label: "Email", color: "#F59E0B" },
  { icon: MapPin, label: "Location", color: "#EF4444" },
  { icon: MessageSquare, label: "SMS", color: "#EC4899" },
  { icon: Calendar, label: "Event", color: "#6366F1" },
  { icon: CreditCard, label: "Payment", color: "#14B8A6" },
];

const STATS = [
  { value: "10M+", label: "QR Codes Generated" },
  { value: "50ms", label: "Avg Generation Time" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "150+", label: "Countries Served" },
];

const TECH_STACK = [
  { name: "Next.js 14", desc: "App Router & Server Actions" },
  { name: "GPT-4o", desc: "AI Content Intelligence" },
  { name: "TypeScript", desc: "End-to-end Type Safety" },
  { name: "Tailwind CSS", desc: "Utility-first Styling" },
  { name: "Framer Motion", desc: "Physics-based Animations" },
  { name: "Vercel Edge", desc: "Global CDN Deployment" },
];

export default function HomePage() {
  const [typeIndex, setTypeIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    const current = TYPEWRITER_TEXTS[typeIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting && displayText === current) {
          setTimeout(() => setIsDeleting(true), 1500);
        } else if (isDeleting && displayText === "") {
          setIsDeleting(false);
          setTypeIndex((i) => (i + 1) % TYPEWRITER_TEXTS.length);
        } else {
          setDisplayText((prev) =>
            isDeleting ? prev.slice(0, -1) : current.slice(0, prev.length + 1)
          );
        }
      },
      isDeleting ? 60 : 100
    );
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, typeIndex]);

  return (
    <div className="min-h-screen">
      {/* ─── HERO ─────────────────────────────────────────── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-[95vh] flex items-center justify-center px-6 pt-20 overflow-hidden"
      >
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[100px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-600/15 rounded-full blur-[80px] animate-pulse-slow delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-[60px] animate-float" />
        </div>

        {/* Animated particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="particle absolute w-1 h-1 rounded-full"
            style={{
              left: `${8 + i * 8}%`,
              top: `${15 + (i % 4) * 18}%`,
              "--duration": `${5 + i * 1.2}s`,
              "--delay": `${i * 0.5}s`,
              background: i % 2 === 0 ? "rgba(139,92,246,0.6)" : "rgba(6,182,212,0.5)",
            } as React.CSSProperties}
          />
        ))}

        <div className="max-w-6xl mx-auto text-center z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/30 text-violet-300 text-sm mb-8 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Powered by Next.js 14 + OpenAI GPT-4o + Edge Functions</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 font-[var(--font-space)]"
          >
            <span className="text-white">The Smartest</span>
            <br />
            <span className="gradient-text animate-gradient bg-[length:200%_auto]">QR Code Platform</span>
            <br />
            <span className="text-white text-4xl md:text-5xl">for </span>
            <span className="gradient-text-pink text-4xl md:text-5xl">
              {displayText}
              <span className="animate-pulse text-violet-400">|</span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Generate beautiful, AI-analyzed QR codes in milliseconds. Scan with live
            camera, track analytics, and deploy to production — all from one
            futuristic dashboard.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/generate">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(139,92,246,0.8)" }}
                whileTap={{ scale: 0.95 }}
                className="btn-neon flex items-center gap-2 text-lg"
              >
                <QrCode className="w-5 h-5" />
                Generate QR Code
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link href="/scan">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(6,182,212,0.8)" }}
                whileTap={{ scale: 0.95 }}
                className="btn-neon-cyan flex items-center gap-2 text-lg"
              >
                <Scan className="w-5 h-5" />
                Start Scanning
              </motion.button>
            </Link>
          </motion.div>

          {/* QR Type Pills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            {QR_TYPES.map(({ icon: Icon, label, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                whileHover={{ scale: 1.1, y: -2 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:border-white/20 transition-all cursor-pointer"
                style={{ borderColor: `${color}30` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color }} />
                <span className="text-white/70 text-sm">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ─── STATS ─────────────────────────────────────────── */}
      <section className="py-16 px-6 border-y border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-950/20 via-transparent to-cyan-950/20" />
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          {STATS.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center group"
            >
              <p className="text-3xl md:text-4xl font-bold gradient-text font-[var(--font-space)] group-hover:scale-110 transition-transform">
                {value}
              </p>
              <p className="text-white/50 text-sm mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ──────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs mb-4">
              <Rocket className="w-3 h-3" />
              Next-Gen Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-[var(--font-space)]">
              Everything you need,{" "}
              <span className="gradient-text">nothing you don&apos;t</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Built with cutting-edge web technologies and AI capabilities for
              the most powerful QR experience ever.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(
              ({ icon: Icon, title, description, gradient, glow }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="feature-card group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-full blur-2xl" style={{ background: `linear-gradient(135deg, ${glow}, transparent)` }} />
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                    style={{ boxShadow: `0 0 20px ${glow}` }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {description}
                  </p>
                </motion.div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-violet-950/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-[var(--font-space)]">
              From idea to QR in{" "}
              <span className="gradient-text">3 seconds</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Enter your content",
                desc: "Type a URL, paste WiFi credentials, or enter contact info. AI auto-detects the type instantly.",
                icon: Zap,
              },
              {
                step: "02",
                title: "Customize the design",
                desc: "Pick colors, shapes, add your logo, choose a frame style — make it uniquely yours with real-time preview.",
                icon: Palette,
              },
              {
                step: "03",
                title: "Download & share",
                desc: "Export as PNG, SVG or PDF at any resolution. Share via link or embed directly on your website.",
                icon: Download,
              },
            ].map(({ step, title, desc, icon: Icon }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -5 }}
                className="relative text-center"
              >
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[50%] h-px bg-gradient-to-r from-violet-500/40 to-transparent" />
                )}
                <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mx-auto mb-4 relative group">
                  <Icon className="w-7 h-7 text-violet-400 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-2 -right-2 text-xs font-bold text-violet-300 bg-violet-900/80 w-5 h-5 rounded-full flex items-center justify-center border border-violet-500/50">
                    {step.slice(-1)}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI HIGHLIGHT ──────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-8 md:p-12 border border-violet-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs mb-4">
                  <Brain className="w-3 h-3" />
                  AI-Powered Feature
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-space)]">
                  Smart Content Detection with{" "}
                  <span className="gradient-text">GPT-4o</span>
                </h2>
                <p className="text-white/60 mb-6 leading-relaxed">
                  Just paste anything — a URL, an email, a phone number, WiFi
                  details — and our AI automatically formats it into the correct
                  QR standard, suggests improvements, and even generates a
                  description for your QR code.
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    "Auto-detects URL, WiFi, vCard, geo, email, SMS, phone",
                    "Suggests optimizations and corrections",
                    "Generates human-readable descriptions",
                    "Classifies QR code risk level (security)",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-white/70 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-48 h-48 rounded-2xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/30 flex items-center justify-center relative"
                >
                  <Brain className="w-20 h-20 text-violet-400/60" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/10 to-transparent animate-pulse" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── TECH STACK ────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs mb-4">
              <Cpu className="w-3 h-3" />
              Built with Modern Tech
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-[var(--font-space)]">
              Cutting-Edge <span className="gradient-text">Technology Stack</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {TECH_STACK.map(({ name, desc }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.05, borderColor: "rgba(139,92,246,0.4)" }}
                className="glass rounded-xl p-4 text-center border border-white/5 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300"
              >
                <p className="text-white font-semibold text-sm">{name}</p>
                <p className="text-white/40 text-xs mt-1">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUST BADGES ──────────────────────────────────── */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          {[
            { icon: Shield, label: "Privacy First", desc: "No data stored on servers" },
            { icon: Zap, label: "Lightning Fast", desc: "< 100ms generation time" },
            { icon: Lock, label: "Secure by Default", desc: "End-to-end encrypted" },
            { icon: Globe, label: "Edge Deployed", desc: "Global CDN network" },
          ].map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{label}</p>
                <p className="text-white/40 text-xs">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-t from-violet-950/10 to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-[var(--font-space)]">
            Ready to go <span className="gradient-text">next-level</span>?
          </h2>
          <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
            Start for free. No sign-up required. Generate your first AI-powered
            QR code right now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/generate">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-neon flex items-center gap-2 text-lg"
              >
                <QrCode className="w-5 h-5" />
                Start Building Free
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link href="/analytics">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl glass text-white/70 hover:text-white hover:border-white/20 transition-all duration-300 font-semibold"
              >
                <History className="w-5 h-5" />
                View Analytics Demo
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
