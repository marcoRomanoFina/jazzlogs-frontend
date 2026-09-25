"use client";

import Link from "next/link";
import { useSidebar } from "@/components/app/SidebarContext";

// Navigation lives in the permanent Sidebar now — this is just the wordmark.
export default function Navbar({
  align = "left",
  showTint = true,
}: {
  // Pages with a right-aligned title/dek over their hero (e.g. the archive
  // page) put the wordmark on the opposite side, so it doesn't collide with
  // that text — left (the default) matches every other page.
  align?: "left" | "right";
  // The album editorial page's own dynamic pageTint would otherwise paint a
  // solid strip behind the wordmark wherever Navbar renders — fine for its
  // usual spot, but wrong when it's living inside a hero image instead (the
  // strip covers part of that image). false skips it there; the color-wash
  // wrapper further down the page already bleeds its own background.
  showTint?: boolean;
}) {
  const { pageTint } = useSidebar();
  return (
    <div
      className={
        "relative flex items-center py-[26px] " +
        (align === "right" ? "justify-end" : "")
      }
    >
      {pageTint && showTint && (
        // Bleeds to the full viewport width (offset for the Sidebar's
        // current width), same trick the tinted page content below uses —
        // without it, the tint only covers this row's own centered column,
        // leaving two untinted strips flanking it on both sides.
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-[calc(50%_-_var(--sidebar-width)/2)] w-screen -translate-x-1/2"
          style={{ backgroundColor: pageTint.background }}
        />
      )}
      <Link
        href="/home"
        className="relative z-10 font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.03em] no-underline"
        style={{ color: pageTint?.accent ?? "#F6D013" }}
      >
        jazzlogs.
      </Link>
    </div>
  );
}
