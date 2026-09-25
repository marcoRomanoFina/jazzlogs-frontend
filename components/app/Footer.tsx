"use client";

import { useSidebar } from "@/components/app/SidebarContext";

export default function Footer() {
  const { pageTint } = useSidebar();
  const accent = pageTint?.accent ?? "#F6D013";
  return (
    <div
      className="mt-14 flex items-center justify-between pt-6"
      style={{ borderTop: `1px solid ${accent}` }}
    >
      <span
        className="font-[family-name:var(--font-fraunces)] text-[22px] font-extrabold tracking-[-.03em]"
        style={{ color: accent }}
      >
        jazzlogs.
      </span>
      <span className="font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.12em] text-[rgba(232,220,192,.6)]">
        © 2026 JAZZLOGS
      </span>
    </div>
  );
}
