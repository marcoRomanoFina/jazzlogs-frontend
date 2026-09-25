import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import CheckEmailBanner from "@/components/auth/CheckEmailBanner";

export const metadata: Metadata = {
  title: "Sign in — jazzlogs.",
};

export default function LoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[1.05fr_1fr]">
      {/* LEFT — mustard cover */}
      <div className="hidden flex-col bg-[#F6D013] px-13 py-11 text-[#1C1A14] md:flex">
        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-6 font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.2em]">
            From the archive · Log №001
          </div>
          <blockquote className="max-w-[460px] text-[42px] font-semibold leading-[1.16] tracking-[-.025em]">
            &ldquo;The record never changes. You do. So play it again —
            closer this time.&rdquo;
          </blockquote>
          <div className="mt-6 font-[family-name:var(--font-dm-sans)] text-[13px] font-medium tracking-[.06em] text-[rgba(28,26,20,.6)]">
            — jazzlogs, on why we log
          </div>
        </div>
      </div>

      {/* RIGHT — ink form */}
      <div className="flex flex-col bg-[#2A261C] px-6 py-11 text-[#E8DCC0] sm:px-13">
        <div className="flex justify-end text-[13px] font-semibold">
          <Link href="/" className="text-[#E8DCC0] no-underline hover:opacity-65">
            ← Back to home
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center">
          <div className="font-[family-name:var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[.28em] text-[rgba(232,220,192,.6)]">
            Sign in
          </div>
          <h2 className="mt-4 text-[52px] font-extrabold leading-[.96] tracking-[-.035em]">
            Welcome back.
          </h2>

          <Suspense fallback={null}>
            <CheckEmailBanner />
          </Suspense>

          <LoginForm />

          <p className="mt-[30px] text-[14px] font-medium text-[rgba(232,220,192,.8)]">
            New to jazzlogs?{" "}
            <Link
              href="/register"
              className="border-b-[1.5px] border-[rgba(232,220,192,.5)] pb-px font-bold text-[#E8DCC0] no-underline"
            >
              Create an account →
            </Link>
          </p>
        </div>

        <div className="font-[family-name:var(--font-dm-sans)] text-[10.5px] font-medium uppercase tracking-[.12em] text-[rgba(232,220,192,.5)]">
          © 2026 JAZZLOGS
        </div>
      </div>
    </div>
  );
}
