"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookModel } from "@/generated/prisma/models/Book";

export default function RandomPick({ books }: { books: BookModel[] }) {
  const [pick, setPick] = useState<BookModel | null>(null);
  const [spinning, setSpinning] = useState(false);

  function draw() {
    setSpinning(true);
    setPick(null);
    // Brief delay for drama
    setTimeout(() => {
      const choice = books[Math.floor(Math.random() * books.length)];
      setPick(choice);
      setSpinning(false);
    }, 600);
  }

  return (
    <div className="mb-8">
      <button
        onClick={draw}
        disabled={spinning}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
        style={{
          background: spinning ? "var(--bg-elevated)" : "var(--amber)",
          color: spinning ? "var(--text-muted)" : "var(--bg-deep)",
          border: "1px solid var(--border)",
        }}
      >
        <span style={{ display: "inline-block", animation: spinning ? "spin 0.6s linear" : "none" }}>
          🎲
        </span>
        {spinning ? "Picking…" : "What should I read next?"}
      </button>

      {pick && (
        <Link href={`/books/${pick.id}`} className="group block mt-4">
          <div
            className="flex gap-5 items-center p-5 rounded-xl fade-in"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--amber)",
              boxShadow: "0 0 20px rgba(200,129,58,0.12)",
            }}
          >
            <div className="w-14 h-20 rounded-lg overflow-hidden shrink-0 shadow-lg" style={{ background: "var(--bg-elevated)" }}>
              {pick.coverUrl ? (
                <Image src={pick.coverUrl} alt={pick.title} width={56} height={80} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-1 text-center"
                  style={{ fontFamily: "var(--font-serif)", color: "var(--cream-muted)", fontSize: "9px" }}>
                  {pick.title}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--amber)" }}>Tonight&apos;s pick</p>
              <p className="text-lg leading-snug" style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}>
                {pick.title}
              </p>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{pick.author}</p>
            </div>
            <span className="text-xs shrink-0 pr-1" style={{ color: "var(--amber-light)" }}>Open →</span>
          </div>
        </Link>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
