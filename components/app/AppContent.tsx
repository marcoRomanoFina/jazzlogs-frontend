"use client";

import {
  useSidebar,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_EXPANDED_WIDTH,
} from "@/components/app/SidebarContext";

// Keeps the page content clear of the Sidebar at whatever width it's
// currently at, and exposes that same width as a CSS var — the archive
// page's full-bleed ambient backgrounds need it too (see the comment there),
// and a plain constant won't do now that the width itself changes.
//
// Two modes, chosen by the page itself (see useFullBleedContent):
// - Normal (default): a centered, max-width column — right for anything
//   that reads like a page (editorials, lists, forms).
// - Full-bleed: no wrapper at all, and the whole thing is exactly one
//   viewport tall with its own overflow clipped — for a page that owns a
//   full-height layout with its own internal scroll regions (a chat UI, a
//   player), where a centered column and page-level scroll would fight it.
export default function AppContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { expanded, fullBleed } = useSidebar();
  const width = expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;
  const style = {
    paddingLeft: width,
    "--sidebar-width": `${width}px`,
  } as React.CSSProperties;

  if (fullBleed) {
    return (
      <div
        className="h-screen min-w-0 overflow-hidden transition-[padding-left] duration-300 ease-in-out"
        style={style}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className="min-w-0 transition-[padding-left] duration-300 ease-in-out"
      style={style}
    >
      <div className="mx-auto max-w-[1180px] px-6">{children}</div>
    </div>
  );
}
