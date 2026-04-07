"use client";

import { useState } from "react";

interface Quote {
  id: string;
  text: string;
  page: number | null;
  createdAt: string;
}

interface Props {
  bookId: string;
  initialQuotes: Quote[];
}

export default function QuotePanel({ bookId, initialQuotes }: Props) {
  const [quotes,  setQuotes]  = useState<Quote[]>(initialQuotes);
  const [text,    setText]    = useState("");
  const [page,    setPage]    = useState("");
  const [saving,  setSaving]  = useState(false);

  async function handleAdd() {
    if (!text.trim() || saving) return;
    setSaving(true);
    const res = await fetch(`/api/books/${bookId}/quotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, page: page ? Number(page) : undefined }),
    });
    const quote = await res.json();
    setQuotes((prev) => [...prev, quote]);
    setText("");
    setPage("");
    setSaving(false);
  }

  async function handleDelete(quoteId: string) {
    await fetch(`/api/books/${bookId}/quotes`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteId }),
    });
    setQuotes((prev) => prev.filter((q) => q.id !== quoteId));
  }

  return (
    <div
      className="rounded-xl p-6 mt-6"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
    >
      <h3
        className="text-lg mb-5 flex items-center gap-2"
        style={{ fontFamily: "var(--font-serif)", color: "var(--amber-light)" }}
      >
        <span>❝</span> Saved Quotes
      </h3>

      {/* Add quote */}
      <div className="flex flex-col gap-2 mb-6 p-4 rounded-lg" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-light)" }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Paste a quote that moved you…"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--cream)", lineHeight: "1.7" }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey) handleAdd();
          }}
        />
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            placeholder="Page (optional)"
            className="w-36 px-3 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--cream-muted)" }}
          />
          <button
            onClick={handleAdd}
            disabled={!text.trim() || saving}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: !text.trim() || saving ? "var(--bg-card)" : "var(--amber)",
              color:      !text.trim() || saving ? "var(--text-muted)" : "var(--bg-deep)",
              border: "1px solid var(--border)",
            }}
          >
            {saving ? "Saving…" : "Save Quote"}
          </button>
          <span className="text-xs" style={{ color: "var(--cream-faint)" }}>or ⌘↵</span>
        </div>
      </div>

      {/* Quotes list */}
      {quotes.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: "var(--cream-faint)" }}>
          No quotes saved yet. The ones that catch your breath belong here.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {quotes.map((q) => (
            <div key={q.id} className="group relative pl-5" style={{ borderLeft: "2px solid var(--amber)" }}>
              <p
                className="text-sm leading-relaxed mb-1"
                style={{ fontFamily: "var(--font-serif)", color: "var(--cream)", fontStyle: "italic" }}
              >
                {q.text}
              </p>
              <div className="flex items-center gap-3">
                {q.page && (
                  <span className="text-xs" style={{ color: "var(--cream-faint)" }}>p.{q.page}</span>
                )}
                <span className="text-xs" style={{ color: "var(--cream-faint)" }}>
                  {new Date(q.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <button
                onClick={() => handleDelete(q.id)}
                className="absolute top-0 right-0 text-xs opacity-0 group-hover:opacity-100 transition-all px-2 py-0.5 rounded"
                style={{ color: "var(--red)", background: "var(--bg-elevated)" }}
              >
                remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
