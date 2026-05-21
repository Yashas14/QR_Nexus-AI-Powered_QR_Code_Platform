import { NextResponse } from "next/server";

// Scanning is performed entirely client-side with jsQR for best performance.
// This endpoint exists as a health check only.
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "QR Scanner API",
    methods: ["Camera", "File upload (PNG, JPG, WebP, GIF)"],
    powered_by: "jsQR (client-side), ZXing",
  });
}
