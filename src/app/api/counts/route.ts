import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [total, reading, wantToRead, finished, favourites] = await Promise.all([
    db.book.count(),
    db.book.count({ where: { status: "reading" } }),
    db.book.count({ where: { status: "want_to_read" } }),
    db.book.count({ where: { status: "finished" } }),
    db.book.count({ where: { isFavorite: true } }),
  ]);

  return NextResponse.json({ total, reading, wantToRead, finished, favourites });
}
