"use client";

import Link from "next/link";
import { useSidebar } from "@/components/app/SidebarContext";

// Navigation lives in the permanent Sidebar now — this is just the wordmark.
export default function Navbar() {
  const { pageTint } = useSidebar();
  return (
    <div className="relative flex items-center py-[26px]">
      {pageTint && (
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
        className="relative z-10 text-2xl font-extrabold tracking-[-.03em] no-underline"
        style={{ color: pageTint?.accent ?? "#d99b10" }}
      >
        jazzlogs.
      </Link>
    </div>
  );
}
