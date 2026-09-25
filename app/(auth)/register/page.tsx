import Link from "next/link";
import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create account — jazzlogs.",
};

export default function RegisterPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[1.05fr_1fr]">
      {/* LEFT — mustard cover */}
      <div className="hidden flex-col bg-[#F6D013] px-13 py-11 text-[#1C1A14] md:flex">
        <div className="flex items-center justify-between border-b border-[rgba(28,26,20,.2)] pb-4">
          <span className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold tracking-[-.03em]">
            jazzlogs.
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-center py-11">
          <h1 className="max-w-[460px] font-[family-name:var(--font-fraunces)] text-[62px] font-extrabold leading-[.94] tracking-[-.04em]">
            Welcome to jazzlogs.
          </h1>
          <p className="mt-5 max-w-[430px] font-[family-name:var(--font-newsreader)] text-[17px] leading-[1.55] text-[rgba(28,26,20,.72)]">
            A daily jazz journal — one record a day, chosen by ear and
            written up in full. Start reading, start listening, and make it
            your own.
          </p>
        </div>
      </div>

      {/* RIGHT — ink form */}
      <div className="flex flex-col bg-[#1C1A14] px-6 py-11 text-[#E8DCC0] sm:px-13">
        <div className="flex justify-end text-[13px] font-semibold">
          <Link href="/" className="text-[#E8DCC0] no-underline hover:opacity-65">
            ← Back to home
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center">
          <div className="font-[family-name:var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[.28em] text-[rgba(232,220,192,.6)]">
            Create account
          </div>
          <h2 className="mt-4 text-[52px] font-extrabold leading-[.96] tracking-[-.035em]">
            Start your log.
          </h2>
          <p className="mt-4 text-[15px] leading-[1.55] text-[rgba(232,220,192,.72)]">
            One account for the daily log, the archive, and — if you want
            it — the agent.
          </p>

          <RegisterForm />

          <p className="mt-6 text-center text-[14px] font-medium text-[rgba(232,220,192,.8)]">
            Already a member?{" "}
            <Link
              href="/login"
              className="border-b-[1.5px] border-[rgba(232,220,192,.5)] pb-px font-bold text-[#E8DCC0] no-underline"
            >
              Sign in →
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
