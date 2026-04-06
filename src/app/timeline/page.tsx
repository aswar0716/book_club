import { db } from "@/lib/db";
import { BookModel } from "@/generated/prisma/models/Book";
import Image from "next/image";
import Link from "next/link";

interface TimelineEvent {
  date: Date;
  type: "finished" | "started" | "added";
  book: BookModel;
}

export default async function TimelinePage() {
  const books = await db.book.findMany({ orderBy: { addedAt: "desc" } });

  // Build flat list of events
  const events: TimelineEvent[] = [];
  for (const book of books as BookModel[]) {
    if (book.finishedAt) events.push({ date: new Date(book.finishedAt), type: "finished", book });
    if (book.startedAt)  events.push({ date: new Date(book.startedAt),  type: "started",  book });
    events.push({ date: new Date(book.addedAt), type: "added", book });
  }
  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Group by month
  const grouped: Record<string, TimelineEvent[]> = {};
  for (const evt of events) {
    const key = evt.date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(evt);
  }
  const months = Object.entries(grouped);

  const eventConfig = {
    finished: { label: "Finished",     color: "var(--green)",  icon: "✓"  },
    started:  { label: "Started",      color: "var(--amber)",  icon: "☕" },
    added:    { label: "Added to shelf", color: "var(--text-muted)", icon: "+" },
  };

  return (
    <div className="p-8 max-w-2xl mx-auto fade-in">
      <h2 className="text-4xl mb-2" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>
        Timeline
      </h2>
      <p className="mb-10" style={{ color: "var(--text-muted)" }}>
        Your reading life, in order
      </p>

      {events.length === 0 && (
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
          <div className="text-4xl mb-4">◎</div>
          <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif)" }}>
            Nothing logged yet. Your timeline starts when you add your first book.
          </p>
          <Link href="/search" className="inline-block mt-5 px-6 py-3 rounded-lg text-sm font-semibold" style={{ background: "var(--amber)", color: "var(--bg-deep)" }}>
            Find a book
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-10">
        {months.map(([month, evts]) => (
          <div key={month}>
            {/* Month heading */}
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--amber)", fontFamily: "var(--font-sans)" }}>
                {month}
              </h3>
              <div className="flex-1 h-px" style={{ background: "var(--border-light)" }} />
            </div>

            {/* Events */}
            <div className="flex flex-col gap-3 pl-2">
              {evts.map((evt, i) => {
                const cfg = eventConfig[evt.type];
                return (
                  <Link key={i} href={`/books/${evt.book.id}`} className="group flex items-center gap-4 py-2 px-3 rounded-xl transition-all"
                    style={{ background: "var(--bg-card)", border: "1px solid transparent" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-light)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
                  >
                    {/* Event dot */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 font-bold"
                      style={{ background: "var(--bg-elevated)", color: cfg.color, border: `1.5px solid ${cfg.color}` }}
                    >
                      {cfg.icon}
                    </div>

                    {/* Cover */}
                    <div className="w-9 h-13 rounded overflow-hidden shrink-0" style={{ background: "var(--bg-elevated)", minHeight: "52px", minWidth: "36px" }}>
                      {evt.book.coverUrl ? (
                        <Image src={evt.book.coverUrl} alt={evt.book.title} width={36} height={52} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>
                        {evt.book.title}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {evt.book.author}
                      </p>
                    </div>

                    {/* Right */}
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
                      <p className="text-xs" style={{ color: "var(--cream-faint)" }}>
                        {evt.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
