"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, type Me } from "@/lib/api";

export default function AdminGate({
  children,
  showBackLink = true,
}: {
  children: React.ReactNode;
  showBackLink?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "authorized" | "forbidden">("checking");

  useEffect(() => {
    let cancelled = false;

    apiFetch<Me>("/me")
      .then((me) => {
        if (cancelled) return;
        if (me.role !== "ADMIN") {
          setStatus("forbidden");
          router.replace("/?message=admin-only");
        } else {
          setStatus("authorized");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("forbidden");
        router.replace("/?message=admin-only");
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status !== "authorized") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-[rgba(233,230,223,.6)]">
          {status === "checking" ? "Verificando acceso…" : "Redirigiendo…"}
        </p>
      </div>
    );
  }

  return (
    <>
      {showBackLink && (
        <div className="mx-auto max-w-4xl px-6 pt-6">
          <Link
            href="/admin"
            className="text-sm text-[rgba(233,230,223,.6)] transition-colors hover:text-[#d99b10]"
          >
            ← Panel de admin
          </Link>
        </div>
      )}
      {children}
    </>
  );
}
