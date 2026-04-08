"use client";

import Link from "next/link";

interface Quote {
  id: string;
  text: string;
  page: number | null;
  book: {
    id: string;
    title: string;
    author: string;
  };
}

export default function DailyQuote({ quote }: { quote: Quote }) {
  return (
    <Link href={`/books/${quote.book.id}`} className="group block mb-10">
      <div
        className="rounded-xl px-7 py-6 transition-all"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderLeft: "3px solid var(--amber)",
        }}
      >
        <p
          className="text-base leading-relaxed mb-3"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--cream)",
            fontStyle: "italic",
          }}
        >
          ❝ {quote.text}
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          — <span style={{ color: "var(--amber-light)" }}>{quote.book.title}</span>
          {quote.page ? `, p.${quote.page}` : ""}
          {" · "}{quote.book.author}
        </p>
      </div>
    </Link>
  );
}
