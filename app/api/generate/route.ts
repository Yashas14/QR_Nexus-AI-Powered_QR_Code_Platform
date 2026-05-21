import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      content,
      width = 400,
      errorCorrectionLevel = "M",
      foregroundColor = "#8B5CF6",
      backgroundColor = "#ffffff",
      margin = 2,
    } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "content is required and must be a string" },
        { status: 400 }
      );
    }

    if (content.length > 2950) {
      return NextResponse.json(
        { error: "Content too long for QR code (max ~2950 chars)" },
        { status: 400 }
      );
    }

    const dataUrl = await QRCode.toDataURL(content, {
      width,
      margin,
      errorCorrectionLevel: errorCorrectionLevel as "L" | "M" | "Q" | "H",
      color: {
        dark: foregroundColor,
        light: backgroundColor,
      },
    });

    return NextResponse.json({
      success: true,
      dataUrl,
      content,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("[QR Generate API] Error:", error);
    const message = error instanceof Error ? error.message : "QR generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const content = searchParams.get("content");
  const format = searchParams.get("format") || "png";
  const width = parseInt(searchParams.get("width") || "300");
  const fg = searchParams.get("fg") || "#000000";
  const bg = searchParams.get("bg") || "#ffffff";

  if (!content) {
    return NextResponse.json({ error: "content query param required" }, { status: 400 });
  }

  try {
    if (format === "svg") {
      const svg = await QRCode.toString(content, {
        type: "svg",
        width,
        color: { dark: fg, light: bg },
      });
      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    const buffer = await QRCode.toBuffer(content, {
      type: "png",
      width,
      color: { dark: fg, light: bg },
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="qr-code.png"',
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
