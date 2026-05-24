# QR Nexus — AI-Powered QR Code Platform

> **Author:** Yashas D
> **Tech Stack:** Next.js 14 · TypeScript · Tailwind CSS · OpenAI GPT-4o · Vercel

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-10A37F?style=flat-square&logo=openai)](https://openai.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com)

**QR Nexus is a full-stack web platform to generate, scan, analyze, and track QR codes — powered by AI.**

[Deploy to Vercel](#deploying-to-vercel) · [Quick Start](#-quick-start) · [API Reference](#-api-reference)

</div>

---

## Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Tech Stack](#️-tech-stack)
4. [Project Structure](#-project-structure)
5. [Quick Start](#-quick-start)
6. [Environment Variables](#-environment-variables)
7. [API Reference](#-api-reference)
8. [Deploying to Vercel](#-deploying-to-vercel)
9. [How It Works](#-how-it-works)
10. [Snapshots](#-snapshots)

---

## 🌟 Overview

QR Nexus is built with **Next.js 14 App Router** and deployed on **Vercel**. It provides a premium dark-themed UI with:

- A **QR code generator** supporting 8 content types with live preview and custom styling
- A **camera + file scanner** that decodes QR codes entirely client-side (no data leaves your browser)
- An **AI layer** (OpenAI GPT-4o mini) that analyzes QR content, detects type, checks safety, and gives improvement suggestions
- An **analytics dashboard** with interactive charts for platform-wide and per-user statistics
- A **history manager** backed by `localStorage` that persists up to 100 generated QR codes with search and filter

> All scanning is done client-side using `jsQR`. No image data is ever sent to a server.

---

## ✨ Features

### 🎨 QR Generator (`/generate`)

| Capability | Detail |
|---|---|
| **QR Types** | URL, WiFi, vCard (contact), Email, SMS, Phone, Geo-location, Plain Text |
| **Live Preview** | QR re-generates automatically as you type (600 ms debounce) |
| **Custom Colors** | Foreground color, background color, linear/radial gradient |
| **Dot Styles** | Square, Dots, Rounded, Classy, Classy-Rounded, Extra-Rounded |
| **Corner Styles** | Square, Extra-Rounded, Dot |
| **Error Correction** | L (7%) · M (15%) · Q (25%) · H (30%) |
| **Color Presets** | Neon Purple, Cyber Cyan, Hot Pink, Matrix Green, Classic Black, Ocean Blue |
| **Export** | PNG download, SVG download, Copy to Clipboard |
| **Auto-detection** | Automatically switches QR type based on what you paste |
| **Save to History** | One-click save — stored in browser localStorage |
| **AI Analysis** | Analyze content with GPT-4o: type, safety, description, suggestions |

#### Supported QR Content Formats

| Type | Example Input | Encoded Format |
|---|---|---|
| URL | `https://yashasd.dev` | Raw URL |
| WiFi | SSID + password + encryption | `WIFI:T:WPA;S:MyNet;P:pass;;` |
| vCard | First/Last name, phone, email, org, website | `BEGIN:VCARD ... END:VCARD` |
| Email | `hello@example.com` | `mailto:hello@example.com` |
| SMS | Phone number + message | `smsto:+91xxxxxxxxxx:message` |
| Phone | `+91 98765 43210` | `tel:+9198765...` |
| Geo | `12.9716,77.5946` | `geo:12.97,77.59` |
| Text | Any free text | Raw string |

---

### 📷 QR Scanner (`/scan`)

- **Camera mode** — uses `navigator.mediaDevices.getUserMedia` for live camera feed; supports front/back camera flip
- **Upload mode** — drag and drop or browse for PNG, JPG, WebP, GIF images
- **Client-side decode** — powered by `jsQR` library; decoding happens entirely in the browser
- **AI scan analysis** — after decoding, optionally sends content to `/api/ai-analyze?action=describe-scan` for a human-readable summary, recommended action, and safety check
- **Type detection** — automatically identifies URL, WiFi, vCard, email, phone, geo, etc. and shows the appropriate icon
- **One-click actions** — Copy decoded text, open URL in new tab

---

### 🤖 AI Features (OpenAI GPT-4o mini)

The AI layer is optional. The app works fully without an API key using **mock/demo mode**.

| Action | Endpoint | What It Does |
|---|---|---|
| `analyze` | `POST /api/ai-analyze` | Identifies type, writes human description, rates safety (safe/suspicious/unknown), gives up to 3 improvement suggestions |
| `suggest` | `POST /api/ai-analyze` | Generates 5 creative example contents for a given QR type |
| `describe-scan` | `POST /api/ai-analyze` | Explains scanned QR content, recommends what to do with it, flags unsafe content |

**Demo mode** (no API key): The server returns smart rule-based mock responses covering URL, WiFi, vCard, email, phone, geo, and text types.

---

### 📊 Analytics Dashboard (`/analytics`)

All platform stats are served from `/api/analytics`. For a production deployment with a real database, replace the mock data in that route.

| Widget | Description |
|---|---|
| **Overview cards** | Total QR codes generated, total scans, avg scans/code, unique visitors |
| **Daily Activity chart** | Area chart — generated vs scanned over 7 / 14 / 30 days |
| **QR Type Breakdown** | Donut pie chart — distribution by type (URL, vCard, WiFi, …) |
| **Device Breakdown** | iOS / Android / Desktop / Other with animated progress bars |
| **Top Countries** | Horizontal bar list with scan counts |
| **Hourly Activity** | Bar chart — scan volume by hour of day (0–23) |
| **Your Local Stats** | Shows real data from your browser's localStorage |

---

### 🗂️ History (`/history`)

- All generated QR codes are auto-saved to `localStorage` (max 100 entries, FIFO)
- **Search** by content or label
- **Filter** by QR type (URL, WiFi, vCard, …)
- **Sort** by newest, oldest, or most scanned
- **Detail sidebar** — full QR preview, AI description, creation date, scan count
- **Download** from history
- **Delete** individual items or clear all

---

## 🏗️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.5 |
| Language | TypeScript | 5.5 |
| Styling | Tailwind CSS + custom CSS | 3.4 |
| Animations | Framer Motion | 11 |
| Charts | Recharts | 2.12 |
| QR Generation | `qrcode` | 1.5 |
| QR Scanning | `jsQR` (100% client-side) | 1.4 |
| AI | OpenAI GPT-4o mini SDK | 4.55 |
| Dates | date-fns | 3.6 |
| Unique IDs | uuid | 10 |
| Toasts | react-hot-toast | 2.4 |
| Icons | Lucide React | 0.441 |
| Image optimization | sharp (used by Next.js) | 0.33 |
| Deployment | Vercel | — |

---

## 📁 Project Structure

```
QR_Code_Generator_And_Scanner-main/
├── app/
│   ├── globals.css              # Global styles, Tailwind directives, custom animations
│   ├── layout.tsx               # Root layout — Navbar, Footer, ThemeProvider, Toaster
│   ├── page.tsx                 # Landing/home page — hero, feature highlights, CTA
│   ├── generate/
│   │   └── page.tsx             # QR Generator — type selector, content form, style panel, AI analyze
│   ├── scan/
│   │   └── page.tsx             # QR Scanner — camera + file upload, jsQR decode, AI results
│   ├── analytics/
│   │   └── page.tsx             # Analytics Dashboard — Recharts widgets, local + server data
│   ├── history/
│   │   └── page.tsx             # History — localStorage list, search/filter/sort, detail sidebar
│   └── api/
│       ├── generate/
│       │   └── route.ts         # POST: generate QR data URL | GET: generate PNG or SVG (download)
│       ├── ai-analyze/
│       │   └── route.ts         # POST: GPT-4o analyze / suggest / describe-scan + demo fallback
│       ├── analytics/
│       │   └── route.ts         # GET: platform-wide analytics JSON (mock data, replace for prod)
│       └── scan/
│           └── route.ts         # GET: health check (scanning is client-side with jsQR)
├── components/
│   ├── Navbar.tsx               # Fixed top navbar with scroll effect, active link highlight, mobile menu
│   └── ThemeProvider.tsx        # Dark/light theme context backed by localStorage
├── lib/
│   ├── qr-utils.ts              # QRType union, interfaces, formatWiFi/vCard/Email/SMS, detectQRType, presets
│   └── storage.ts               # localStorage helpers: history CRUD, scan count, analytics summary
├── public/
│   └── icon.svg                 # App icon
├── .env.example                 # Environment variable template
├── .gitignore
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts           # Tailwind config + custom font variables + extended animations
├── tsconfig.json
└── vercel.json                  # Vercel deployment config (regions: bom1, sin1; CORS headers)
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** (or yarn / pnpm)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/QR_Code_Generator_And_Scanner.git
cd QR_Code_Generator_And_Scanner
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```env
# Optional — AI features work in demo mode without this
OPENAI_API_KEY=sk-your-openai-api-key-here

# Required — set to your domain in production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Create production build |
| `npm run start` | Start production server (requires build first) |
| `npm run lint` | Run ESLint |

---

## 🔑 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | No | — | OpenAI API key for live AI features. Without it, the app uses intelligent demo responses. |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` | Canonical URL — used for OpenGraph metadata. |

> **Privacy note:** The `OPENAI_API_KEY` is a server-side variable only. It is never exposed to the browser.

---

## 🔌 API Reference

### `POST /api/generate` — Generate QR code

**Request body:**

```json
{
  "content": "https://yashasd.dev",
  "width": 400,
  "foregroundColor": "#8B5CF6",
  "backgroundColor": "#ffffff",
  "errorCorrectionLevel": "M",
  "margin": 2
}
```

**Response:**

```json
{
  "success": true,
  "dataUrl": "data:image/png;base64,...",
  "content": "https://yashasd.dev",
  "timestamp": "2026-05-21T12:00:00.000Z"
}
```

---

### `GET /api/generate` — Download QR code

Query parameters:

| Param | Type | Default | Description |
|---|---|---|---|
| `content` | string | **required** | Content to encode |
| `format` | `png` \| `svg` | `png` | Output format |
| `width` | number | `300` | Width in pixels |
| `fg` | string | `#000000` | Foreground color (hex) |
| `bg` | string | `#ffffff` | Background color (hex) |

Example: `GET /api/generate?content=Hello&format=svg&fg=%238B5CF6`

---

### `POST /api/ai-analyze` — AI content analysis

**Request body:**

```json
{
  "content": "https://example.com",
  "action": "analyze"
}
```

**`action` options:**

| Value | What it does |
|---|---|
| `analyze` | Classify type, write description, check safety, give suggestions |
| `suggest` | Generate 5 example contents for a given `type` |
| `describe-scan` | Explain scanned content and recommended action |

**Response (analyze):**

```json
{
  "success": true,
  "type": "url",
  "description": "Website link to example.com",
  "riskLevel": "safe",
  "riskReason": null,
  "suggestions": ["Use a URL shortener", "Add error correction level H"],
  "category": "social",
  "formattedContent": "https://example.com",
  "mock": false
}
```

> If `OPENAI_API_KEY` is not set, `mock: true` is returned with rule-based responses.

---

### `GET /api/analytics` — Analytics data

Returns platform-wide stats (mock data by default). Replace the implementation in `app/api/analytics/route.ts` with your own database queries for production.

**Response shape:**

```json
{
  "overview": { "totalGenerated": 10482, "totalScans": 34291, "avgScansPerCode": 3.27, "uniqueVisitors": 8941 },
  "daily": [{ "date": "2026-05-01", "generated": 80, "scanned": 210 }],
  "typeBreakdown": [{ "type": "url", "count": 4821, "percentage": 46 }],
  "topCountries": [{ "country": "India", "scans": 8420 }],
  "deviceBreakdown": [{ "device": "iOS", "percentage": 42 }],
  "hourlyActivity": [{ "hour": 9, "scans": 320 }]
}
```

---

### `GET /api/scan` — Scanner health check

Returns service info. All actual QR decoding is done client-side with `jsQR`.

---

## 🚀 Deploying to Vercel

### One-click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/QR_Code_Generator_And_Scanner)

### Manual CLI deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Authenticate
vercel login

# Deploy (follow the prompts)
vercel

# Add environment variables
vercel env add OPENAI_API_KEY production
vercel env add NEXT_PUBLIC_APP_URL production

# Promote to production
vercel --prod
```

### Vercel project settings

The `vercel.json` in this repo pre-configures:

- **Build command:** `npm run build`
- **Output:** `.next`
- **Regions:** `bom1` (Mumbai), `sin1` (Singapore) — edit as needed
- **CORS headers:** All `/api/*` routes allow cross-origin requests
- **Environment variables:** Mapped to Vercel secrets `@openai_api_key` and `@app_url`

---

## ⚙️ How It Works

### QR Generation flow

```
User types content
  → debounce 600 ms
  → buildContent() formats it (WiFi/vCard/email/SMS have special formats)
  → POST /api/generate
  → server calls qrcode.toDataURL()
  → <img src={dataUrl} /> displayed in preview panel
  → user can download PNG/SVG or copy to clipboard
```

### QR Scanning flow

```
Camera / file upload
  → canvas.drawImage(videoFrame or image)
  → jsQR(imageData) — entirely in browser, no network call
  → decoded content detected
  → POST /api/ai-analyze { action: "describe-scan" }  ← optional, user-triggered
  → results displayed with type icon, summary, recommended action
```

### AI Analysis flow

```
User clicks "Analyze with AI"
  → POST /api/ai-analyze { content, action: "analyze" }
  → if OPENAI_API_KEY set:
      openai.chat.completions.create({ model: "gpt-4o-mini", ... })
  → else:
      mockAnalyze(content) — rule-based regex detection
  → result sets aiResult state → shown in AI panel
```

### History & Storage

All history is stored in the browser's `localStorage` under the key `qr_nexus_history`.

- Maximum 100 entries (oldest removed first)
- Each entry: `{ id, content, type, dataUrl, style, createdAt, scanCount, label?, aiDescription? }`
- A `storage_updated` event is dispatched after every write so all tabs stay in sync

---

## 🎨 Styling Notes

- **Color palette:** Deep space black (`#050508`) background, violet/purple accent (`#8B5CF6`), cyan secondary (`#06B6D4`)
- **Typography:** `Inter` for body, `Space Grotesk` for headings
- **Glassmorphism:** `.glass` utility — `bg-white/[0.04] backdrop-blur-xl border-white/[0.08]`
- **Gradient text:** `.gradient-text` — `bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400`
- **Neon button:** `.btn-neon` — gradient background with box-shadow glow on hover
- **Animations:** `scan-line`, `pulse-ring`, `float` defined in `globals.css`

---

## Snapshots

<img width="1893" height="907" alt="image" src="https://github.com/user-attachments/assets/113f5807-425d-4c4f-8e33-3ab9d0be3130" />

--
<img width="1590" height="886" alt="image" src="https://github.com/user-attachments/assets/4a90290c-4f18-433b-91ef-5d986dad3209" />

--

<img width="1887" height="885" alt="image" src="https://github.com/user-attachments/assets/6e53e52a-8fd7-4c31-8eb6-b5bd4289140c" />

--

<img width="1883" height="901" alt="image" src="https://github.com/user-attachments/assets/99161a75-870c-46cd-8e4a-24a7562d5957" />


---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
Built with Next.js & OpenAI by <strong>Yashas D</strong>
</div>

## 🤝 Connect With Me

**👨‍💻 Yashas D**  
🔗 [LinkedIn](https://www.linkedin.com/in/yashasd2004/)  
📬 [GitHub](https://github.com/Yashas14)  

> ⭐ If you found this project insightful or helpful, don’t forget to **star ⭐ the repo**, **raise issues**, or contribute! Let’s build impactful solutions together.
