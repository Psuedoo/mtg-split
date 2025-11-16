import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json(
      { error: "Missing 'name' query param" },
      { status: 400 },
    );
  }

  const scryfallRes = await fetch(
    `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(name)}`,
    {
      headers: {
        "User-Agent": "MTGSplit/1.0",
      },
    },
  );

  const data = await scryfallRes.json();
  return NextResponse.json(data, { status: scryfallRes.status });
}
