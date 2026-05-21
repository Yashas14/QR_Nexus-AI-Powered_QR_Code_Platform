import { NextResponse } from "next/server";

export async function GET() {
  // Return mock analytics data for demo
  // In production, this would query a database
  const data = {
    overview: {
      totalGenerated: 10482,
      totalScans: 34291,
      avgScansPerCode: 3.27,
      uniqueVisitors: 8941,
    },
    daily: Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return {
        date: d.toISOString().slice(0, 10),
        generated: Math.floor(Math.random() * 120 + 20),
        scanned: Math.floor(Math.random() * 400 + 50),
      };
    }),
    typeBreakdown: [
      { type: "url", count: 4821, percentage: 46 },
      { type: "vcard", count: 2104, percentage: 20 },
      { type: "wifi", count: 1573, percentage: 15 },
      { type: "email", count: 836, percentage: 8 },
      { type: "sms", count: 523, percentage: 5 },
      { type: "text", count: 625, percentage: 6 },
    ],
    topCountries: [
      { country: "India", scans: 8420 },
      { country: "United States", scans: 6310 },
      { country: "Germany", scans: 3201 },
      { country: "UK", scans: 2844 },
      { country: "Japan", scans: 1980 },
    ],
    deviceBreakdown: [
      { device: "iOS", percentage: 42 },
      { device: "Android", percentage: 38 },
      { device: "Desktop", percentage: 14 },
      { device: "Other", percentage: 6 },
    ],
    hourlyActivity: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      scans: Math.floor(
        Math.random() * 200 + (hour >= 9 && hour <= 21 ? 100 : 10)
      ),
    })),
  };

  return NextResponse.json(data);
}
