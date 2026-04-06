import { db } from "@/lib/db";
import { BookModel } from "@/generated/prisma/models/Book";
import Link from "next/link";

export default async function StatsPage() {
  const books = await db.book.findMany({ orderBy: { addedAt: "desc" } });
  const finished = books.filter((b: BookModel) => b.status === "finished");
  const reading  = books.filter((b: BookModel) => b.status === "reading");

  if (books.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto fade-in">
        <h2 className="text-4xl mb-2" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>Your Stats</h2>
        <p className="mb-10" style={{ color: "var(--text-muted)" }}>Nothing to show yet — start reading.</p>
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
          <div className="text-4xl mb-4">📊</div>
          <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif)" }}>
            Your reading stats will appear once you add some books.
          </p>
          <Link href="/search" className="inline-block mt-5 px-6 py-3 rounded-lg text-sm font-semibold" style={{ background: "var(--amber)", color: "var(--bg-deep)" }}>
            Find a book
          </Link>
        </div>
      </div>
    );
  }

  // Ratings
  const rated   = finished.filter((b: BookModel) => b.rating);
  const avgRating = rated.length
    ? (rated.reduce((s: number, b: BookModel) => s + (b.rating ?? 0), 0) / rated.length).toFixed(1)
    : null;

  // Pages
  const totalPages = books.reduce((s: number, b: BookModel) => s + (b.pageCount ?? 0), 0);
  const pagesRead  = finished.reduce((s: number, b: BookModel) => s + (b.pageCount ?? 0), 0);

  // Books by year (finished)
  const byYear: Record<number, number> = {};
  for (const b of finished) {
    const yr = b.finishedAt ? new Date(b.finishedAt).getFullYear() : new Date(b.addedAt).getFullYear();
    byYear[yr] = (byYear[yr] ?? 0) + 1;
  }
  const years = Object.entries(byYear)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, count]) => ({ year: Number(year), count }));
  const maxYearCount = Math.max(...years.map((y) => y.count), 1);

  // Top genres
  const genreCounts: Record<string, number> = {};
  for (const b of finished) {
    const genres: string[] = (() => { try { return JSON.parse(b.genres); } catch { return []; } })();
    for (const g of genres) genreCounts[g] = (genreCounts[g] ?? 0) + 1;
  }
  const topGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);
  const maxGenreCount = topGenres[0]?.[1] ?? 1;

  // Rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: finished.filter((b: BookModel) => b.rating === r).length,
  }));
  const maxRatingCount = Math.max(...ratingDist.map((r) => r.count), 1);

  return (
    <div className="p-8 max-w-4xl mx-auto fade-in">
      <h2 className="text-4xl mb-2" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>
        Your Stats
      </h2>
      <p className="mb-10" style={{ color: "var(--text-muted)" }}>
        A look at your reading life
      </p>

      {/* Hero numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard value={books.length}    label="on shelf" />
        <StatCard value={finished.length} label="finished"   color="var(--green)" />
        <StatCard value={reading.length}  label="in progress" color="var(--amber)" />
        <StatCard value={avgRating ? `${avgRating}★` : "—"} label="avg rating" color="var(--amber-glow)" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <StatCard value={pagesRead.toLocaleString()} label="pages read" />
        <StatCard value={totalPages.toLocaleString()} label="total pages on shelf" />
      </div>

      {/* Books by year */}
      {years.length > 0 && (
        <Section title="Books Finished by Year">
          <div className="flex flex-col gap-3">
            {years.map(({ year, count }) => (
              <div key={year} className="flex items-center gap-3">
                <span className="w-12 text-sm text-right shrink-0" style={{ color: "var(--text-muted)" }}>{year}</span>
                <div className="flex-1 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)", height: "22px" }}>
                  <div
                    className="h-full rounded-full flex items-center px-3 transition-all duration-500"
                    style={{
                      width: `${Math.max(8, (count / maxYearCount) * 100)}%`,
                      background: "var(--amber)",
                    }}
                  />
                </div>
                <span className="w-6 text-sm shrink-0" style={{ color: "var(--amber-light)" }}>{count}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Rating distribution */}
      {rated.length > 0 && (
        <Section title="Rating Distribution">
          <div className="flex flex-col gap-3">
            {ratingDist.map(({ stars, count }) => (
              <div key={stars} className="flex items-center gap-3">
                <span className="w-16 text-sm shrink-0" style={{ color: "var(--amber-glow)" }}>{"★".repeat(stars)}</span>
                <div className="flex-1 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)", height: "22px" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: count > 0 ? `${Math.max(4, (count / maxRatingCount) * 100)}%` : "0%",
                      background: "var(--amber-light)",
                    }}
                  />
                </div>
                <span className="w-6 text-sm shrink-0" style={{ color: "var(--text-muted)" }}>{count}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Top genres */}
      {topGenres.length > 0 && (
        <Section title="Top Genres">
          <div className="flex flex-col gap-3">
            {topGenres.map(([genre, count]) => (
              <div key={genre} className="flex items-center gap-3">
                <span className="w-40 text-sm truncate shrink-0" style={{ color: "var(--cream-muted)" }}>{genre}</span>
                <div className="flex-1 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)", height: "22px" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(4, (count / maxGenreCount) * 100)}%`,
                      background: "var(--bg-hover)",
                      borderRight: "2px solid var(--amber)",
                    }}
                  />
                </div>
                <span className="w-6 text-sm shrink-0" style={{ color: "var(--text-muted)" }}>{count}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function StatCard({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <div
      className="rounded-xl p-5 text-center"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
    >
      <div
        className="text-3xl font-bold mb-1"
        style={{ fontFamily: "var(--font-serif)", color: color ?? "var(--cream)" }}
      >
        {value}
      </div>
      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-6 mb-6"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
    >
      <h3 className="text-base mb-5" style={{ fontFamily: "var(--font-serif)", color: "var(--amber-light)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}
