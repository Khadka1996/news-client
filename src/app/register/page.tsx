"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { FormEvent, Suspense, useState } from "react";
import { registerUser } from "@/lib/auth";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") ?? "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("नाम, इमेल र पासवर्ड आवश्यक छ");
      return;
    }

    if (password.length < 6) {
      setError("पासवर्ड कम्तिमा ६ क्यारेक्टर लामो हुनुपर्छ");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);
      const user = await registerUser(name, email, password);
      const target = user.role === "user" && redirectParam.startsWith("/") ? redirectParam : "/";
      router.push(target);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "अहिले दर्ता गर्न सकिएन");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-900 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-slate-950/30 border border-slate-200">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">Shikka Nepal</p>
          <h1 className="mt-3 text-3xl font-black text-brand-dark">खाता खोल्नुहोस्</h1>
          <p className="mt-2 text-sm text-slate-500">रजिष्टर्ड भई नयाँ प्रयोगकर्ता बन्नुहोस्</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">पुरा नाम</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="तपाईंको नाम"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-brand-gold focus:bg-white focus:ring-2 focus:ring-brand-gold/20"
            />
          </div>

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
            {isSubmitting ? "खाता खोल्दै..." : "खाता खोल्नुहोस्"}
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
          पहिलेको खाता छ? <Link href="/login" className="font-semibold text-brand-gold hover:underline">लगइन गर्नुहोस्</Link>
        </div>
      </div>
    </main>
  );
}
