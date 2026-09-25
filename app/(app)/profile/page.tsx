"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/app/Navbar";
import Footer from "@/components/app/Footer";

const STATS = [
  { value: "312", label: "Albums listened" },
  { value: "1,840", label: "Tracks listened" },
  { value: "47", label: "Reviews written" },
  { value: "128", label: "Notes written" },
  { value: "36", label: "Chapters completed" },
  { value: "4.1", label: "Avg. rating given" },
];

const ACTIVITY = [
  { kind: "Session", title: "Played “Rainy Sunday, slow & warm”", when: "Today" },
  { kind: "Log", title: "Read #214 · A Love Supreme", when: "Today" },
  { kind: "Rated", title: "Rated Speak No Evil · ★★★★☆", when: "Jul 16" },
  { kind: "Review", title: "Reviewed Kind of Blue · ★★★★★", when: "Jul 9" },
  { kind: "Listen later", title: "Added Maiden Voyage to Listen later", when: "Jul 8" },
];

const CATALOG: { label: string; single?: boolean; opts: string[] }[] = [
  { label: "Experience", single: true, opts: ["New to jazz", "Intermediate", "Seasoned listener"] },
  { label: "Artists", opts: ["Bill Evans", "Chet Baker", "Art Blakey", "John Coltrane", "Miles Davis", "Charles Mingus"] },
  { label: "Subgenres", opts: ["Cool Jazz", "Hard Bop", "Vocal Jazz", "Modal", "Bebop", "Post-bop"] },
  { label: "Moods", opts: ["Intimate", "Warm", "Melancholic", "Energetic", "Late-night", "Playful"] },
  { label: "Instruments", opts: ["Trumpet", "Piano", "Tenor sax", "Alto sax", "Double bass", "Drums"] },
  { label: "Tempo", single: true, opts: ["Slow & spacious", "Mid-tempo", "Up-tempo"] },
];

