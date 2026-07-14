"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseEnabled } from "@/lib/supabase";

// Wraps the whole app. When Supabase is configured, it requires a magic-link
// login before rendering the app. When it is NOT configured, it renders the app
// straight through (local-only mode), so the site keeps working until the
// backend env vars are set.
export function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!supabaseEnabled || !supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Backend off -> no gate.
  if (!supabaseEnabled) return <>{children}</>;
  if (!ready) return null;
  if (session) return <>{children}</>;

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !email) return;
    setSending(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    setSending(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-[380px] rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6">
          <div className="text-[20px] font-bold tracking-tight text-navy leading-tight">RocketShip</div>
          <div className="text-[20px] font-bold tracking-tight text-accent leading-tight">OS</div>
          <p className="mt-3 text-[13px] text-text-dim">
            Sign in to load your board. Your data saves to your account and syncs across devices.
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg border border-border bg-surface-2 p-4 text-[13px] text-text">
            Check your email. We sent a sign-in link to{" "}
            <span className="font-semibold text-text">{email}</span>. Click it and you&apos;re in.
          </div>
        ) : (
          <form onSubmit={sendLink} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-[14px] text-text outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-lg bg-accent px-3 py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {sending ? "Sending link..." : "Email me a sign-in link"}
            </button>
            {error && <p className="text-[12px] text-crimson">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
