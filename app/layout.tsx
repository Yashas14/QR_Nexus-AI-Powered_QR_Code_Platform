import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: {
    default: "QR Nexus — AI-Powered QR Platform",
    template: "%s | QR Nexus",
  },
  description:
    "Generate stunning custom QR codes, scan in real-time, analyze content with AI, track analytics — all in one blazing-fast platform.",
  keywords: [
    "QR code generator",
    "QR scanner",
    "AI QR code",
    "custom QR design",
    "QR analytics",
    "bulk QR generator",
  ],
  authors: [{ name: "QR Nexus Team" }],
  creator: "QR Nexus",
  openGraph: {
    title: "QR Nexus — AI-Powered QR Platform",
    description:
      "Next-level QR code platform with AI content analysis, custom styling, real-time scanning & analytics.",
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "QR Nexus",
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Nexus — AI-Powered QR Platform",
    description: "Generate, scan & analyze QR codes with AI power.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon-192.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#8B5CF6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-[#050508] min-h-screen`}
      >
        <ThemeProvider>
          <div className="relative overflow-hidden">
            {/* Background grid pattern */}
            <div
              className="fixed inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)`,
                backgroundSize: "50px 50px",
              }}
            />
            {/* Gradient orbs */}
            <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

            <Navbar />
            <main className="relative z-10 min-h-screen">{children}</main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-8 mt-16">
              <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Q</span>
                  </div>
                  <span className="text-white/50 text-sm">
                    QR Nexus © {new Date().getFullYear()}
                  </span>
                </div>
                <p className="text-white/30 text-xs">
                  Powered by Next.js, OpenAI & Vercel &nbsp;·&nbsp; All rights reserved to{" "}
                  <span className="text-violet-400/60">Yashas D</span>
                </p>
                <div className="flex gap-6 text-white/40 text-sm">
                  <a href="#" className="hover:text-white/70 transition-colors">
                    Privacy
                  </a>
                  <a href="#" className="hover:text-white/70 transition-colors">
                    Terms
                  </a>
                  
                </div>
              </div>
            </footer>
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: "rgba(15,15,25,0.95)",
                color: "#fff",
                border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: "12px",
                backdropFilter: "blur(16px)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