const DEFAULT_PREFS: Record<string, string[]> = {
  Experience: ["Intermediate"],
  Artists: ["Bill Evans", "Chet Baker", "Art Blakey"],
  Subgenres: ["Cool Jazz", "Hard Bop", "Vocal Jazz"],
  Moods: ["Intimate", "Warm", "Melancholic"],
  Instruments: ["Trumpet", "Piano", "Tenor sax"],
  Tempo: ["Slow & spacious"],
};

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  function toggle(label: string, opt: string, single?: boolean) {
    setPrefs((p) => {
      if (single) return { ...p, [label]: [opt] };
      const arr = p[label] ?? [];
      const has = arr.includes(opt);
      return { ...p, [label]: has ? arr.filter((v) => v !== opt) : [...arr, opt].slice(0, 5) };
    });
  }

  return (
    <>
      <Navbar />

      <div className="flex flex-wrap items-start justify-between gap-9 border-t-[2.5px] border-[#F6D013] pt-11">
        <div className="flex min-w-0 items-start gap-7">
          <div className="flex h-[132px] w-[132px] flex-none items-center justify-center rounded-[22px] bg-[#2A261C]">
            <svg width="70" height="70" viewBox="0 0 24 24">
              <circle cx="12" cy="8.2" r="4.2" fill="#F6D013" />
              <path d="M4 20.5c0-4.4 3.9-6.6 8-6.6s8 2.2 8 6.6" fill="#F6D013" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="font-[family-name:var(--font-fraunces)] text-[52px] leading-[.88] font-extrabold tracking-[-.045em] text-[#F6D013] sm:text-[72px]">
              Miles D.
            </div>
            <div className="mt-3.5 flex flex-wrap items-center gap-3.5">
              <span className="text-[15px] font-semibold text-[rgba(232,220,192,.7)]">
                @milesd
              </span>
              <span className="h-1 w-1 rounded-full bg-[rgba(232,220,192,.4)]" />
              <span className="font-[family-name:var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[.12em] text-[rgba(232,220,192,.6)]">
                Member since Jan 2024
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Cool Jazz", "Hard Bop", "Vocal Jazz", "Intimate", "Warm", "Melancholic"].map((t) => (
                <span
                  key={t}
                  className="rounded-full border-[1.5px] border-[#F6D013] px-3 py-1.5 text-[13px] font-semibold"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <Link
          href="#"
          className="whitespace-nowrap rounded-full border-[1.5px] border-[#F6D013] px-5 py-3 text-[13px] font-bold no-underline"
        >
          Settings
        </Link>
      </div>

      <div className="mt-11 grid grid-cols-2 gap-3 sm:grid-cols-6">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl bg-[#2A261C] p-4.5">
            <div className="text-[32px] font-extrabold tracking-[-.03em] text-[#F6D013]">
              {s.value}
            </div>
            <div className="mt-3 font-[family-name:var(--font-dm-sans)] text-[10px] font-medium uppercase tracking-[.12em] text-[rgba(232,220,192,.65)]">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="mt-13 border-t-[2.5px] border-b border-[#F6D013] py-6">
        <div className="font-[family-name:var(--font-fraunces)] text-[40px] leading-[.95] font-extrabold tracking-[-.04em] text-[#F6D013] sm:text-[48px]">
          Recent activity
        </div>
        <p className="mt-4 max-w-[620px] font-[family-name:var(--font-newsreader)] text-[16px] text-[rgba(232,220,192,.72)]">
          A running record of what Miles has logged, rated and reviewed lately.
        </p>
      </div>
      {ACTIVITY.map((a, i) => (
        <div
          key={a.title}
          className={
            "flex items-baseline gap-5 py-4 " +
            (i === ACTIVITY.length - 1 ? "" : "border-b border-[rgba(232,220,192,.2)]")
          }
        >
          <span className="flex-none rounded-md bg-[#2A261C] px-2.5 py-1.5 font-[family-name:var(--font-dm-sans)] text-[9.5px] font-bold uppercase tracking-[.12em] text-[#F6D013]">
            {a.kind}
          </span>
          <span className="flex-1 text-[18px] font-semibold tracking-[-.01em]">{a.title}</span>
          <span className="flex-none font-[family-name:var(--font-dm-sans)] text-[11px] font-medium text-[rgba(232,220,192,.55)]">
            {a.when}
          </span>
        </div>
      ))}

      {/* Preferences */}
      <div className="mt-16 flex flex-wrap items-end justify-between gap-6 border-t-[2.5px] border-b border-[#F6D013] py-6">
        <div>
          <div className="font-[family-name:var(--font-fraunces)] text-[40px] leading-[.95] font-extrabold tracking-[-.04em] text-[#F6D013] sm:text-[48px]">
            Preferences
          </div>
          <p className="mt-4 max-w-[620px] font-[family-name:var(--font-newsreader)] text-[16px] text-[rgba(232,220,192,.72)]">
            {editing
              ? "Tap to add or remove. Multi-select categories cap at five."
              : "Everything the daily log and every narrated session is tuned to."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="rounded-full border-[1.5px] border-[#F6D013] px-5 py-3 text-[13px] font-bold"
          style={editing ? { background: "#1C1A14" } : undefined}
        >
          {editing ? "Done" : "Edit preferences"}
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border-[1.5px] border-[#F6D013]">
        {CATALOG.map((cat, i) => {
          const selected = prefs[cat.label] ?? [];
          const source = editing ? cat.opts : selected;
          return (
            <div
              key={cat.label}
              className={
                "grid grid-cols-1 gap-3 p-6 sm:grid-cols-[200px_1fr] " +
                (i === 0 ? "" : "border-t border-[rgba(232,220,192,.2)]")
              }
            >
              <div>
                <div className="font-[family-name:var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[.12em] text-[rgba(232,220,192,.55)]">
                  {cat.label}
                </div>
                {editing && !cat.single && (
                  <div className="mt-2 font-[family-name:var(--font-dm-sans)] text-[10px] text-[rgba(232,220,192,.4)]">
                    {selected.length} / 5
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {source.map((opt) => {
                  const sel = selected.includes(opt);
                  if (!editing && !sel) return null;
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={!editing}
                      onClick={() => toggle(cat.label, opt, cat.single)}
                      className="rounded-full border-[1.5px] px-3.5 py-2 text-[13px] font-semibold"
                      style={{
                        borderColor: sel ? "#1C1A14" : "rgba(232,220,192,.35)",
                        background: sel ? "#2A261C" : "transparent",
                        color: sel ? "#E8DCC0" : "rgba(232,220,192,.55)",
                        cursor: editing ? "pointer" : "default",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href="/logs"
        className="mt-13 flex flex-wrap items-center justify-between gap-6 rounded-[20px] bg-[#2A261C] px-9 py-8 no-underline"
      >
        <div>
          <div className="font-[family-name:var(--font-fraunces)] text-[28px] font-extrabold tracking-[-.03em]">
            See everything you&rsquo;ve saved
          </div>
          <div className="mt-2.5 max-w-[520px] font-[family-name:var(--font-newsreader)] text-[15px] leading-[1.5] text-[rgba(232,220,192,.72)]">
            Your records, tracks, reviews and playlists — all your kept content lives in your
            Logs.
          </div>
        </div>
        <span className="flex-none rounded-full bg-[#F6D013] px-6 py-3.5 text-[14px] font-bold text-[#1C1A14]">
          Go to your Logs →
        </span>
      </Link>

      <Footer />
    </>
  );
}
