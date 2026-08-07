"use client";

import { useState } from "react";
import Link from "next/link";
import { archivo, dmMono } from "@/lib/fonts";

interface WideOption {
  v: string | boolean;
  l: string;
  d: string;
}

type Question =
  | { key: string; layout: "wide"; title: string; subtitle: string; opts: WideOption[] }
  | { key: string; layout: "compact"; title: string; subtitle: string; opts: string[] };

const QUESTIONS: Question[] = [
  {
    key: "jazzExperienceLevel",
    layout: "wide",
    title: "How well do you know jazz?",
    subtitle: "So the agent pitches things at the right level.",
    opts: [
      { v: "NEW", l: "New to jazz", d: "Start me with the essentials." },
      { v: "INTERMEDIATE", l: "Intermediate", d: "I know the classics — ready for more." },
      { v: "SEASONED", l: "Seasoned listener", d: "Go deep. Rarities welcome." },
    ],
  },
  {
    key: "favoriteArtists",
    layout: "compact",
    title: "Any artists you already love?",
    subtitle: "Pick a few — or none, we'll learn as you listen.",
    opts: ["Miles Davis", "John Coltrane", "Bill Evans", "Art Blakey", "Chet Baker", "Charles Mingus", "Herbie Hancock", "Thelonious Monk"],
  },
  {
    key: "preferredSubgenres",
    layout: "compact",
    title: "Which corners of jazz?",
    subtitle: "The subgenres you gravitate toward.",
    opts: ["Cool Jazz", "Hard Bop", "Vocal Jazz", "Modal", "Bebop", "Spiritual Jazz", "Post-Bop", "Free Jazz"],
  },
  {
    key: "preferredMoods",
    layout: "compact",
    title: "What are you usually in the mood for?",
    subtitle: "Pick the feelings you reach for.",
    opts: ["Intimate", "Warm", "Melancholic", "Energetic", "Cerebral", "Nocturnal", "Uplifting", "Restless"],
  },
  {
    key: "tempoFeel",
    layout: "wide",
    title: "What tempo feels right?",
    subtitle: "Your default groove.",
    opts: [
      { v: "SLOW", l: "Slow & spacious", d: "Ballads, rubato, room to breathe." },
      { v: "MID", l: "Mid-tempo", d: "The everyday swing." },
      { v: "UP", l: "Up-tempo", d: "Burners and fast changes." },
    ],
  },
  {
    key: "likesVocals",
    layout: "wide",
    title: "Vocals, or purely instrumental?",
    subtitle: "",
    opts: [
      { v: "true", l: "I love vocals", d: "Singers welcome in the mix." },
      { v: "false", l: "Instrumental only", d: "Keep it wordless." },
      { v: "BOTH", l: "Both, equally", d: "A healthy mix of each." },
    ],
  },
  {
    key: "discoveryMode",
    layout: "wide",
    title: "How adventurous should we be?",
    subtitle: "How far the agent strays from your taste.",
    opts: [
      { v: "STAY_IN_LANE", l: "Play to my taste", d: "Stay close to what I picked." },
      { v: "OPEN_TO_EXPLORE", l: "Open to explore", d: "Nudge me outward, gently." },
      { v: "SURPRISE_ME", l: "Surprise me", d: "Throw me the deep cuts." },
    ],
  },
];

const MULTI_KEYS = new Set(["favoriteArtists", "preferredSubgenres", "preferredMoods"]);

