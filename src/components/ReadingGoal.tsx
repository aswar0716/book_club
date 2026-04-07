"use client";

import { useState } from "react";

interface Props {
  year: number;
  finished: number;        // books finished this year
  initialTarget: number | null;
}

export default function ReadingGoal({ year, finished, initialTarget }: Props) {
  const [target,  setTarget]  = useState<number | null>(initialTarget);
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(String(initialTarget ?? ""));
  const [saving,  setSaving]  = useState(false);

  const pct = target ? Math.min(100, Math.round((finished / target) * 100)) : 0;
  const remaining = target ? Math.max(0, target - finished) : 0;

  async function save() {
    const n = parseInt(draft);
    if (!n || n < 1) return;
    setSaving(true);
    await fetch("/api/goal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, target: n }),
    });
    setTarget(n);
    setEditing(false);
    setSaving(false);
  }

  return (
    <div
      className="rounded-xl p-6 mb-6"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base" style={{ fontFamily: "var(--font-serif)", color: "var(--amber-light)" }}>
          {year} Reading Goal
        </h3>
        <button
          onClick={() => { setEditing(true); setDraft(String(target ?? "")); }}
          className="text-xs px-3 py-1 rounded-lg transition-all"
          style={{ color: "var(--text-muted)", border: "1px solid var(--border-light)" }}
        >
          {target ? "Edit" : "Set goal"}
        </button>
      </div>

      {editing ? (
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            autoFocus
            placeholder="e.g. 24"
            className="w-24 px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--cream)" }}
          />
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>books in {year}</span>
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg text-xs font-semibold"
            style={{ background: "var(--amber)", color: "var(--bg-deep)" }}>
            {saving ? "…" : "Save"}
          </button>
          <button onClick={() => setEditing(false)} className="text-xs" style={{ color: "var(--text-muted)" }}>
            Cancel
          </button>
        </div>
      ) : target ? (
        <div>
          {/* Progress bar */}
          <div className="w-full rounded-full overflow-hidden mb-3" style={{ height: "10px", background: "var(--bg-elevated)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct >= 100 ? "var(--green)" : "var(--amber)",
              }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: "var(--cream)" }}>
              <strong style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem" }}>{finished}</strong>
              <span style={{ color: "var(--text-muted)" }}> / {target} books</span>
            </span>
            <span style={{ color: pct >= 100 ? "var(--green)" : "var(--text-muted)" }}>
              {pct >= 100 ? "Goal reached 🎉" : `${remaining} to go · ${pct}%`}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm" style={{ color: "var(--cream-faint)" }}>
          Set a goal and track your progress through the year.
        </p>
      )}
    </div>
  );
}
