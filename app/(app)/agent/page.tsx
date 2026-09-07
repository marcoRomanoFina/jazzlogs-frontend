"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import MarkdownMessage from "@/components/app/MarkdownMessage";
import {
  useFullBleedContent,
  useSidebarConversations,
} from "@/components/app/SidebarContext";
import {
  fetchChats,
  fetchChatExchanges,
  streamAgentMessage,
  type ChatSummary,
  type Winner,
} from "@/lib/chat";

interface ChatMessage {
  role: "user" | "agent";
  text: string;
  winners?: Winner[];
}

// Client-only, never persisted — the backend has no notion of a greeting
// exchange, this is just how a brand-new chat opens locally. Once a real
// exchange is added it becomes the first bubble in that chat's history for
// the rest of the session (still never sent to or stored by the backend).
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

// ALBUM/ARTIST ids link straight to their editorial; TRACK winners come
// back without an albumId (see lib/chat.ts's Winner), so there's no route
// to build for those yet — they render as plain (unlinked) chips instead.
function winnerHref(w: Winner): string | null {
  if (w.type === "ALBUM") return `/editorial/album?id=${w.id}`;
  if (w.type === "ARTIST") return `/editorial/artist?id=${w.id}`;
  return null;
}

export default function AgentPage() {
  // This page owns a full-height, ChatGPT-style layout with its own
  // internal scroll region (the message list) — it opts out of AppContent's
  // usual centered-column treatment rather than being squeezed into it.
  useFullBleedContent();

  const [chats, setChats] = useState<ChatSummary[] | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [currentToolLabel, setCurrentToolLabel] = useState<string | null>(
    null,
  );
  const [loadingHistory, setLoadingHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // The in-flight stream's own cancel function (see lib/chat.ts) — needed so
  // switching chats or starting a new one mid-answer doesn't leave a stale
  // response landing in the wrong conversation.
  const abortRef = useRef<(() => void) | null>(null);

  const isEmpty = messages.length <= 1 && !sending && !loadingHistory;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, sending, loadingHistory]);

  useEffect(() => {
    fetchChats()
      .then(setChats)
      .catch(() => setChats([]));
  }, []);

  // Cancel whatever's in flight if the page itself unmounts mid-answer.
  useEffect(() => {
    return () => abortRef.current?.();
  }, []);

  function send(text?: string) {
    const t = (text ?? draft).trim();
    if (!t || sending) return;

    abortRef.current?.();
    setMessages((m) => [...m, { role: "user", text: t }]);
    setDraft("");
    setSending(true);
    setCurrentToolLabel(null);

    let answerText = "";
    let winners: Winner[] = [];
    let resolvedChatId = activeChatId;

    abortRef.current = streamAgentMessage(
      {
        chatId: activeChatId ?? undefined,
        userMessage: t,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      {
        onToolCall: (label, phase) => {
          if (phase === "started") setCurrentToolLabel(label);
        },
        onAnswer: (text) => {
          answerText = text;
        },
        onMetadata: (metadata) => {
          winners = metadata.recommendedItems;
          // The only place a brand-new chat's id ever shows up — see
          // AgentOrchestrator.toMetadataPayload on the Java side.
          if (!resolvedChatId) {
            resolvedChatId = metadata.chatId;
            setActiveChatId(metadata.chatId);
          }
        },
        onDone: () => {
          setMessages((m) => [
            ...m,
            { role: "agent", text: answerText, winners },
          ]);
          setSending(false);
          setCurrentToolLabel(null);
          abortRef.current = null;
          // A new chat now exists, or this one's title/lastMessageAt moved
          // — either way the sidebar's list is stale.
          fetchChats()
            .then(setChats)
            .catch(() => {});
        },
        onError: (message) => {
          setMessages((m) => [...m, { role: "agent", text: message }]);
          setSending(false);
          setCurrentToolLabel(null);
          abortRef.current = null;
        },
      },
    );
  }

  const handleNewChat = useCallback(() => {
    abortRef.current?.();
    abortRef.current = null;
    setActiveChatId(null);
    setMessages([GREETING]);
    setDraft("");
    setSending(false);
    setCurrentToolLabel(null);
    setLoadingHistory(false);
  }, []);

  const handleSelectConversation = useCallback(
    (id: string) => {
      if (id === activeChatId) return;
      abortRef.current?.();
      abortRef.current = null;
      setActiveChatId(id);
      setSending(false);
      setCurrentToolLabel(null);
      setDraft("");
      setLoadingHistory(true);
      fetchChatExchanges(id)
        .then((exchanges) => {
          setMessages(
            exchanges.flatMap((ex) => [
              { role: "user" as const, text: ex.userMessage },
              {
                role: "agent" as const,
                text: ex.finalResponse,
                winners: ex.winners ?? [],
              },
            ]),
          );
        })
        .catch(() =>
          setMessages([
            {
              role: "agent",
              text: "Couldn't load that conversation — try again.",
            },
          ]),
        )
        .finally(() => setLoadingHistory(false));
    },
    [activeChatId],
  );

  // Renders inside the permanent app Sidebar, not a second sidebar of this
  // page's own — see Sidebar.tsx.
  const conversationsData = useMemo(
    () => ({
      items: (chats ?? []).map((c) => ({
        id: c.id,
        title: c.title ?? "New chat",
      })),
      activeId: activeChatId,
      onSelect: handleSelectConversation,
      onNewChat: handleNewChat,
    }),
    [chats, activeChatId, handleSelectConversation, handleNewChat],
  );
  useSidebarConversations(conversationsData);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#1c1b18] text-[#e9e6df]">
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
      ) : loadingHistory ? (
        <div className="flex flex-1 items-center justify-center text-[15px] text-[rgba(233,230,223,.55)]">
          Loading conversation…
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
                  <MarkdownMessage text={m.text} />
                  {m.winners && m.winners.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {m.winners.map((w) => {
                        const href = winnerHref(w);
                        const label = w.primaryArtist
                          ? `${w.name} · ${w.primaryArtist}`
                          : w.name;
                        const chipClass =
                          "rounded-[5px] border border-[rgba(233,230,223,.3)] px-2 py-1.5 font-[family-name:var(--font-dm-mono)] text-[10px] text-[rgba(233,230,223,.55)]";
                        return href ? (
                          <Link
                            key={`${w.type}-${w.id}`}
                            href={href}
                            className={
                              chipClass +
                              " no-underline transition-colors hover:border-[#d99b10] hover:text-[#e9e6df]"
                            }
                          >
                            {label}
                          </Link>
                        ) : (
                          <span key={`${w.type}-${w.id}`} className={chipClass}>
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ),
            )}
            {sending && (
              <div className="flex flex-col">
                <div className="mb-3 text-[12px] font-bold text-[#d99b10]">
                  jazzlogs agent
                </div>
                <div className="font-[family-name:var(--font-dm-mono)] text-[13px] text-[rgba(233,230,223,.5)]">
                  {currentToolLabel ?? "· · ·"}
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
              disabled={sending || loadingHistory}
              className="flex-1 border-none bg-transparent py-2.5 text-[15px] font-medium text-[#1c1b18] outline-none placeholder:text-[rgba(28,27,24,.5)] disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => send()}
              disabled={!draft.trim() || sending || loadingHistory}
              className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-[#1c1b18] text-[17px] font-bold text-[#e9e6df] disabled:bg-[rgba(28,27,24,.12)] disabled:text-[#1c1b1866]"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
