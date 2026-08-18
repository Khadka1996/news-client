"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { FormEvent, Suspense, useState } from "react";
import { getRoleLandingPath, login } from "@/lib/auth";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("इमेल र पासवर्ड आवश्यक छ");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);
      const user = await login(email, password);

      if (!user) {
        setError("गलत इमेल वा पासवर्ड");
        return;
      }

      const target =
        user.role === "admin" || user.role === "moderator"
          ? getRoleLandingPath(user.role)
          : redirectParam.startsWith("/") ? redirectParam : "/";

      router.push(target);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "लगइन गर्न सकेन");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-900 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-slate-950/30 border border-slate-200">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">Shikka Nepal</p>
          <h1 className="mt-3 text-3xl font-black text-brand-dark">लगइन</h1>
          <p className="mt-2 text-sm text-slate-500">अपना खातामा प्रवेश गर्नुहोस्</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">इमेल</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-brand-gold focus:bg-white focus:ring-2 focus:ring-brand-gold/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">पासवर्ड</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-brand-gold focus:bg-white focus:ring-2 focus:ring-brand-gold/20"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-brand-gold px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-gold-light disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "लगइन हुँदैछ..." : "लगइन"}
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
          नयाँ खाताले ? <Link href="/register" className="font-semibold text-brand-gold hover:underline">खाता खोल्नुहोस्</Link>
        </div>
      </div>
    </main>
  );
}
