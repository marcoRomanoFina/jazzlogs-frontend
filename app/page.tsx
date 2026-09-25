"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { apiFetch, ApiError, type Me } from "@/lib/api";
import AdminOnlyBanner from "@/components/AdminOnlyBanner";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setApiError(null);
      setMe(null);

      if (user) {
        try {
          const data = await apiFetch<Me>("/me");
          setMe(data);
          console.log("GET /me ->", data);
        } catch (err) {
          setApiError(
            err instanceof ApiError
              ? `Backend respondió ${err.status}: ${err.message}`
              : "No se pudo conectar con http://localhost:8080. ¿Está corriendo el backend?"
          );
        }
      }

      setLoading(false);
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => load());

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <main className="w-full max-w-lg py-16">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          jazzlogs.
        </h1>

        <Suspense fallback={null}>
          <AdminOnlyBanner />
        </Suspense>

        {loading ? (
          <p className="mt-4 text-zinc-500">Cargando…</p>
        ) : user ? (
          <div className="mt-6 space-y-4">
            <p className="text-zinc-700 dark:text-zinc-300">
              Sesión iniciada como <strong>{user.email}</strong>.
            </p>

            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="mb-2 text-sm font-medium text-zinc-500">
                GET /me (Spring Boot)
              </p>
              {apiError ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {apiError}
                </p>
              ) : me ? (
                <pre className="overflow-x-auto text-xs text-zinc-800 dark:text-zinc-200">
                  {JSON.stringify(me, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-zinc-500">Consultando…</p>
              )}
            </div>

            <div className="flex gap-3">
              {me?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="rounded-full bg-[#F6D013] px-5 py-2 text-sm font-bold text-[#1C1A14]"
                >
                  Panel de admin →
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-black hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-zinc-600 dark:text-zinc-400">
              Todavía no iniciaste sesión.
            </p>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-black dark:border-zinc-700 dark:text-zinc-50"
              >
                Create account
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
