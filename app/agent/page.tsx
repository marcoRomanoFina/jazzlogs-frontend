"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { archivo, dmMono } from "@/lib/fonts";

interface ChatMessage {
  role: "user" | "agent";
  text: string;
  tool?: string;
  cites?: string[];
}

const GREETING: ChatMessage = {
  role: "agent",
  text: "Evening, Miles. I've read every JazzLogs editorial — ask me for a recommendation, a comparison, or the story behind any record in the catalogue.",
};

const SUGGESTIONS = [
  "Compare Evans & Jarrett",
  "Build me a late-night session",
  "What should I hear next?",
  "Explain modal jazz simply",
];

const REPLIES: ChatMessage[] = [
  {
    role: "agent",
    tool: "searched the catalogue · 4 logs",
    text: "Good question. Based on what you've been playing this week, I'd point you toward the modal side — spacious, unhurried, room to think.",
    cites: ["LOG #203", "LOG #167"],
  },
  {
    role: "agent",
    tool: "compared 2 artists",
    text: "They share a vocabulary but not a temperament: one leans lyrical and restrained, the other restless and searching. Want me to line up a track from each, back to back?",
  },
  {
    role: "agent",
    text: "I can pull that together. Tell me the mood — intimate, cerebral, or something with more fire — and I'll shape the set around it.",
  },
];

export default function AgentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [replyIndex, setReplyIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isEmpty = messages.length <= 1 && !thinking;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, thinking]);

  function send(text?: string) {
    const t = (text ?? draft).trim();
    if (!t) return;
    setMessages((m) => [...m, { role: "user", text: t }]);
    setDraft("");
    setThinking(true);
    setTimeout(() => {
      setMessages((m) => [...m, REPLIES[replyIndex % REPLIES.length]]);
      setReplyIndex((i) => i + 1);
      setThinking(false);
    }, 900);
  }

  return (
    <div
      className={`${archivo.variable} ${dmMono.variable} flex h-screen flex-col bg-[#1c1b18] font-[family-name:var(--font-archivo)] text-[#e9e6df]`}
    >
      {/* Navbar */}
      <div className="flex items-center justify-between border-b-[1.5px] border-[#d99b10] px-6 py-4">
        <div className="flex items-center gap-5">
          <Link href="/home" className="text-[22px] font-extrabold tracking-[-.03em] text-[#d99b10] no-underline">
            jazzlogs.
          </Link>
          <div className="hidden gap-5 text-[13px] font-semibold sm:flex">
            <Link href="/home" className="text-[rgba(233,230,223,.6)] no-underline">
              Home
            </Link>
            <Link href="/series" className="text-[rgba(233,230,223,.6)] no-underline">
              Series
            </Link>
            <Link href="/playlists" className="text-[rgba(233,230,223,.6)] no-underline">
              Playlists
            </Link>
            <span className="border-b-2 border-[#d99b10] pb-[3px]">Agent</span>
          </div>
        </div>
        <Link href="/profile" className="flex items-center gap-2.5 no-underline">
          <span className="hidden text-[13px] font-semibold sm:inline">Miles D.</span>
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-[#1c1b18] text-[11px] font-extrabold tracking-[-.02em] text-[#d99b10]">
            MD
          </span>
        </Link>
      </div>

      {/* Body */}
      <div
        className="flex-1 grid min-h-0 transition-[grid-template-columns] duration-150"
        style={{ gridTemplateColumns: sidebarOpen ? "220px 1fr" : "56px 1fr" }}
      >
        {/* Sidebar */}
        <div className="flex min-h-0 flex-col gap-4 bg-black/5 p-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="self-start px-1 text-[19px] text-[rgba(233,230,223,.6)]"
            title={sidebarOpen ? "Collapse sidebar" : "Open sidebar"}
          >
            ☰
          </button>
          {sidebarOpen ? (
            <button
              type="button"
              onClick={() => setMessages([GREETING])}
              className="flex items-center gap-2 rounded-[10px] border-[1.5px] border-[rgba(233,230,223,.35)] px-3.5 py-3 text-[14px] font-semibold"
            >
              <span className="text-[16px]">+</span> New chat
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMessages([GREETING])}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border-[1.5px] border-[rgba(233,230,223,.35)] text-[18px]"
              title="New chat"
            >
              +
            </button>
          )}
        </div>

        {/* Main */}
        <div className="flex min-h-0 flex-col">
          {isEmpty ? (
            <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
              <div className="text-[56px] leading-[.9] font-extrabold tracking-[-.05em] text-[#d99b10] sm:text-[72px]">
                jazzlogs agent
              </div>
              <div className="mt-5 text-[19px] text-[rgba(233,230,223,.7)]">
                Good evening, Miles — what do you want to hear tonight?
              </div>
              <div className="mt-8 grid w-full max-w-[560px] grid-cols-1 gap-2.5 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-xl border-[1.5px] border-[rgba(233,230,223,.28)] px-4 py-3.5 text-left text-[14px] font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-10">
              <div className="mx-auto flex max-w-[720px] flex-col gap-8">
                {messages.map((m, i) =>
                  m.role === "user" ? (
                    <div
                      key={i}
                      className="max-w-[80%] self-end rounded-[20px] bg-[rgba(233,230,223,.08)] px-4.5 py-3.5 text-[15px] font-medium"
                    >
                      {m.text}
                    </div>
                  ) : (
                    <div key={i} className="flex min-w-0 flex-col">
                      <div className="mb-3 text-[12px] font-bold tracking-[-.01em] text-[#d99b10]">
                        jazzlogs agent
                      </div>
                      {m.tool && (
                        <div className="mb-2.5 font-[family-name:var(--font-dm-mono)] text-[11px] text-[rgba(233,230,223,.5)]">
                          ↳ {m.tool}
                        </div>
                      )}
                      <div className="text-[15.5px] leading-[1.7]">{m.text}</div>
                      {m.cites && (
                        <div className="mt-3.5 flex flex-wrap gap-1.5">
                          {m.cites.map((c) => (
                            <span
                              key={c}
                              className="rounded-[5px] border border-[rgba(233,230,223,.3)] px-2 py-1.5 font-[family-name:var(--font-dm-mono)] text-[10px] text-[rgba(233,230,223,.55)]"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}
                {thinking && (
                  <div className="flex flex-col">
                    <div className="mb-3 text-[12px] font-bold text-[#d99b10]">jazzlogs agent</div>
                    <div className="font-[family-name:var(--font-dm-mono)] text-[16px] tracking-[.14em] text-[rgba(233,230,223,.5)]">
                      · · ·
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-10 pt-3 pb-6">
            <div className="mx-auto max-w-[720px]">
              <div className="flex items-center gap-2.5 rounded-[26px] border-[1.5px] border-[#d99b10] bg-[#d99b10] p-2 pl-5">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Ask about any record, artist or era…"
                  className="flex-1 border-none bg-transparent py-2.5 text-[15px] font-medium text-[#1c1b18] outline-none placeholder:text-[rgba(28,27,24,.5)]"
                />
                <button
                  type="button"
                  onClick={() => send()}
                  disabled={!draft.trim()}
                  className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-[#1c1b18] text-[17px] font-bold text-[#e9e6df] disabled:bg-[rgba(28,27,24,.12)] disabled:text-[#1c1b1866]"
                >
                  ↑
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
