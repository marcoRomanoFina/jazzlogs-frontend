"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";

const inputClass =
  "w-full rounded-xl border-[1.5px] border-[rgba(233,230,223,.4)] bg-transparent px-4 py-[15px] font-medium text-[15px] text-[#e9e6df] outline-none placeholder:text-[rgba(233,230,223,.35)] transition-colors focus:border-[#d99b10] focus:bg-[rgba(233,230,223,.06)]";

export default function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });

    setSubmitting(false);

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        setFormError("Ese email ya tiene una cuenta. Probá iniciar sesión.");
      } else {
        setFormError(error.message);
      }
      return;
    }

    if (data.session) {
      router.push("/");
      return;
    }

    router.push("/login?message=check-email");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {formError && (
        <div className="mt-6 rounded-xl border border-[rgba(217,60,60,.4)] bg-[rgba(217,60,60,.08)] px-4 py-3 text-sm text-[#e9a3a3]">
          {formError}
        </div>
      )}

      <div className="mt-8">
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

      <div className="mt-[18px]">
        <label
          htmlFor="password"
          className="mb-[9px] block font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.75)]"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="At least 8 characters"
          className={inputClass}
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-2 text-sm text-[#e9a3a3]">{errors.password.message}</p>
        )}
      </div>

      <div className="mt-[18px]">
        <label
          htmlFor="confirmPassword"
          className="mb-[9px] block font-[family-name:var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[.16em] text-[rgba(233,230,223,.75)]"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Repeat your password"
          className={inputClass}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="mt-2 text-sm text-[#e9a3a3]">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-8 w-full rounded-full bg-[#d99b10] py-[17px] font-bold text-[15px] text-[#1c1b18] transition-colors hover:bg-[#e6a614] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Creando cuenta…" : "Create account"}
      </button>

      <p className="mt-4 text-center text-[11.5px] leading-[1.5] text-[rgba(233,230,223,.5)]">
        By continuing you agree to our terms and privacy policy.
      </p>
    </form>
  );
}
