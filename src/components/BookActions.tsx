"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookModel } from "@/generated/prisma/models/Book";
import { ChatMessageModel } from "@/generated/prisma/models/ChatMessage";

interface Props {
  book: BookModel;
  genres: string[];
  chatMessages: ChatMessageModel[];
}

const statusOptions = [
  { value: "want_to_read", label: "Want to Read" },
  { value: "reading",      label: "Reading Now"  },
  { value: "finished",     label: "Finished"     },
];

export default function BookActions({ book, chatMessages }: Props) {
  const router = useRouter();
  const [status,      setStatus]      = useState(book.status);
  const [rating,      setRating]      = useState(book.rating ?? 0);
  const [hover,       setHover]       = useState(0);
  const [isFavorite,  setIsFavorite]  = useState(book.isFavorite);
  const [notes,       setNotes]       = useState(book.notes ?? "");
  const [currentPage, setCurrentPage] = useState(book.currentPage ?? 0);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);

  // Chat
  const [messages,    setMessages]    = useState<{ role: string; content: string }[]>(chatMessages);
  const [input,       setInput]       = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function patch(data: object) {
    await fetch(`/api/books/${book.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async function handleSave() {
    setSaving(true);
    await patch({ status, rating: rating || null, isFavorite, notes, currentPage: currentPage || null });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Remove this book from your shelf?")) return;
    await fetch(`/api/books/${book.id}`, { method: "DELETE" });
    router.push("/");
  }

  async function sendMessage() {
    if (!input.trim() || chatLoading) return;
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setChatLoading(true);

    const res = await fetch(`/api/books/${book.id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, currentPage }),
    });
    const data = await res.json();
    setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    setChatLoading(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left — details */}
      <div className="flex flex-col gap-5">
        {/* Status */}
        <Panel title="Reading Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--cream)" }}
          >
            {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {status === "reading" && (
            <div className="mt-3 flex items-center gap-3">
              <label className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>Current page</label>
              <input
                type="number"
                min={0}
                max={book.pageCount ?? 9999}
                value={currentPage || ""}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                placeholder="0"
                className="w-24 px-3 py-1.5 rounded-lg text-sm outline-none"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--cream)" }}
              />
              {book.pageCount && (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>of {book.pageCount}</span>
              )}
            </div>
          )}
        </Panel>

        {/* Rating */}
        <Panel title="Your Rating">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="text-2xl star"
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star === rating ? 0 : star)}
                style={{ color: star <= (hover || rating) ? "var(--amber-glow)" : "var(--border)" }}
              >
                ★
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {["", "Didn't enjoy it", "It was okay", "Liked it", "Really liked it", "It was amazing"][rating]}
            </p>
          )}
        </Panel>

        {/* Favourite */}
        <Panel title="Favourite">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="flex items-center gap-2 text-sm transition-all px-4 py-2 rounded-lg"
            style={{
              background: isFavorite ? "var(--amber)" : "var(--bg-elevated)",
              color: isFavorite ? "var(--bg-deep)" : "var(--text-secondary)",
              border: "1px solid var(--border)",
              fontWeight: isFavorite ? "700" : "400",
            }}
          >
            <span>{isFavorite ? "♥" : "♡"}</span>
            {isFavorite ? "In your favourites" : "Add to favourites"}
          </button>
        </Panel>

        {/* Notes */}
        <Panel title="Your Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Thoughts, quotes, feelings..."
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--cream)",
              lineHeight: "1.6",
            }}
          />
        </Panel>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ background: "var(--amber)", color: "var(--bg-deep)", opacity: saving ? 0.7 : 1 }}
          >
            {saved ? "Saved ✓" : saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2.5 rounded-lg text-sm transition-all"
            style={{ background: "var(--bg-elevated)", color: "var(--red)", border: "1px solid var(--border)" }}
          >
            Remove
          </button>
        </div>
      </div>

      {/* Right — Book Club Chat */}
      <div
        className="flex flex-col rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          minHeight: "500px",
        }}
      >
        {/* Chat header */}
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-elevated)" }}
        >
          <div className="flex items-center gap-2">
            <span className="ember text-lg">🕯️</span>
            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", color: "var(--amber-light)", fontSize: "1rem" }}>
                Book Club Chat
              </h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {currentPage > 0
                  ? `Discussing up to page ${currentPage} — no spoilers beyond this`
                  : "Ask anything — set your page for spoiler-free chat"}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4" style={{ maxHeight: "380px" }}>
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="text-3xl mb-3">☕</div>
              <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-serif)", fontSize: "0.95rem" }}>
                Pull up a chair.
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--cream-faint)" }}>
                Ask about themes, characters, the writing — anything on your mind.
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[80%] px-4 py-2.5 rounded-xl text-sm leading-relaxed"
                style={{
                  background: msg.role === "user" ? "var(--amber)" : "var(--bg-elevated)",
                  color:      msg.role === "user" ? "var(--bg-deep)" : "var(--cream)",
                  borderBottomRightRadius: msg.role === "user" ? "4px" : "12px",
                  borderBottomLeftRadius:  msg.role === "user" ? "12px" : "4px",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div
                className="px-4 py-2.5 rounded-xl text-sm"
                style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
              >
                <span className="ember">thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div
          className="px-4 py-3 flex gap-2"
          style={{ borderTop: "1px solid var(--border-light)", background: "var(--bg-elevated)" }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="What's on your mind about this book?"
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--cream)",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={chatLoading || !input.trim()}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: chatLoading || !input.trim() ? "var(--bg-card)" : "var(--amber)",
              color:      chatLoading || !input.trim() ? "var(--text-muted)" : "var(--bg-deep)",
              border: "1px solid var(--border)",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
    >
      <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
        {title}
      </h4>
      {children}
    </div>
  );
}
