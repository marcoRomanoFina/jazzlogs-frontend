"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface SidebarConversation {
  id: string;
  title: string;
}

export interface SidebarConversationsData {
  items: SidebarConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

export interface PageTint {
  background: string;
  accent: string;
}

// Shared between Sidebar (owns the collapse/expand toggle, and renders
// whatever's registered here), AppContent (needs the current width to keep
// the page's own content clear of it, and whether to apply its own
// max-width/centered wrapper), Navbar (reads the tint below), and individual
// pages (via useFullBleedContent / useSidebarConversations / usePageTint, to
// opt into any of these) — all live in/near the shared layout, so this
// avoids prop-drilling in any direction.
const SidebarContext = createContext<{
  expanded: boolean;
  toggle: () => void;
  fullBleed: boolean;
  setFullBleed: (value: boolean) => void;
  conversations: SidebarConversationsData | null;
  setConversations: (value: SidebarConversationsData | null) => void;
  pageTint: PageTint | null;
  setPageTint: (value: PageTint | null) => void;
} | null>(null);

// Flush to the screen edge in both states, just wider when expanded — a
// little extra clearance beyond the rail's own width so content doesn't
// sit flush against its (rounded, when expanded) edge.
export const SIDEBAR_COLLAPSED_WIDTH = 72;
export const SIDEBAR_EXPANDED_RAIL_WIDTH = 220;
const EXPANDED_GAP_TO_CONTENT = 16;
export const SIDEBAR_EXPANDED_WIDTH =
  SIDEBAR_EXPANDED_RAIL_WIDTH + EXPANDED_GAP_TO_CONTENT;

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const [fullBleed, setFullBleed] = useState(false);
  const [conversations, setConversations] =
    useState<SidebarConversationsData | null>(null);
  const [pageTint, setPageTint] = useState<PageTint | null>(null);
  return (
    <SidebarContext.Provider
      value={{
        expanded,
        toggle: () => setExpanded((v) => !v),
        fullBleed,
        setFullBleed,
        conversations,
        setConversations,
        pageTint,
        setPageTint,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return ctx;
}

// A page that owns its own full-height layout (a chat UI, a player — content
// that manages its own internal scroll regions rather than being one more
// section of a normal scrolling page) calls this once to tell AppContent to
// skip its centered max-width wrapper and give the page the full remaining
// h-screen area instead. Reverts automatically on unmount (navigating to
// another page), so it never leaks into pages that didn't ask for it.
export function useFullBleedContent() {
  const { setFullBleed } = useSidebar();
  useEffect(() => {
    setFullBleed(true);
    return () => setFullBleed(false);
  }, [setFullBleed]);
}

// Same register-on-mount/clear-on-unmount shape as useFullBleedContent, for
// a page (the agent chat) that wants its own list of conversations to
// render inside the permanent Sidebar instead of building a second sidebar
// of its own next to the main content. Pass stable references (useMemo the
// items array, useCallback the handlers) — a new object identity every
// render would re-register on every render instead of only when the data
// actually changes.
export function useSidebarConversations(data: SidebarConversationsData) {
  const { setConversations } = useSidebar();
  useEffect(() => {
    setConversations(data);
    return () => setConversations(null);
  }, [setConversations, data]);
}

// Same register-on-mount/clear-on-unmount shape again, for a page that wants
// to nudge the whole shell's palette (Sidebar + Navbar, not just its own
// content) toward some color it computed itself — e.g. the album editorial
// page's cover-derived tint. Reverts automatically on unmount, so it never
// leaks into the next page navigated to. Pass a stable reference (useMemo
// the {background, accent} object) — a new object every render would
// re-register (and re-render every pageTint consumer) on every render
// instead of only when the colors actually change.
export function usePageTint(tint: PageTint | null) {
  const { setPageTint } = useSidebar();
  useEffect(() => {
    setPageTint(tint);
    return () => setPageTint(null);
  }, [setPageTint, tint]);
}
