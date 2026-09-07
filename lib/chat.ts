import { apiFetch } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ChatSummary {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

export type CatalogItemType = "ALBUM" | "TRACK" | "ARTIST";

// A recommended catalog item attached to an exchange — lean on purpose (the
// agent only ever points at something that already exists; the page it
// links to is responsible for the rest of that item's detail).
export interface Winner {
  type: CatalogItemType;
  id: string;
  name: string;
  primaryArtist: string | null;
}

export interface ChatExchange {
  id: string;
  chatId: string;
  userMessage: string;
  finalResponse: string;
  winners: Winner[] | null;
  createdAt: string;
}

export function fetchChats(): Promise<ChatSummary[]> {
  return apiFetch<ChatSummary[]>("/chats");
}

export function fetchChatExchanges(chatId: string): Promise<ChatExchange[]> {
  return apiFetch<ChatExchange[]>(`/chats/${chatId}/exchanges`);
}

export type AgentResultType = "DIRECT_RESPONSE" | "CATALOG_RESPONSE";

export interface AnswerMetadata {
  chatId: string;
  resultType: AgentResultType;
  recommendedItems: Winner[];
  suggestedChatTitle: string | null;
}

export interface AgentStreamHandlers {
  // Fires once per tool call, both when it starts and when it finishes —
  // "started" is what drives a live "Buscando en las editoriales…"-style
  // indicator; "finished" carries success but the UI doesn't currently need
  // to react to it beyond letting the next "started" (or onDone) replace it.
  onToolCall?: (
    label: string,
    phase: "started" | "finished",
    success?: boolean,
  ) => void;
  // Despite the SSE event's name (answer_delta, matching the backend's own
  // naming), this fires once with the complete answer text, not token by
  // token — see AgentOrchestrator.finalizeExchange on the Java side.
  onAnswer?: (text: string) => void;
  onMetadata?: (metadata: AnswerMetadata) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
}

// Server-Sent Events over a POST body with a Bearer header attached — the
// native EventSource API can't do either (GET-only, no custom headers), so
// this hand-parses the same `event: <name>\ndata: <json>\n\n` framing
// Spring's SseEmitter.event() sends, straight off a streamed fetch() body.
// Returns an abort function — call it to cancel mid-stream (e.g. the user
// navigates away or starts a different chat before this one finishes).
export function streamAgentMessage(
  {
    chatId,
    userMessage,
    timezone,
  }: { chatId?: string; userMessage: string; timezone?: string },
  handlers: AgentStreamHandlers,
): () => void {
  const controller = new AbortController();

  (async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const path = chatId ? `/chats/${chatId}/messages` : "/chats";
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {}),
      },
      body: JSON.stringify({ userMessage, timezone }),
    });

    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => "");
      handlers.onError?.(body || "Couldn't reach the agent.");
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    // The SseEmitter this is reading from has its own 1-minute server-side
    // timeout, plus the connection can just drop — either way the socket
    // can close without ever sending answer_done/error. Track whether one
    // of those actually arrived so the caller isn't left with a spinner
    // that never resolves.
    let settled = false;
    const trackedHandlers: AgentStreamHandlers = {
      ...handlers,
      onDone: () => {
        settled = true;
        handlers.onDone?.();
      },
      onError: (message) => {
        settled = true;
        handlers.onError?.(message);
      },
    };

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Frames are separated by a blank line — split off every complete one
      // in this chunk; a frame split across two chunks just waits in the
      // buffer for the rest to arrive.
      let boundary: number;
      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        dispatchFrame(frame, trackedHandlers);
      }
    }

    if (!settled && !controller.signal.aborted) {
      handlers.onError?.("Lost connection to the agent — try again.");
    }
  })().catch((err) => {
    if (controller.signal.aborted) return; // A deliberate cancel, not a failure.
    handlers.onError?.(
      err instanceof Error ? err.message : "Couldn't reach the agent.",
    );
  });

  return () => controller.abort();
}

function dispatchFrame(frame: string, handlers: AgentStreamHandlers) {
  let eventName = "message";
  const dataLines: string[] = [];
  for (const line of frame.split("\n")) {
    if (line.startsWith("event:")) eventName = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  if (dataLines.length === 0) return;
  const data = JSON.parse(dataLines.join("\n"));

  switch (eventName) {
    case "tool_call_started":
      handlers.onToolCall?.(data.label, "started");
      break;
    case "tool_call_finished":
      handlers.onToolCall?.(data.label, "finished", data.success);
      break;
    case "answer_delta":
      handlers.onAnswer?.(data.text);
      break;
    case "answer_metadata":
      handlers.onMetadata?.(data as AnswerMetadata);
      break;
    case "answer_done":
      handlers.onDone?.();
      break;
    case "error":
      handlers.onError?.(data.message);
      break;
    // iteration_started carries nothing the UI shows today.
  }
}
