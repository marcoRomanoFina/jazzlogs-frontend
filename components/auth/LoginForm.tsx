"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";

const inputClass =
  "w-full rounded-xl border-[1.5px] border-[rgba(233,230,223,.4)] bg-transparent px-4 py-[15px] font-medium text-[15px] text-[#e9e6df] outline-none placeholder:text-[rgba(233,230,223,.35)] transition-colors focus:border-[#d99b10] focus:bg-[rgba(233,230,223,.06)]";

export default function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    setSubmitting(false);

    if (error) {
      if (error.message.toLowerCase().includes("invalid login credentials")) {
        setFormError("Email o contraseña incorrectos.");
      } else {
        setFormError(error.message);
      }
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {formError && (
        <div className="mt-6 rounded-xl border border-[rgba(217,60,60,.4)] bg-[rgba(217,60,60,.08)] px-4 py-3 text-sm text-[#e9a3a3]">
          {formError}
        </div>
      )}

      <div className="mt-[34px]">
        <label
          htmlFor="email"
          className="mb-[9px] block font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.75)]"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          className={inputClass}
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-2 text-sm text-[#e9a3a3]">{errors.email.message}</p>
        )}
      </div>

      <div className="mt-5">
        <label
          htmlFor="password"
          className="mb-[9px] block font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.75)]"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          className={inputClass}
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-2 text-sm text-[#e9a3a3]">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-[26px] w-full rounded-full bg-[#d99b10] py-[17px] font-bold text-[15px] text-[#1c1b18] transition-colors hover:bg-[#e6a614] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Ingresando…" : "Sign in"}
      </button>
    </form>
  );
}
