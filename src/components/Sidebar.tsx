"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Counts {
  total: number;
  reading: number;
  wantToRead: number;
  finished: number;
  favourites: number;
}

const navItems = [
  { href: "/",              label: "My Shelf",      icon: "📚", countKey: "total"      },
  { href: "/library",       label: "Library",       icon: "🔎", countKey: null         },
  { href: "/search",        label: "Find Books",    icon: "🔍", countKey: null         },
  { href: "/reading",       label: "Reading Now",   icon: "☕", countKey: "reading"    },
  { href: "/want-to-read",  label: "Want to Read",  icon: "📌", countKey: "wantToRead" },
  { href: "/finished",      label: "Finished",      icon: "✓",  countKey: "finished"   },
  { href: "/favourites",    label: "Favourites",    icon: "♥",  countKey: "favourites" },
  { href: "/quotes",        label: "Quotes",        icon: "❝",  countKey: null         },
  { href: "/timeline",      label: "Timeline",      icon: "◎",  countKey: null         },
  { href: "/stats",         label: "Stats",         icon: "◈",  countKey: null         },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    fetch("/api/counts").then((r) => r.json()).then(setCounts).catch(() => {});
  }, [pathname]); // refresh counts on every navigation

  return (
    <aside
      className="w-56 min-h-screen flex flex-col shrink-0"
      style={{
        background: "var(--bg-card)",
        borderRight: "1px solid var(--border-light)",
      }}
    >
      {/* Logo */}
      <div className="px-6 pt-8 pb-6" style={{ borderBottom: "1px solid var(--border-light)" }}>
        <h1
          className="text-xl leading-tight"
          style={{ fontFamily: "var(--font-serif)", color: "var(--amber-light)" }}
        >
          The Reading<br />Nook
        </h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          your private book club
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const count  = item.countKey && counts ? counts[item.countKey as keyof Counts] : null;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150"
              style={{
                background: active ? "var(--bg-hover)" : "transparent",
                color: active ? "var(--amber-light)" : "var(--text-secondary)",
                borderLeft: active ? "2px solid var(--amber)" : "2px solid transparent",
                fontWeight: active ? "700" : "400",
              }}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {count !== null && count !== undefined && count > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                  style={{
                    background: active ? "var(--amber)" : "var(--bg-elevated)",
                    color:      active ? "var(--bg-deep)" : "var(--cream-faint)",
                    fontSize: "10px",
                  }}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer ember */}
      <div className="px-6 py-5" style={{ borderTop: "1px solid var(--border-light)" }}>
        <div className="flex items-center gap-2">
          <span className="ember text-lg">🕯️</span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            settle in & read
          </span>
        </div>
      </div>
    </aside>
  );
}
