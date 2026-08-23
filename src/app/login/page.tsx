"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Tab = "phone" | "email";
type Step = "enter" | "verify";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("phone");
  const [step, setStep] = useState<Step>("enter");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ensureProfile(userId: string, fallbackName: string) {
    const supabase = createClient();
    const { data: existing } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
    if (!existing) {
      await supabase.from("profiles").insert({ id: userId, display_name: fallbackName, role: "farmer" });
    }
  }

  async function sendCode() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: err } =
      tab === "phone"
        ? await supabase.auth.signInWithOtp({ phone })
        : await supabase.auth.signInWithOtp({ email });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setStep("verify");
  }

  async function verify() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } =
      tab === "phone"
        ? await supabase.auth.verifyOtp({ phone, token: code, type: "sms" })
        : await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    setBusy(false);
    if (err || !data.user) {
      setError(err?.message ?? "Invalid code.");
      return;
    }
    await ensureProfile(data.user.id, tab === "phone" ? phone : email.split("@")[0]);
    router.push(`/profile/${data.user.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-1 text-xl font-bold">Join Krisearch</h1>
      <p className="mb-5 text-sm text-neutral-500">Sign in with your phone number — email works too.</p>

      <div className="mb-4 inline-flex w-full rounded-full border border-neutral-300 p-0.5 text-sm font-medium dark:border-neutral-700">
        <button
          type="button"
          onClick={() => {
            setTab("phone");
            setStep("enter");
            setError(null);
          }}
          className={`flex-1 rounded-full py-1.5 ${tab === "phone" ? "bg-green-600 text-white" : "text-neutral-600 dark:text-neutral-300"}`}
        >
          📱 Phone
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("email");
            setStep("enter");
            setError(null);
          }}
          className={`flex-1 rounded-full py-1.5 ${tab === "email" ? "bg-green-600 text-white" : "text-neutral-600 dark:text-neutral-300"}`}
        >
          ✉️ Email
        </button>
      </div>

      {step === "enter" ? (
        <div className="flex flex-col gap-3">
          {tab === "phone" ? (
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+977 98XXXXXXXX"
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          ) : (
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          )}
          <button
            type="button"
            onClick={sendCode}
            disabled={busy || (tab === "phone" ? !phone : !email)}
            className="rounded-full bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {busy ? "Sending..." : "Send code"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-neutral-500">Enter the 6-digit code sent to {tab === "phone" ? phone : email}</p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            inputMode="numeric"
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-center text-lg tracking-widest dark:border-neutral-700 dark:bg-neutral-900"
          />
          <button
            type="button"
            onClick={verify}
            disabled={busy || code.length < 4}
            className="rounded-full bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {busy ? "Verifying..." : "Verify & continue"}
          </button>
          <button type="button" onClick={() => setStep("enter")} className="text-xs text-neutral-400 underline">
            Change {tab === "phone" ? "phone number" : "email"}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <p className="mt-6 text-center text-xs text-neutral-400">
        Phone sign-in requires an SMS provider configured in your Supabase project (Auth → Providers → Phone).
      </p>
    </div>
  );
}
