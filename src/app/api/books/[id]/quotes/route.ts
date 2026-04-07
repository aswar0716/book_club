import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quotes = await db.quote.findMany({
    where: { bookId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(quotes);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { text, page }: { text: string; page?: number } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Quote text required" }, { status: 400 });

  const quote = await db.quote.create({
    data: { bookId: id, text: text.trim(), page: page || null },
  });
  return NextResponse.json(quote, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { quoteId }: { quoteId: string } = await req.json();
  await db.quote.delete({ where: { id: quoteId, bookId: id } });
  return NextResponse.json({ ok: true });
}