type Step = "profile" | "intro" | number | "plan" | "done";

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("profile");
  const [displayName, setDisplayName] = useState("");
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<"FREE" | "MEMBER">("MEMBER");
  const [prefs, setPrefs] = useState<Record<string, string[]>>({});

  function toggle(key: string, value: string) {
    setPrefs((p) => {
      const multi = MULTI_KEYS.has(key);
      if (!multi) return { ...p, [key]: [value] };
      const arr = p[key] ?? [];
      const has = arr.includes(value);
      return { ...p, [key]: has ? arr.filter((v) => v !== value) : [...arr, value].slice(0, 5) };
    });
  }

  function next() {
    if (step === "profile") setStep("intro");
    else if (step === "intro") setStep(0);
    else if (typeof step === "number") {
      setStep(step + 1 < QUESTIONS.length ? step + 1 : "plan");
    } else if (step === "plan") setStep("done");
  }

  function back() {
    if (step === "intro") setStep("profile");
    else if (typeof step === "number") setStep(step === 0 ? "intro" : step - 1);
    else if (step === "plan") setStep(QUESTIONS.length - 1);
  }

  return (
    <div
      className={`${archivo.variable} ${dmMono.variable} mx-auto flex min-h-screen max-w-[1120px] flex-col bg-[#1c1b18] font-[family-name:var(--font-archivo)] text-[#e9e6df]`}
    >
      <div className="flex justify-between px-6 pt-8 sm:px-14">
        <span className="text-2xl font-extrabold tracking-[-.03em] text-[#d99b10]">jazzlogs.</span>
      </div>
      <div className="mx-6 mt-6 border-y border-[#d99b10] py-3 font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.16em] sm:mx-14">
        The reader&rsquo;s questionnaire
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 py-11 sm:px-14">
        {step === "profile" && (
          <div>
            <div className="grid grid-cols-[auto_1fr] gap-8 border-b-[2.5px] border-[#d99b10] pb-8">
              <div className="text-[80px] leading-[.82] font-extrabold tracking-[-.05em]">01</div>
              <div>
                <div className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.22em] text-[rgba(233,230,223,.55)]">
                  The masthead · Who&rsquo;s listening
                </div>
                <div className="mt-3.5 text-[42px] leading-[.94] font-extrabold tracking-[-.05em] text-[#d99b10] sm:text-[54px]">
                  First, the byline.
                </div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-9 sm:grid-cols-2">
              <div className="max-w-[460px] text-[18px] leading-[1.55] tracking-[-.01em] text-[rgba(233,230,223,.78)]">
                A few details for your profile. Your display name is how you&rsquo;ll show up on
                reviews and playlists.
              </div>
              <div>
                <label className="mb-2 block font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.75)]">
                  Display name
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="milesd"
                  className="w-full rounded-xl border-[1.5px] border-[rgba(233,230,223,.4)] bg-transparent px-4 py-3.5 text-[15px] font-medium text-[#e9e6df] outline-none focus:border-[#d99b10]"
                />
                <label className="mt-4.5 mb-2 block font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.75)]">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Miles D."
                  className="w-full rounded-xl border-[1.5px] border-[rgba(233,230,223,.4)] bg-transparent px-4 py-3.5 text-[15px] font-medium text-[#e9e6df] outline-none focus:border-[#d99b10]"
                />
                <button
                  type="button"
                  disabled={!displayName.trim()}
                  onClick={next}
                  className="mt-7 rounded-full px-7.5 py-4 text-[15px] font-bold"
                  style={{
                    background: displayName.trim() ? "#2a2621" : "rgba(233,230,223,.15)",
                    color: displayName.trim() ? "#e9e6df" : "rgba(233,230,223,.4)",
                  }}
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "intro" && (
          <div>
            <div className="grid grid-cols-[auto_1fr] gap-8 border-b-[2.5px] border-[#d99b10] pb-8">
              <div className="text-[80px] leading-[.82] font-extrabold tracking-[-.05em]">00</div>
              <div className="text-[46px] leading-[.92] font-extrabold tracking-[-.05em] text-[#d99b10] sm:text-[58px]">
                You&rsquo;re in.
                <br />
                Now, your ear.
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-9 sm:grid-cols-2">
              <div className="max-w-[460px] text-[18px] leading-[1.55] tracking-[-.01em] text-[rgba(233,230,223,.78)]">
                jazzlogs is a daily record, one album at a time — and a jazz agent that reads
                every editorial we publish. We&rsquo;ll ask a few short questions about how you
                listen. Two minutes, tops.
              </div>
              <div className="border-t border-[#d99b10] pt-5">
                <div className="mb-4 font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.55)]">
                  What we&rsquo;ll cover
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Experience", "Artists", "Subgenres", "Moods", "Tempo", "Vocals", "Discovery"].map((c) => (
                    <span key={c} className="rounded-full border-[1.5px] border-[#d99b10] px-3.5 py-2 text-[13px] font-semibold">
                      {c}
                    </span>
                  ))}
                </div>
                <div className="mt-7 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={next}
                    className="rounded-full bg-[#2a2621] px-7.5 py-4 text-[15px] font-bold text-[#e9e6df]"
                  >
                    Start the questionnaire →
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("plan")}
                    className="text-[14px] font-semibold text-[rgba(233,230,223,.6)]"
                  >
                    Skip, take me in
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {typeof step === "number" && (
          <div>
            {(() => {
              const q = QUESTIONS[step];
              const selected = prefs[q.key] ?? [];
              const isMulti = MULTI_KEYS.has(q.key);
              const canContinue = isMulti || selected.length > 0;
              return (
                <>
                  <div className="grid grid-cols-[auto_1fr] gap-8 border-b-[2.5px] border-[#d99b10] pb-7">
                    <div className="text-[80px] leading-[.82] font-extrabold tracking-[-.05em]">
                      {String(step + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <div className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.22em] text-[rgba(233,230,223,.55)]">
                        Chapter {step + 1} of {QUESTIONS.length} · {isMulti ? "Select up to 5" : "Select one"}
                      </div>
                      <div className="mt-3.5 text-[38px] leading-[1] font-semibold tracking-[-.035em] sm:text-[46px]">
                        {q.title}
                      </div>
                      {q.subtitle && (
                        <div className="mt-3 max-w-[560px] text-[16px] leading-[1.5] tracking-[-.01em] text-[rgba(233,230,223,.7)]">
                          {q.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  {q.layout === "wide" ? (
                    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {q.opts.map((opt) => {
                        const sel = selected.includes(String(opt.v));
                        return (
                          <button
                            key={opt.l}
                            type="button"
                            onClick={() => toggle(q.key, String(opt.v))}
                            className="flex min-h-[140px] flex-col justify-between gap-3.5 rounded-[14px] border-[1.5px] border-[#d99b10] p-5.5 text-left"
                            style={{ background: sel ? "#2a2621" : "transparent" }}
                          >
                            <span
                              className="flex h-[15px] w-[15px] items-center justify-center self-end border-[1.5px] text-[10px] font-bold text-[#1c1b18]"
                              style={{
                                borderColor: sel ? "#d99b10" : "rgba(233,230,223,.4)",
                                background: sel ? "#d99b10" : "transparent",
                              }}
                            >
                              {sel ? "✓" : ""}
                            </span>
                            <div>
                              <div className="text-[22px] font-bold leading-[1.08] tracking-[-.02em]">
                                {opt.l}
                              </div>
                              <div className="mt-1.5 text-[13.5px] text-[rgba(233,230,223,.7)]">
                                {opt.d}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {q.opts.map((opt) => {
                        const sel = selected.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggle(q.key, opt)}
                            className="flex min-h-[92px] flex-col justify-between gap-3.5 rounded-xl border-[1.5px] border-[#d99b10] p-4 text-left"
                            style={{ background: sel ? "#2a2621" : "transparent" }}
                          >
                            <span
                              className="flex h-[15px] w-[15px] items-center justify-center self-end border-[1.5px] text-[10px] font-bold text-[#1c1b18]"
                              style={{
                                borderColor: sel ? "#d99b10" : "rgba(233,230,223,.4)",
                                background: sel ? "#d99b10" : "transparent",
                              }}
                            >
                              {sel ? "✓" : ""}
                            </span>
                            <span className="text-[15px] font-semibold leading-[1.15]">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {isMulti && (
                    <div className="mt-3.5 flex justify-end font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.14em] text-[rgba(233,230,223,.55)]">
                      {selected.length} / 5 selected
                    </div>
                  )}

                  {/* progress + nav */}
                  <div className="mt-9 border-t border-[#d99b10] pt-5">
                    <div className="flex gap-1.5">
                      {QUESTIONS.map((_, i) => (
                        <div
                          key={i}
                          className="h-1 flex-1"
                          style={{ background: i <= step ? "#d99b10" : "rgba(233,230,223,.22)" }}
                        />
                      ))}
                    </div>
                    <div className="mt-5 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={back}
                        className="rounded-full border-[1.5px] border-[#d99b10] px-6 py-3.5 text-[15px] font-bold"
                      >
                        ← Back
                      </button>
                      <div className="flex items-center gap-5.5">
                        <button
                          type="button"
                          onClick={() => setStep("plan")}
                          className="text-[13px] font-semibold text-[rgba(233,230,223,.55)]"
                        >
                          Skip for now
                        </button>
                        <button
                          type="button"
                          disabled={!canContinue}
                          onClick={next}
                          className="rounded-full px-7.5 py-3.5 text-[15px] font-bold"
                          style={{
                            background: canContinue ? "#2a2621" : "rgba(233,230,223,.15)",
                            color: canContinue ? "#e9e6df" : "rgba(233,230,223,.4)",
                          }}
                        >
                          {step === QUESTIONS.length - 1 ? "Finish →" : "Continue →"}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {step === "plan" && (
          <div>
            <div className="grid grid-cols-[auto_1fr] gap-8 border-b-[2.5px] border-[#d99b10] pb-8">
              <div className="text-[80px] leading-[.82] font-extrabold tracking-[-.05em]">★</div>
              <div>
                <div className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[.22em] text-[rgba(233,230,223,.55)]">
                  The last page · Your subscription
                </div>
                <div className="mt-3.5 text-[42px] leading-[.94] font-extrabold tracking-[-.05em] text-[#d99b10] sm:text-[54px]">
                  Choose your plan.
                </div>
              </div>
            </div>
            <div className="mt-7 max-w-[520px] text-[18px] leading-[1.55] tracking-[-.01em] text-[rgba(233,230,223,.78)]">
              Every plan reads the whole archive. Member unlocks the daily log across devices and
              the full jazz agent.
            </div>
            <div className="mt-7 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {(["FREE", "MEMBER"] as const).map((p) => {
                const active = plan === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlan(p)}
                    className="flex flex-col rounded-[14px] border-[1.5px] p-6 text-left"
                    style={{
                      borderColor: active ? "#d99b10" : "rgba(233,230,223,.4)",
                      background: active ? "rgba(217,155,16,.12)" : "transparent",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[20px] font-extrabold tracking-[-.02em]"
                        style={{ color: active ? "#d99b10" : "#e9e6df" }}
                      >
                        {p === "FREE" ? "Free" : "Member"}
                      </span>
                      <span
                        className="h-[15px] w-[15px] rounded-full"
                        style={{
                          background: active ? "#d99b10" : "transparent",
                          border: `1.5px solid ${active ? "#d99b10" : "rgba(233,230,223,.5)"}`,
                          boxShadow: active ? "inset 0 0 0 3px #1c1b18" : "none",
                        }}
                      />
                    </div>
                    <span className="mt-4 text-[30px] font-extrabold tracking-[-.03em]">
                      {p === "FREE" ? "$0" : "$6/mo"}
                    </span>
                    <span className="mt-2.5 text-[14px] leading-[1.45] text-[rgba(233,230,223,.66)]">
                      {p === "FREE"
                        ? "The full editorial archive, always free to read."
                        : "Everything, plus the synced daily log and the full jazz agent."}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-7 flex items-center gap-4 border-t-[2.5px] border-[#d99b10] pt-6">
              <button
                type="button"
                onClick={next}
                className="rounded-full bg-[#2a2621] px-8 py-4 text-[15px] font-bold text-[#e9e6df]"
              >
                Finish →
              </button>
              <button
                type="button"
                onClick={back}
                className="rounded-full border-[1.5px] border-[#d99b10] px-6 py-3.5 text-[15px] font-bold"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div>
            <div className="border-b-[2.5px] border-[#d99b10] pb-7">
              <div className="text-[48px] leading-[.9] font-extrabold tracking-[-.05em] text-[#d99b10] sm:text-[66px]">
                Your ear, on file.
              </div>
              <div className="mt-5 max-w-[600px] text-[19px] leading-[1.5] tracking-[-.01em] text-[rgba(233,230,223,.72)]">
                Here&rsquo;s how we read your taste. Nothing&rsquo;s locked — you can rewrite it
                whenever the mood turns.
              </div>
            </div>
            <div className="mt-7 grid grid-cols-1 gap-x-16 sm:grid-cols-2">
              {[
                ["Display name", displayName || "Not set"],
                ["Name", name || "Not set"],
                ["Plan", plan === "MEMBER" ? "Member · $6/mo" : "Free · $0"],
                ...QUESTIONS.map((q) => [
                  q.title,
                  (prefs[q.key] ?? []).join(", ") || "Not set",
                ]),
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline gap-5 border-t border-[#d99b10] py-4"
                >
                  <span className="w-[118px] flex-none font-[family-name:var(--font-dm-mono)] text-[10.5px] font-medium uppercase tracking-[.1em] text-[rgba(233,230,223,.55)]">
                    {label}
                  </span>
                  <span className="text-[17px] font-semibold tracking-[-.015em]">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-7 flex items-center gap-5.5 border-t-[2.5px] border-[#d99b10] pt-6">
              <Link
                href="/home"
                className="rounded-full bg-[#2a2621] px-8 py-4 text-[15px] font-bold text-[#e9e6df] no-underline"
              >
                Enter jazzlogs →
              </Link>
              <button
                type="button"
                onClick={() => setStep("profile")}
                className="rounded-full border-[1.5px] border-[#d99b10] px-6.5 py-3.5 text-[14px] font-bold"
              >
                Review &amp; edit answers
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
