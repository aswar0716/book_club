import { db } from "@/lib/db";
import { BookModel } from "@/generated/prisma/models/Book";
import GenreFilter from "@/components/GenreFilter";
import Link from "next/link";

export default async function ShelfPage() {
  const books = await db.book.findMany({ orderBy: { addedAt: "desc" } });

  const reading  = books.filter((b: BookModel) => b.status === "reading");
  const wantTo   = books.filter((b: BookModel) => b.status === "want_to_read");
  const finished = books.filter((b: BookModel) => b.status === "finished");

  // Collect unique genres across all books
  const allGenres = Array.from(
    new Set(
      books.flatMap((b: BookModel) => {
        try { return JSON.parse(b.genres) as string[]; }
        catch { return []; }
      })
    )
  ).sort() as string[];

  return (
    <div className="p-8 max-w-6xl mx-auto fade-in">
      {/* Header */}
      <div className="mb-10">
        <h2
          className="text-4xl mb-3"
          style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}
        >
          My Shelf
        </h2>

        {books.length > 0 ? (
          <div className="flex gap-6 flex-wrap">
            <Stat value={books.length}    label="total" />
            <Stat value={reading.length}  label="reading"      color="var(--amber)" />
            <Stat value={finished.length} label="finished"     color="var(--green)" />
            <Stat value={wantTo.length}   label="want to read" />
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>Your shelf is empty — find your first book to get started.</p>
        )}
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
          <GenreFilter books={reading} allGenres={[]} />
        </Section>
      )}

      {wantTo.length > 0 && (
        <Section title="Want to Read" icon="📌">
          <GenreFilter books={wantTo} allGenres={[]} />
        </Section>
      )}

      {finished.length > 0 && (
        <Section title="Finished" icon="✓">
          <GenreFilter books={finished} allGenres={allGenres} />
        </Section>
      )}
    </div>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color?: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-serif)", color: color ?? "var(--cream)" }}>
        {value}
      </span>
      <span className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</span>
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
