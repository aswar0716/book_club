import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OLBook } from "@/lib/openLibrary";

export async function GET() {
  const books = await db.book.findMany({ orderBy: { addedAt: "desc" } });
  return NextResponse.json(books);
}

export async function POST(req: NextRequest) {
  const { book, status }: { book: OLBook; status: string } = await req.json();

  const existing = await db.book.findUnique({ where: { openLibraryId: book.id } });
  if (existing) {
    return NextResponse.json(existing);
  }

  const created = await db.book.create({
    data: {
      openLibraryId: book.id,
      title:         book.title,
      author:        book.author,
      coverUrl:      book.coverUrl,
      description:   book.description,
      publishYear:   book.publishYear,
      pageCount:     book.pageCount,
      genres:        JSON.stringify(book.genres),
      status,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
