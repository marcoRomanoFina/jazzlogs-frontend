"use client";

import { useSearchParams } from "next/navigation";

export default function AdminOnlyBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get("message") !== "admin-only") return null;

  return (
    <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
      Necesitás ser administrador para acceder a esa página.
    </div>
  );
}
