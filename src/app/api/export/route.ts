import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function esc(val: string | null | undefined): string {
  if (!val) return "";
  // Wrap in quotes and escape internal quotes
  return `"${val.replace(/"/g, '""')}"`;
}

export async function GET() {
  const books = await db.book.findMany({
    orderBy: { addedAt: "desc" },
    include: { quotes: true },
  });

  const headers = [
    "Title", "Author", "Status", "Rating", "Favourite",
    "Genres", "Pages", "Publish Year", "Current Page",
    "Started", "Finished", "Added", "Notes", "Quotes",
  ];

  const rows = books.map((b) => {
    const genres: string[] = (() => { try { return JSON.parse(b.genres); } catch { return []; } })();
    const quotes = b.quotes.map((q) => q.text).join(" | ");
    return [
      esc(b.title),
      esc(b.author),
      esc(b.status),
      b.rating ?? "",
      b.isFavorite ? "Yes" : "No",
      esc(genres.join("; ")),
      b.pageCount ?? "",
      b.publishYear ?? "",
      b.currentPage ?? "",
      b.startedAt  ? new Date(b.startedAt).toISOString().slice(0, 10)  : "",
      b.finishedAt ? new Date(b.finishedAt).toISOString().slice(0, 10) : "",
      new Date(b.addedAt).toISOString().slice(0, 10),
      esc(b.notes),
      esc(quotes),
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reading-nook-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
