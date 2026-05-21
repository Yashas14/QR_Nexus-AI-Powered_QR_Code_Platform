import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, action = "analyze" } = body;

    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    // If no API key, return intelligent mock response
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(mockAnalyze(content));
    }

    if (action === "analyze") {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert QR code content analyzer. Analyze the given content and return a JSON response with the following fields:
- type: one of [url, wifi, vcard, email, sms, phone, geo, text, event, payment]
- description: a short human-friendly description (max 120 chars)
- suggestions: array of up to 3 improvement suggestions (strings)
- riskLevel: "safe" | "suspicious" | "unknown"
- riskReason: brief explanation if suspicious
- formattedContent: the properly formatted content for QR encoding (if improvement needed)
- category: one of [social, business, personal, tech, location, communication, finance, other]
Always respond with valid JSON only.`,
          },
          {
            role: "user",
            content: `Analyze this QR code content: "${content}"`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
        temperature: 0.3,
      });

      const result = JSON.parse(
        completion.choices[0]?.message?.content || "{}"
      );
      return NextResponse.json({ success: true, ...result });
    }

    if (action === "suggest") {
      // Generate content suggestions based on type
      const { type } = body;
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a QR code content expert. Generate 5 creative, practical examples of QR code content for the given type. Return JSON with a "suggestions" array of strings.`,
          },
          {
            role: "user",
            content: `Generate 5 example contents for QR type: ${type}`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 400,
      });

      const result = JSON.parse(
        completion.choices[0]?.message?.content || "{}"
      );
      return NextResponse.json({ success: true, ...result });
    }

    if (action === "describe-scan") {
      // Analyze scanned QR content
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are analyzing QR code scan results. Given scanned content, provide:
- type: content type
- summary: brief plain-English summary  
- action: what a user should do with this (e.g. "Visit this website", "Save this contact", "Connect to WiFi")
- safe: boolean - is this safe to act on?
- details: object with parsed key-value details
Return valid JSON only.`,
          },
          {
            role: "user",
            content: `Analyze this scanned QR content: "${content}"`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 400,
        temperature: 0.2,
      });

      const result = JSON.parse(
        completion.choices[0]?.message?.content || "{}"
      );
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    console.error("[AI Analyze API] Error:", error);
    const message = error instanceof Error ? error.message : "AI analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── Fallback mock for when no API key is set ─────────────────
function mockAnalyze(content: string) {
  const trimmed = content.trim();
  let type = "text";
  let description = "Plain text content";
  let category = "other";

  if (/^https?:\/\//i.test(trimmed)) {
    type = "url";
    description = `Website link: ${trimmed.slice(0, 50)}`;
    category = "social";
  } else if (/^WIFI:/i.test(trimmed)) {
    type = "wifi";
    description = "WiFi network credentials";
    category = "tech";
  } else if (/^BEGIN:VCARD/i.test(trimmed)) {
    type = "vcard";
    description = "Contact card (vCard format)";
    category = "personal";
  } else if (/^mailto:/i.test(trimmed)) {
    type = "email";
    description = `Email to ${trimmed.replace("mailto:", "").split("?")[0]}`;
    category = "communication";
  } else if (/^tel:|^\+?[\d\s()-]{7,}$/.test(trimmed)) {
    type = "phone";
    description = "Phone number";
    category = "communication";
  } else if (/^geo:/i.test(trimmed)) {
    type = "geo";
    description = "Geographic coordinates / location";
    category = "location";
  }

  return {
    success: true,
    type,
    description,
    category,
    riskLevel: "safe",
    riskReason: null,
    suggestions: [
      "Add error correction level H for better scan reliability",
      "Consider using a URL shortener for cleaner codes",
      "Add a logo for brand recognition",
    ],
    formattedContent: content,
    mock: true,
  };
}
