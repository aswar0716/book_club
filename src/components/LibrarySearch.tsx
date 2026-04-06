"use client";

import { useState, useMemo } from "react";
import BookCard from "./BookCard";
import { BookModel } from "@/generated/prisma/models/Book";

const STATUS_FILTERS = [
  { value: "",             label: "All"         },
  { value: "reading",      label: "Reading"     },
  { value: "want_to_read", label: "Want to Read"},
  { value: "finished",     label: "Finished"    },
];

const SORT_OPTIONS = [
  { value: "added_desc",   label: "Recently Added"   },
  { value: "added_asc",    label: "Oldest First"     },
  { value: "title_asc",    label: "Title A–Z"        },
  { value: "rating_desc",  label: "Highest Rated"    },
  { value: "author_asc",   label: "Author A–Z"       },
];

export default function LibrarySearch({ books }: { books: BookModel[] }) {
  const [query,  setQuery]  = useState("");
  const [status, setStatus] = useState("");
  const [sort,   setSort]   = useState("added_desc");

  const results = useMemo(() => {
    let list = [...books];

    // Text filter
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.notes ?? "").toLowerCase().includes(q)
      );
    }

    // Status filter
    if (status) list = list.filter((b) => b.status === status);

    // Sort
    switch (sort) {
      case "added_asc":   list.sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()); break;
      case "added_desc":  list.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()); break;
      case "title_asc":   list.sort((a, b) => a.title.localeCompare(b.title)); break;
      case "author_asc":  list.sort((a, b) => a.author.localeCompare(b.author)); break;
      case "rating_desc": list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
    }

    return list;
  }, [books, query, status, sort]);

  return (
    <div className="p-8 max-w-6xl mx-auto fade-in">
      <h2 className="text-4xl mb-2" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>
        Library
      </h2>
      <p className="mb-8" style={{ color: "var(--text-muted)" }}>
        Search and browse everything on your shelf
      </p>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, author, or notes…"
          className="flex-1 min-w-48 px-4 py-2.5 rounded-lg text-sm outline-none"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--cream)" }}
        />
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className="px-3 py-2 rounded-lg text-xs transition-all"
              style={{
                background: status === f.value ? "var(--amber)" : "var(--bg-card)",
                color:      status === f.value ? "var(--bg-deep)" : "var(--cream-muted)",
                border: "1px solid var(--border)",
                fontWeight: status === f.value ? "700" : "400",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs outline-none"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--cream-muted)" }}
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>
        {results.length === 0 ? "No books match" : `${results.length} book${results.length !== 1 ? "s" : ""}`}
        {query && ` for "${query}"`}
      </p>

      {results.length === 0 ? (
        <div className="py-12 text-center" style={{ color: "var(--text-muted)" }}>
          <div className="text-3xl mb-3">🔎</div>
          <p>Nothing found. Try a different search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map((book) => (
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
      )}
    </div>
  );
}
