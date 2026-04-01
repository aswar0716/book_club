import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await db.book.findUnique({ where: { id }, include: { chatMessages: true } });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(book);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const updated = await db.book.update({
    where: { id },
    data: {
      ...(body.status      !== undefined && { status:      body.status      }),
      ...(body.rating      !== undefined && { rating:      body.rating      }),
      ...(body.isFavorite  !== undefined && { isFavorite:  body.isFavorite  }),
      ...(body.notes       !== undefined && { notes:       body.notes       }),
      ...(body.currentPage !== undefined && { currentPage: body.currentPage }),
      ...(body.genres      !== undefined && { genres:      JSON.stringify(body.genres) }),
      ...(body.status === "reading"  && !body.startedAt  && { startedAt:  new Date() }),
      ...(body.status === "finished" && !body.finishedAt && { finishedAt: new Date() }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.book.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
