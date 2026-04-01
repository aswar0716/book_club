"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/",        label: "My Shelf",    icon: "📚" },
  { href: "/search",  label: "Find Books",  icon: "🔍" },
  { href: "/reading", label: "Reading Now", icon: "☕" },
  { href: "/finished",label: "Finished",    icon: "✓"  },
  { href: "/favourites", label: "Favourites", icon: "♥" },
];

export default function Sidebar() {
  const pathname = usePathname();

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
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
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
              <span className="text-base">{item.icon}</span>
              {item.label}
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
