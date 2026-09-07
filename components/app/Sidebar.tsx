"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useSidebar,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_EXPANDED_RAIL_WIDTH,
} from "@/components/app/SidebarContext";

// `match` covers routes that don't share the link's own href — e.g.
// "Editorials" points at /archive, but an editorial's own detail pages live
// under /editorial/*, and should still read as that same section active.
const LINKS = [
  {
    href: "/home",
    label: "Home",
    match: ["/home"],
    icon: (
      <>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
      </>
    ),
  },
  {
    href: "/series",
    label: "Series",
    match: ["/series"],
    icon: (
      <>
        <path d="M12 2 2 7l10 5 10-5-10-5Z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </>
    ),
  },
  {
    href: "/playlists",
    label: "Playlists",
    match: ["/playlists"],
    icon: (
      <>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </>
    ),
  },
  {
    href: "/agent",
    label: "Agent",
    match: ["/agent"],
    icon: (
      <path d="M21 11.5a8.38 8.38 0 0 1-4.7 7.6 8.5 8.5 0 0 1-8.4-.4L3 21l1.9-5.9a8.38 8.38 0 0 1-.9-3.6 8.5 8.5 0 0 1 17-.4 8.5 8.5 0 0 1 0 .4Z" />
    ),
  },
  {
    href: "/archive",
    label: "Editorials",
    match: ["/archive", "/editorial"],
    icon: (
      <>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2Z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z" />
      </>
    ),
  },
] as const;

// Permanent, ChatGPT-sidebar style: a narrow icon rail flush to the screen
// edge by default, that widens in place to show labels + the profile name.
// Stays flush top/bottom/left in both states — only its width and the
// roundness of its trailing edge change, kept to a slow, single easing curve
// so the whole thing reads as one smooth motion rather than several things
// happening at once.
export default function Sidebar() {
  const pathname = usePathname();
  const { expanded, toggle, conversations, pageTint } = useSidebar();
  const width = expanded ? SIDEBAR_EXPANDED_RAIL_WIDTH : SIDEBAR_COLLAPSED_WIDTH;
  // Falls back to the flat amber/charcoal everywhere a page hasn't
  // registered its own cover-derived palette via usePageTint.
  const accent = pageTint?.accent ?? "#d99b10";

  return (
    <aside
      className={
        "fixed top-0 left-0 z-40 flex h-screen flex-col overflow-hidden border-r border-[rgba(217,155,16,.18)] py-6 transition-[width,border-radius] duration-300 ease-in-out " +
        (expanded ? "rounded-r-2xl" : "")
      }
      style={{ width, backgroundColor: pageTint?.background ?? "#1c1b18" }}
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={expanded ? "Collapse menu" : "Expand menu"}
        className="mx-[13px] flex h-11 w-11 flex-none items-center justify-center rounded-full text-[rgba(233,230,223,.75)]"
        style={{ background: "rgba(233,230,223,.1)" }}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="16" rx="2.5" />
          <line x1="9.5" y1="4" x2="9.5" y2="20" />
        </svg>
      </button>

      {/* Right under the toggle now, not vertically centered — a page can
          register a conversations list (see below) that needs the rest of
          the rail's height to actually fit, so the top of the sidebar can't
          spend it on empty centering space. */}
      <nav className="mt-6 flex flex-col gap-1 px-3">
        {LINKS.map((link) => {
          const isActive = link.match.some((prefix) =>
            pathname.startsWith(prefix),
          );
          return (
            <Link
              key={link.href}
              href={link.href}
              title={expanded ? undefined : link.label}
              className={
                "flex items-center gap-3 rounded-lg px-2.5 py-2.5 no-underline transition-colors " +
                (isActive
                  ? "bg-[rgba(217,155,16,.14)] text-[#e9e6df]"
                  : "text-[rgba(233,230,223,.6)] hover:text-[#e9e6df]")
              }
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isActive ? accent : "currentColor"}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-none"
              >
                {link.icon}
              </svg>
              <span className="truncate text-[14px] font-semibold whitespace-nowrap">
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Whatever a page registered via useSidebarConversations (currently
          just the agent chat) — always flex-1 so the profile link below
          still lands at the very bottom whether or not anything registered.
          The scrolling lives on the list itself (min-h-0 + overflow-y-auto),
          not the whole rail, so the toggle/nav/profile stay put. */}
      <div className="mt-6 flex min-h-0 flex-1 flex-col px-3">
        {conversations &&
          (expanded ? (
            <>
              <button
                type="button"
                onClick={conversations.onNewChat}
                className="flex flex-none items-center gap-2 rounded-lg border-[1.5px] border-[rgba(233,230,223,.3)] px-2.5 py-2.5 text-[13px] font-semibold text-[rgba(233,230,223,.85)] transition-colors hover:border-[#d99b10] hover:text-[#e9e6df]"
              >
                <span className="text-[15px] leading-none">+</span> New chat
              </button>
              <div className="mt-3 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
                {conversations.items.map((c) => {
                  const isActive = c.id === conversations.activeId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => conversations.onSelect(c.id)}
                      className={
                        "truncate rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors " +
                        (isActive
                          ? "bg-[rgba(217,155,16,.14)] text-[#e9e6df]"
                          : "text-[rgba(233,230,223,.55)] hover:text-[#e9e6df]")
                      }
                    >
                      {c.title}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={conversations.onNewChat}
              title="New chat"
              className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border-[1.5px] border-[rgba(233,230,223,.3)] text-[16px] leading-none text-[rgba(233,230,223,.85)] transition-colors hover:border-[#d99b10] hover:text-[#e9e6df]"
            >
              +
            </button>
          ))}
      </div>

      <Link
        href="/profile"
        title={expanded ? undefined : "Miles D."}
        className="flex items-center gap-3 px-3 py-2.5 no-underline hover:bg-[rgba(233,230,223,.05)]"
      >
        <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-[#2a2621] text-[12px] font-extrabold tracking-[-.02em] text-[#d99b10]">
          MD
        </span>
        <span className="truncate text-[13px] font-semibold whitespace-nowrap text-[#e9e6df]">
          Miles D.
        </span>
      </Link>
    </aside>
  );
}
