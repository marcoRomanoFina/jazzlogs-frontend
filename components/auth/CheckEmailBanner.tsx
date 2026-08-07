"use client";

import { useSearchParams } from "next/navigation";

export default function CheckEmailBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get("message") !== "check-email") return null;

  return (
    <div className="mt-6 rounded-xl border border-[rgba(217,159,16,.4)] bg-[rgba(217,159,16,.1)] px-4 py-3 text-sm text-[#e9e6df]">
      Revisá tu email para confirmar tu cuenta antes de iniciar sesión.
    </div>
  );
}
