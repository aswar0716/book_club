import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";

export default async function QuotesPage() {
  const quotes = await db.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: { book: true },
  });

  return (
    <div className="p-8 max-w-3xl mx-auto fade-in">
      <h2 className="text-4xl mb-2" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>
        Quotes
      </h2>
      <p className="mb-10" style={{ color: "var(--text-muted)" }}>
        {quotes.length === 0
          ? "Nothing saved yet."
          : `${quotes.length} quote${quotes.length !== 1 ? "s" : ""} from your reading`}
      </p>

      {quotes.length === 0 && (
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
          <div className="text-4xl mb-4">❝</div>
          <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif)" }}>
            When a line stops you cold, save it here.
          </p>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
            Open any book and use the Quotes panel to save passages.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {quotes.map((q) => (
          <Link key={q.id} href={`/books/${q.book.id}`} className="group block">
            <div
              className="rounded-xl p-5 transition-all"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-light)",
              }}
            >
              {/* Quote text */}
              <p
                className="text-base leading-relaxed mb-4"
                style={{ fontFamily: "var(--font-serif)", color: "var(--cream)", fontStyle: "italic" }}
              >
                ❝ {q.text}
              </p>

              {/* Book attribution */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-11 rounded overflow-hidden shrink-0" style={{ background: "var(--bg-elevated)" }}>
                  {q.book.coverUrl && (
                    <Image src={q.book.coverUrl} alt={q.book.title} width={32} height={44} className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--amber-light)" }}>{q.book.title}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {q.book.author}{q.page ? ` · p.${q.page}` : ""}
                  </p>
                </div>
                <div className="flex-1" />
                <p className="text-xs" style={{ color: "var(--cream-faint)" }}>
                  {new Date(q.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
