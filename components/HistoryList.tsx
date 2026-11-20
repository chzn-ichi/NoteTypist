"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Session = {
  id: string;
  note_title: string;
  mode: "strict" | "free";
  wpm: number;
  accuracy: number;
  seconds: number;
  missed: Record<string, number>;
  created_at: string;
};

type State =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "error"; message: string }
  | { status: "ready"; sessions: Session[] };

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export default function HistoryList() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setState({ status: "guest" });
        return;
      }

      // Row Level Security makes sure we only ever get our own rows back
      const { data, error } = await supabase
        .from("typing_sessions")
        .select("id, note_title, mode, wpm, accuracy, seconds, missed, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) setState({ status: "error", message: error.message });
      else setState({ status: "ready", sessions: data as Session[] });
    }
    load();
  }, []);

  if (state.status === "loading") {
    return <p className="text-muted">Loading your history...</p>;
  }

  if (state.status === "guest") {
    return (
      <div className="nb-card">
        <h2 className="font-heading text-xl font-bold">Log in to see your history</h2>
        <p className="mt-2 text-muted">Your results are saved to your account.</p>
        <Link href="/login" className="nb-btn nb-btn-primary mt-5 inline-block">
          Log in
        </Link>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <p role="alert" className="rounded-lg border-2 border-ink bg-err px-3 py-2 text-[#111111]">
        Could not load your history: {state.message}
      </p>
    );
  }

  const { sessions } = state;

  if (sessions.length === 0) {
    return (
      <div className="nb-card">
        <h2 className="font-heading text-xl font-bold">No sessions yet</h2>
        <p className="mt-2 text-muted">Finish a note while logged in and it will show up here.</p>
        <Link href="/" className="nb-btn nb-btn-primary mt-5 inline-block">
          Start typing
        </Link>
      </div>
    );
  }

  // Summary numbers
  const best = Math.max(...sessions.map((s) => s.wpm));
  const avgAccuracy = Math.round(sessions.reduce((n, s) => n + s.accuracy, 0) / sessions.length);

  // Add up the missed keys from every session
  const totals: Record<string, number> = {};
  for (const s of sessions) {
    for (const [key, count] of Object.entries(s.missed ?? {})) {
      totals[key] = (totals[key] ?? 0) + count;
    }
  }
  const topKeys = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border-2 border-ink bg-pri px-4 py-3 text-[#111111]">
          <span className="block text-sm opacity-80">Best speed</span>
          <strong className="font-heading text-3xl">{best} wpm</strong>
        </div>
        <div className="rounded-lg border-2 border-ink px-4 py-3">
          <span className="block text-sm opacity-80">Average accuracy</span>
          <strong className="font-heading text-3xl">{avgAccuracy}%</strong>
        </div>
        <div className="rounded-lg border-2 border-ink px-4 py-3">
          <span className="block text-sm opacity-80">Sessions</span>
          <strong className="font-heading text-3xl">{sessions.length}</strong>
        </div>
      </div>

      {topKeys.length > 0 && (
        <div>
          <p className="text-sm text-muted">Keys you miss most</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {topKeys.map(([key, count]) => (
              <span
                key={key}
                className="rounded-full border-2 border-ink bg-err px-3 py-0.5 font-mono text-sm text-[#111111]"
              >
                {key === " " ? "space" : key} x{count}
              </span>
            ))}
          </div>
        </div>
      )}

      <ul className="space-y-3">
        {sessions.map((s) => (
          <li
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 rounded-lg border-2 border-ink bg-surface px-4 py-3"
          >
            <div>
              <p className="font-semibold">{s.note_title}</p>
              <p className="text-sm text-muted">
                {new Date(s.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
                , {s.mode === "strict" ? "fix mistakes" : "keep going"}
              </p>
            </div>
            <p className="font-mono text-sm">
              <b>{s.wpm} wpm</b>, {s.accuracy}%, {formatTime(s.seconds)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}