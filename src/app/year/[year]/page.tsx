import { db } from "@/lib/db";
import { BookModel } from "@/generated/prisma/models/Book";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function YearReviewPage({ params }: { params: Promise<{ year: string }> }) {
  const { year: yearStr } = await params;
  const year = Number(yearStr);
  if (isNaN(year)) notFound();

  const allBooks = await db.book.findMany({ orderBy: { finishedAt: "desc" } });

  const finished = (allBooks as BookModel[]).filter((b) => {
    if (b.status !== "finished") return false;
    const yr = b.finishedAt ? new Date(b.finishedAt).getFullYear() : new Date(b.addedAt).getFullYear();
    return yr === year;
  });

  const started = (allBooks as BookModel[]).filter((b) => {
    if (!b.startedAt) return false;
    return new Date(b.startedAt).getFullYear() === year;
  });

  const rated       = finished.filter((b) => b.rating);
  const avgRating   = rated.length ? (rated.reduce((s, b) => s + (b.rating ?? 0), 0) / rated.length).toFixed(1) : null;
  const bestBook    = rated.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];
  const totalPages  = finished.reduce((s, b) => s + (b.pageCount ?? 0), 0);
  const favourites  = finished.filter((b) => b.isFavorite);

  // Top genre
  const genreCounts: Record<string, number> = {};
  for (const b of finished) {
    const gs: string[] = (() => { try { return JSON.parse(b.genres); } catch { return []; } })();
    for (const g of gs) genreCounts[g] = (genreCounts[g] ?? 0) + 1;
  }
  const topGenre = Object.entries(genreCounts).sort(([, a], [, b]) => b - a)[0]?.[0];

  const currentYear = new Date().getFullYear();

  return (
    <div className="p-8 max-w-3xl mx-auto fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-sm uppercase tracking-widest mb-2" style={{ color: "var(--amber)", fontFamily: "var(--font-sans)" }}>
          Year in Review
        </p>
        <h1 className="text-6xl mb-3" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>
          {year}
        </h1>
        {finished.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No finished books recorded for {year}.</p>
        ) : (
          <p style={{ color: "var(--text-secondary)" }}>
            You read <strong style={{ color: "var(--amber-light)" }}>{finished.length} book{finished.length !== 1 ? "s" : ""}</strong>
            {totalPages > 0 && <> and turned <strong style={{ color: "var(--amber-light)" }}>{totalPages.toLocaleString()}</strong> pages</>}.
          </p>
        )}
      </div>

      {finished.length === 0 && (
        <div className="text-center py-10">
          <Link href="/finished" className="inline-block px-6 py-3 rounded-lg text-sm font-semibold" style={{ background: "var(--amber)", color: "var(--bg-deep)" }}>
            Go to finished books
          </Link>
        </div>
      )}

      {finished.length > 0 && (
        <>
          {/* Headline stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <Stat value={finished.length}  label="books read" color="var(--amber-light)" />
            <Stat value={started.length}   label="started" />
            <Stat value={avgRating ? `${avgRating}★` : "—"} label="avg rating" color="var(--amber-glow)" />
            <Stat value={totalPages > 0 ? totalPages.toLocaleString() : "—"} label="pages" />
          </div>

          {/* Best book */}
          {bestBook && (
            <Section title="Best Book of the Year">
              <Link href={`/books/${bestBook.id}`} className="flex gap-5 items-center group">
                <div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 shadow-lg" style={{ background: "var(--bg-elevated)" }}>
                  {bestBook.coverUrl
                    ? <Image src={bestBook.coverUrl} alt={bestBook.title} width={80} height={112} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full" />
                  }
                </div>
                <div>
                  <p className="text-xl leading-snug mb-1" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>
                    {bestBook.title}
                  </p>
                  <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>{bestBook.author}</p>
                  <p style={{ color: "var(--amber-glow)" }}>{"★".repeat(bestBook.rating ?? 0)}</p>
                </div>
              </Link>
            </Section>
          )}

          {/* Favourites this year */}
          {favourites.length > 0 && (
            <Section title={`Favourites (${favourites.length})`}>
              <div className="flex gap-3 flex-wrap">
                {favourites.map((b) => (
                  <Link key={b.id} href={`/books/${b.id}`} className="group">
                    <div className="w-14 h-20 rounded-lg overflow-hidden shadow" style={{ background: "var(--bg-elevated)" }}>
                      {b.coverUrl
                        ? <Image src={b.coverUrl} alt={b.title} width={56} height={80} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full" />
                      }
                    </div>
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {/* Top genre */}
          {topGenre && (
            <Section title="Most Read Genre">
              <p className="text-2xl" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>
                {topGenre}
                <span className="text-sm ml-3" style={{ color: "var(--text-muted)" }}>
                  {genreCounts[topGenre]} book{genreCounts[topGenre] !== 1 ? "s" : ""}
                </span>
              </p>
            </Section>
          )}

          {/* All books this year */}
          <Section title="Everything You Read">
            <div className="flex flex-col gap-3">
              {finished.map((b, i) => (
                <Link key={b.id} href={`/books/${b.id}`} className="flex items-center gap-4 group">
                  <span className="w-6 text-sm text-right shrink-0" style={{ color: "var(--cream-faint)" }}>{i + 1}</span>
                  <div className="w-9 h-12 rounded overflow-hidden shrink-0" style={{ background: "var(--bg-elevated)" }}>
                    {b.coverUrl && <Image src={b.coverUrl} alt={b.title} width={36} height={48} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>{b.title}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{b.author}</p>
                  </div>
                  {b.rating && <span className="text-xs shrink-0" style={{ color: "var(--amber-glow)" }}>{"★".repeat(b.rating)}</span>}
                </Link>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* Year nav */}
      <div className="flex justify-between mt-10 text-sm">
        <Link href={`/year/${year - 1}`} style={{ color: "var(--text-muted)" }}>← {year - 1}</Link>
        {year < currentYear && <Link href={`/year/${year + 1}`} style={{ color: "var(--text-muted)" }}>{year + 1} →</Link>}
      </div>
    </div>
  );
}

function Stat({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <div className="rounded-xl p-4 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
      <div className="text-2xl font-bold mb-0.5" style={{ fontFamily: "var(--font-serif)", color: color ?? "var(--cream)" }}>{value}</div>
      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-6 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
      <h3 className="text-base mb-5" style={{ fontFamily: "var(--font-serif)", color: "var(--amber-light)" }}>{title}</h3>
      {children}
    </div>
  );
}
