"use client";

import Link from "next/link";
import Image from "next/image";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  coverUrl?: string | null;
  rating?: number | null;
  status: string;
  isFavorite: boolean;
  genres: string[];
}

const statusLabel: Record<string, string> = {
  want_to_read: "Want to Read",
  reading: "Reading",
  finished: "Finished",
};

const statusColor: Record<string, string> = {
  want_to_read: "var(--text-muted)",
  reading: "var(--amber)",
  finished: "var(--green)",
};

export default function BookCard({ id, title, author, coverUrl, rating, status, isFavorite, genres }: BookCardProps) {
  return (
    <Link href={`/books/${id}`} className="group block">
      <div
        className="rounded-xl overflow-hidden transition-all duration-200 group-hover:scale-[1.02]"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
        }}
      >
        {/* Cover */}
        <div className="relative w-full aspect-[2/3] overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 200px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4">
              <span
                className="text-center text-sm leading-snug"
                style={{ fontFamily: "var(--font-serif)", color: "var(--cream-muted)" }}
              >
                {title}
              </span>
            </div>
          )}
          {isFavorite && (
            <div
              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{ background: "var(--bg-deep)", color: "var(--amber-glow)" }}
            >
              ♥
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3
            className="text-sm font-semibold leading-snug line-clamp-2 mb-0.5"
            style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}
          >
            {title}
          </h3>
          <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{author}</p>

          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: statusColor[status] ?? "var(--text-muted)" }}>
              {statusLabel[status] ?? status}
            </span>
            {rating && (
              <span className="text-xs" style={{ color: "var(--amber-glow)" }}>
                {"★".repeat(rating)}{"☆".repeat(5 - rating)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
