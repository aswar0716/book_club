"use client";

import { useState } from "react";
import BookCard from "./BookCard";
import { BookModel } from "@/generated/prisma/models/Book";

interface Props {
  books: BookModel[];
  allGenres: string[];
}

export default function GenreFilter({ books, allGenres }: Props) {
  const [active, setActive] = useState<string | null>(null);

  const filtered = active
    ? books.filter((b) => {
        const genres: string[] = JSON.parse(b.genres);
        return genres.some((g) => g.toLowerCase() === active.toLowerCase());
      })
    : books;

  if (allGenres.length === 0) return <Grid books={filtered} />;

  return (
    <div>
      {/* Genre pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActive(null)}
          className="px-3 py-1 rounded-full text-xs transition-all"
          style={{
            background: active === null ? "var(--amber)" : "var(--bg-elevated)",
            color:      active === null ? "var(--bg-deep)" : "var(--cream-muted)",
            border: "1px solid var(--border)",
            fontWeight: active === null ? "700" : "400",
          }}
        >
          All
        </button>
        {allGenres.map((g) => (
          <button
            key={g}
            onClick={() => setActive(active === g ? null : g)}
            className="px-3 py-1 rounded-full text-xs transition-all"
            style={{
              background: active === g ? "var(--amber)" : "var(--bg-elevated)",
              color:      active === g ? "var(--bg-deep)" : "var(--cream-muted)",
              border: "1px solid var(--border)",
              fontWeight: active === g ? "700" : "400",
            }}
          >
            {g}
          </button>
        ))}
      </div>
      <Grid books={filtered} />
    </div>
  );
}

function Grid({ books }: { books: BookModel[] }) {
  if (books.length === 0) {
    return (
      <p className="text-sm py-6" style={{ color: "var(--text-muted)" }}>
        No books in this genre yet.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {books.map((book) => (
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
          currentPage={book.currentPage}
          pageCount={book.pageCount}
        />
      ))}
    </div>
  );
}
