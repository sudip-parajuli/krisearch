"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Tab = "phone" | "email";
type Step = "enter" | "verify";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("phone");
  const [step, setStep] = useState<Step>("enter");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGuestUpgrade, setIsGuestUpgrade] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.is_anonymous) setIsGuestUpgrade(true);
    });
  }, []);

  async function ensureProfile(userId: string, fallbackName: string, method: "phone" | "email") {
    const supabase = createClient();
    const { data: existing } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
    if (!existing) {
      await supabase.from("profiles").insert({ id: userId, display_name: fallbackName, role: "farmer", verification_method: method });
    } else {
      // Guest upgrading to a verified identity — drop the guest flag and record how they verified.
      await supabase.from("profiles").update({ is_guest: false, verification_method: method }).eq("id", userId);
    }
  }

  async function signInWithOAuth(provider: "google" | "facebook") {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) {
      setError(err.message);
      setBusy(false);
    }
    // On success the browser navigates away to the provider — nothing more to do here.
  }

  async function sendCode() {
    setBusy(true);
    setError(null);
    const supabase = createClient();

    // If we already have a guest (anonymous) session, link a real phone/email
    // to it instead of starting a brand-new account — this keeps the guest's
    // existing posts/votes attributed to the same profile id.
    const { error: err } = isGuestUpgrade
      ? tab === "phone"
        ? await supabase.auth.updateUser({ phone })
        : await supabase.auth.updateUser({ email })
      : tab === "phone"
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

    const { data, error: err } = isGuestUpgrade
      ? tab === "phone"
        ? await supabase.auth.verifyOtp({ phone, token: code, type: "phone_change" })
        : await supabase.auth.verifyOtp({ email, token: code, type: "email_change" })
      : tab === "phone"
        ? await supabase.auth.verifyOtp({ phone, token: code, type: "sms" })
        : await supabase.auth.verifyOtp({ email, token: code, type: "email" });

    setBusy(false);
    if (err || !data.user) {
      setError(err?.message ?? "Invalid code.");
      return;
    }
    await ensureProfile(data.user.id, tab === "phone" ? phone : email.split("@")[0], tab);
    router.push(`/profile/${data.user.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-1 text-xl font-bold">{isGuestUpgrade ? "Save your posts to an account" : t("joinTitle")}</h1>
      <p className="mb-5 text-sm text-neutral-500">
        {isGuestUpgrade
          ? "You've been posting as a guest — verify a phone or email to keep your name and history across devices."
          : t("joinSubtitle")}
      </p>

      {!isGuestUpgrade && (
        <div className="mb-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => signInWithOAuth("google")}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white py-2.5 text-sm font-medium shadow-sm transition-shadow hover:shadow-md hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            🔍 {t("continueGoogle")}
          </button>
          <button
            type="button"
            onClick={() => signInWithOAuth("facebook")}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-full bg-[#1877F2] py-2.5 text-sm font-medium text-white shadow-sm transition-shadow hover:shadow-md hover:bg-[#1567d3] disabled:opacity-50"
          >
            📘 {t("continueFacebook")}
          </button>
          <div className="my-1 flex items-center gap-2 text-xs text-neutral-400">
            <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            {t("or")}
            <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
      )}

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
        Google/Facebook require OAuth apps configured there too (Auth → Providers).
      </p>
    </div>
  );
}
