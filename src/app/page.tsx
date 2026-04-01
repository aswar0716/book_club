import { db } from "@/lib/db";
import { BookModel } from "@/generated/prisma/models/Book";
import BookCard from "@/components/BookCard";
import Link from "next/link";

export default async function ShelfPage() {
  const books = await db.book.findMany({ orderBy: { addedAt: "desc" } });

  const reading  = books.filter((b: BookModel) => b.status === "reading");
  const wantTo   = books.filter((b: BookModel) => b.status === "want_to_read");
  const finished = books.filter((b: BookModel) => b.status === "finished");

  return (
    <div className="p-8 max-w-6xl mx-auto fade-in">
      {/* Header */}
      <div className="mb-10">
        <h2
          className="text-4xl mb-2"
          style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}
        >
          My Shelf
        </h2>
        <p style={{ color: "var(--text-muted)" }}>
          {books.length === 0
            ? "Your shelf is empty — find your first book to get started."
            : `${books.length} book${books.length !== 1 ? "s" : ""} in your collection`}
        </p>
      </div>

      {books.length === 0 && (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
        >
          <div className="text-5xl mb-4">📖</div>
          <h3
            className="text-2xl mb-3"
            style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}
          >
            Pull up a chair
          </h3>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            Your reading nook is ready. Add your first book and settle in.
          </p>
          <Link
            href="/search"
            className="inline-block px-6 py-3 rounded-lg text-sm font-semibold transition-all"
            style={{ background: "var(--amber)", color: "var(--bg-deep)" }}
          >
            Find a book
          </Link>
        </div>
      )}

      {reading.length > 0 && (
        <Section title="Currently Reading" icon="☕">
          <Grid books={reading} />
        </Section>
      )}

      {wantTo.length > 0 && (
        <Section title="Want to Read" icon="📌">
          <Grid books={wantTo} />
        </Section>
      )}

      {finished.length > 0 && (
        <Section title="Finished" icon="✓">
          <Grid books={finished} />
        </Section>
      )}
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <h3
        className="text-xl mb-5 flex items-center gap-2"
        style={{ fontFamily: "var(--font-serif)", color: "var(--amber-light)" }}
      >
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

function Grid({ books }: { books: BookModel[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {books.map((book: BookModel) => (
        <BookCard
          key={book.id}
          id={book.id}
          title={book.title}
          author={book.author}
          coverUrl={book.coverUrl}
          rating={book.rating}
          status={book.status}
          isFavorite={book.isFavorite}
          genres={JSON.parse(book.genres)}
        />
      ))}
    </div>
  );
}
