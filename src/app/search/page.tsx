"use client";

import { useState } from "react";
import Image from "next/image";
import { OLBook } from "@/lib/openLibrary";

const statusOptions = [
  { value: "want_to_read", label: "Want to Read" },
  { value: "reading",      label: "Reading Now"  },
  { value: "finished",     label: "Finished"     },
];

export default function SearchPage() {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<OLBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding]   = useState<string | null>(null);
  const [added, setAdded]     = useState<Set<string>>(new Set());

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  }

  async function handleAdd(book: OLBook, status: string) {
    setAdding(book.id);
    await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book, status }),
    });
    setAdded((prev) => new Set(prev).add(book.id));
    setAdding(null);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto fade-in">
      <h2
        className="text-4xl mb-2"
        style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}
      >
        Find a Book
      </h2>
      <p className="mb-8" style={{ color: "var(--text-muted)" }}>
        Search by title, author, or ISBN
      </p>

      <form onSubmit={handleSearch} className="flex gap-3 mb-10">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. The Name of the Wind..."
          className="flex-1 px-4 py-3 rounded-lg text-sm outline-none transition-all"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--cream)",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-lg text-sm font-semibold transition-all"
          style={{ background: "var(--amber)", color: "var(--bg-deep)", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {results.length > 0 && (
        <div className="flex flex-col gap-4">
          {results.map((book) => (
            <BookResult
              key={book.id}
              book={book}
              isAdded={added.has(book.id)}
              isAdding={adding === book.id}
              onAdd={handleAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookResult({
  book,
  isAdded,
  isAdding,
  onAdd,
}: {
  book: OLBook;
  isAdded: boolean;
  isAdding: boolean;
  onAdd: (book: OLBook, status: string) => void;
}) {
  const [status, setStatus] = useState("want_to_read");

  return (
    <div
      className="flex gap-4 p-4 rounded-xl transition-all"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
      }}
    >
      {/* Cover */}
      <div
        className="shrink-0 w-16 h-24 rounded-lg overflow-hidden"
        style={{ background: "var(--bg-elevated)" }}
      >
        {book.coverUrl ? (
          <Image src={book.coverUrl} alt={book.title} width={64} height={96} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-center p-1"
            style={{ color: "var(--cream-muted)", fontFamily: "var(--font-serif)" }}>
            {book.title}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3
          className="text-base font-semibold leading-snug mb-0.5"
          style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}
        >
          {book.title}
        </h3>
        <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>{book.author}</p>
        <div className="flex gap-3 text-xs mb-3" style={{ color: "var(--cream-faint)" }}>
          {book.publishYear && <span>{book.publishYear}</span>}
          {book.pageCount && <span>{book.pageCount} pages</span>}
        </div>
        {book.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {book.genres.slice(0, 4).map((g) => (
              <span
                key={g}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "var(--bg-elevated)", color: "var(--cream-muted)" }}
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Add controls */}
      <div className="shrink-0 flex flex-col gap-2 items-end justify-center">
        {isAdded ? (
          <span className="text-sm font-semibold" style={{ color: "var(--green)" }}>Added ✓</span>
        ) : (
          <>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-xs px-2 py-1.5 rounded-lg outline-none"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--cream-muted)",
              }}
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={() => onAdd(book, status)}
              disabled={isAdding}
              className="text-xs px-4 py-1.5 rounded-lg font-semibold transition-all"
              style={{
                background: isAdding ? "var(--bg-elevated)" : "var(--amber)",
                color: isAdding ? "var(--text-muted)" : "var(--bg-deep)",
              }}
            >
              {isAdding ? "Adding..." : "Add to Shelf"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
