// QR Code type definitions and utilities

export type QRType =
  | "url"
  | "wifi"
  | "vcard"
  | "email"
  | "sms"
  | "phone"
  | "geo"
  | "text"
  | "event"
  | "payment";

export interface QRStyle {
  foregroundColor: string;
  backgroundColor: string;
  gradientColor?: string;
  gradientType?: "linear" | "radial";
  dotStyle:
    | "square"
    | "dots"
    | "rounded"
    | "classy"
    | "classy-rounded"
    | "extra-rounded";
  cornerStyle: "square" | "extra-rounded" | "dot";
  cornerDotStyle: "square" | "dot";
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
  logoUrl?: string;
  logoSize?: number;
  margin?: number;
  width?: number;
}

export interface QRGenerateRequest {
  content: string;
  type: QRType;
  style?: Partial<QRStyle>;
}

export interface QRHistoryItem {
  id: string;
  content: string;
  type: QRType;
  dataUrl: string;
  style: Partial<QRStyle>;
  createdAt: string;
  scanCount: number;
  label?: string;
  aiDescription?: string;
}

export interface WiFiQRData {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden?: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
}

export interface EmailQRData {
  to: string;
  subject?: string;
  body?: string;
}

export interface SMSQRData {
  phone: string;
  message?: string;
}



// ─── Formatters ──────────────────────────────────────────────
export function formatWiFi(data: WiFiQRData): string {
  return `WIFI:T:${data.encryption};S:${escapeWifi(data.ssid)};P:${escapeWifi(data.password)};H:${data.hidden ? "true" : "false"};;`;
}

export function formatVCard(data: VCardData): string {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${data.firstName} ${data.lastName}`,
    `N:${data.lastName};${data.firstName};;;`,
    data.organization ? `ORG:${data.organization}` : "",
    data.title ? `TITLE:${data.title}` : "",
    data.phone ? `TEL;TYPE=WORK,VOICE:${data.phone}` : "",
    data.email ? `EMAIL:${data.email}` : "",
    data.website ? `URL:${data.website}` : "",
    data.address ? `ADR:;;${data.address};;;;` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatEmail(data: EmailQRData): string {
  let result = `mailto:${data.to}`;
  const params: string[] = [];
  if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
  if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);
  if (params.length) result += `?${params.join("&")}`;
  return result;
}

export function formatSMS(data: SMSQRData): string {
  return data.message
    ? `smsto:${data.phone}:${data.message}`
    : `tel:${data.phone}`;
}

// ─── Detectors ───────────────────────────────────────────────
export function detectQRType(content: string): QRType {
  const trimmed = content.trim();
  if (/^(https?:\/\/)/i.test(trimmed)) return "url";
  if (/^WIFI:/i.test(trimmed)) return "wifi";
  if (/^BEGIN:VCARD/i.test(trimmed)) return "vcard";
  if (/^mailto:/i.test(trimmed)) return "email";
  if (/^smsto:/i.test(trimmed) || /^sms:/i.test(trimmed)) return "sms";
  if (/^tel:/i.test(trimmed) || /^\+?[\d\s-]{7,}$/.test(trimmed)) return "phone";
  if (/^geo:/i.test(trimmed)) return "geo";
  if (/^BEGIN:VEVENT/i.test(trimmed)) return "event";
  return "text";
}

export function getTypeLabel(type: QRType): string {
  const labels: Record<QRType, string> = {
    url: "Website URL",
    wifi: "WiFi Network",
    vcard: "Contact Card",
    email: "Email",
    sms: "SMS Message",
    phone: "Phone Number",
    geo: "Location",
    text: "Plain Text",
    event: "Calendar Event",
    payment: "Payment",
  };
  return labels[type];
}

export function getTypeColor(type: QRType): string {
  const colors: Record<QRType, string> = {
    url: "#8B5CF6",
    wifi: "#06B6D4",
    vcard: "#10B981",
    email: "#F59E0B",
    sms: "#EC4899",
    phone: "#22C55E",
    geo: "#EF4444",
    text: "#94A3B8",
    event: "#6366F1",
    payment: "#14B8A6",
  };
  return colors[type];
}

// ─── Helpers ─────────────────────────────────────────────────
function escapeWifi(s: string): string {
  return s.replace(/[\\;,":]/g, (c) => `\\${c}`);
}

export const DEFAULT_STYLE: QRStyle = {
  foregroundColor: "#8B5CF6",
  backgroundColor: "#ffffff",
  gradientColor: "#3B82F6",
  gradientType: "linear",
  dotStyle: "dots",
  cornerStyle: "extra-rounded",
  cornerDotStyle: "dot",
  errorCorrectionLevel: "M",
  margin: 2,
  width: 300,
};

export const QR_PRESETS: { name: string; style: Partial<QRStyle> }[] = [
  {
    name: "Neon Purple",
    style: { foregroundColor: "#8B5CF6", gradientColor: "#3B82F6", dotStyle: "dots", cornerStyle: "extra-rounded" },
  },
  {
    name: "Cyber Cyan",
    style: { foregroundColor: "#06B6D4", gradientColor: "#10B981", dotStyle: "extra-rounded", cornerStyle: "extra-rounded" },
  },
  {
    name: "Hot Pink",
    style: { foregroundColor: "#EC4899", gradientColor: "#F59E0B", dotStyle: "rounded", cornerStyle: "extra-rounded" },
  },
  {
    name: "Matrix Green",
    style: { foregroundColor: "#22C55E", gradientColor: "#10B981", dotStyle: "dots", cornerStyle: "square" },
  },
  {
    name: "Classic Black",
    style: { foregroundColor: "#000000", dotStyle: "square", cornerStyle: "square", gradientColor: undefined },
  },
  {
    name: "Ocean Blue",
    style: { foregroundColor: "#1D4ED8", gradientColor: "#7C3AED", dotStyle: "classy-rounded", cornerStyle: "extra-rounded" },
  },
];
