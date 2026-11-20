"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // stops the browser from reloading the page
    setError("");
    setNotice("");
    setLoading(true);

    const supabase = createClient();
    const { data, error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    if (!data.session) {
      // Happens when "Confirm email" is on in Supabase
      setNotice("Check your email to confirm your account, then log in.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="nb-card">
      <h1 className="font-heading text-3xl font-bold">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-2 text-muted">
        {mode === "login"
          ? "Log in to save your typing history."
          : "Sign up to save your notes and track your progress."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Email</span>
          <input
            className="nb-input"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Password</span>
          <input
            className="nb-input"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "signup" && (
            <span className="mt-1 block text-sm text-muted">At least 8 characters.</span>
          )}
        </label>

        {error && (
          <p role="alert" className="rounded-lg border-2 border-ink bg-err px-3 py-2 text-sm text-[#111111]">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-lg border-2 border-ink bg-ok px-3 py-2 text-sm text-[#111111]">
            {notice}
          </p>
        )}

        <button type="submit" disabled={loading} className="nb-btn nb-btn-primary w-full">
          {loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>

      <button
        type="button"
        className="mt-5 text-sm font-semibold underline underline-offset-4"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError("");
          setNotice("");
        }}
      >
        {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
      </button>
    </div>
  );
}