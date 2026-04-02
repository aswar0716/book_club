import { db } from "@/lib/db";
import GenreFilter from "@/components/GenreFilter";
import { BookModel } from "@/generated/prisma/models/Book";
import Link from "next/link";

export default async function FinishedPage() {
  const books = await db.book.findMany({
    where: { status: "finished" },
    orderBy: { finishedAt: "desc" },
  });

  const allGenres = Array.from(
    new Set(books.flatMap((b: BookModel) => {
      try { return JSON.parse(b.genres) as string[]; } catch { return []; }
    }))
  ).sort() as string[];

  return (
    <div className="p-8 max-w-6xl mx-auto fade-in">
      <h2 className="text-4xl mb-2" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>
        Finished
      </h2>
      <p className="mb-10" style={{ color: "var(--text-muted)" }}>
        {books.length === 0 ? "No finished books yet." : `${books.length} book${books.length !== 1 ? "s" : ""} read`}
      </p>

      {books.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
          <div className="text-4xl mb-4">✓</div>
          <p className="mb-5" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif)" }}>
            Your finished shelf is empty — the first book will feel great here.
          </p>
          <Link href="/search" className="inline-block px-6 py-3 rounded-lg text-sm font-semibold" style={{ background: "var(--amber)", color: "var(--bg-deep)" }}>
            Find a book
          </Link>
        </div>
      ) : (
        <GenreFilter books={books as BookModel[]} allGenres={allGenres} />
      )}
    </div>
  );
}
