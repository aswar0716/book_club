import { db } from "@/lib/db";
import BookCard from "@/components/BookCard";
import Link from "next/link";

export default async function ReadingPage() {
  const books = await db.book.findMany({
    where: { status: "reading" },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="p-8 max-w-6xl mx-auto fade-in">
      <h2 className="text-4xl mb-2" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>
        Reading Now
      </h2>
      <p className="mb-10" style={{ color: "var(--text-muted)" }}>
        {books.length === 0 ? "Nothing on the go — time to start something new." : `${books.length} book${books.length !== 1 ? "s" : ""} in progress`}
      </p>

      {books.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
          <div className="text-4xl mb-4">☕</div>
          <p className="mb-5" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif)" }}>
            The kettle's on. Pick a book.
          </p>
          <Link href="/search" className="inline-block px-6 py-3 rounded-lg text-sm font-semibold" style={{ background: "var(--amber)", color: "var(--bg-deep)" }}>
            Find a book
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} id={book.id} title={book.title} author={book.author}
              coverUrl={book.coverUrl} rating={book.rating} status={book.status}
              isFavorite={book.isFavorite} genres={JSON.parse(book.genres)} />
          ))}
        </div>
      )}
    </div>
  );
}
