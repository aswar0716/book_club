import { db } from "@/lib/db";
import GenreFilter from "@/components/GenreFilter";
import RandomPick from "@/components/RandomPick";
import { BookModel } from "@/generated/prisma/models/Book";
import Link from "next/link";

export default async function WantToReadPage() {
  const books = await db.book.findMany({
    where: { status: "want_to_read" },
    orderBy: { addedAt: "desc" },
  });

  const allGenres = Array.from(
    new Set(books.flatMap((b: BookModel) => {
      try { return JSON.parse(b.genres) as string[]; } catch { return []; }
    }))
  ).sort() as string[];

  return (
    <div className="p-8 max-w-6xl mx-auto fade-in">
      <h2 className="text-4xl mb-2" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>
        Want to Read
      </h2>
      <p className="mb-8" style={{ color: "var(--text-muted)" }}>
        {books.length === 0
          ? "Your reading list is empty."
          : `${books.length} book${books.length !== 1 ? "s" : ""} waiting for you`}
      </p>

      {books.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
          <div className="text-4xl mb-4">📌</div>
          <p className="mb-5" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif)" }}>
            Nothing pinned yet. Find something that catches your eye.
          </p>
          <Link href="/search" className="inline-block px-6 py-3 rounded-lg text-sm font-semibold" style={{ background: "var(--amber)", color: "var(--bg-deep)" }}>
            Find a book
          </Link>
        </div>
      ) : (
        <>
          <RandomPick books={books as BookModel[]} />
          <GenreFilter books={books} allGenres={allGenres} />
        </>
      )}
    </div>
  );
}
