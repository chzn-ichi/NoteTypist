"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SetRow = {
  id: string;
  title: string;
  minutes: number;
  created_at: string;
  note_parts: { id: string }[];
};

type State =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "error"; message: string }
  | { status: "ready"; sets: (SetRow & { typed: number })[] };

export default function NotesList() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setState({ status: "guest" });
        return;
      }

      const { data: sets, error } = await supabase
        .from("note_sets")
        .select("id, title, minutes, created_at, note_parts(id)")
        .order("created_at", { ascending: false });

      if (error || !sets) {
        setState({ status: "error", message: error?.message ?? "Unknown error" });
        return;
      }

      // Which parts have been typed at least once?
      const { data: sessions } = await supabase.from("typing_sessions").select("note_id").limit(2000);
      const typedIds = new Set((sessions ?? []).map((s: { note_id: string }) => s.note_id));

      setState({
        status: "ready",
        sets: (sets as SetRow[]).map((s) => ({
          ...s,
          typed: s.note_parts.filter((p) => typedIds.has(p.id)).length,
        })),
      });
    }
    load();
  }, []);

  if (state.status === "loading") return <p className="text-muted">Loading your notes...</p>;

  if (state.status === "guest") {
    return (
      <div className="nb-card">
        <h2 className="font-heading text-xl font-bold">Log in to see your notes</h2>
        <p className="mt-2 text-muted">Your notes are saved to your account.</p>
        <Link href="/login" className="nb-btn nb-btn-primary mt-5 inline-block">
          Log in
        </Link>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <p role="alert" className="rounded-lg border-2 border-ink bg-err px-3 py-2 text-[#111111]">
        Could not load your notes: {state.message}
      </p>
    );
  }

  if (state.sets.length === 0) {
    return (
      <div className="nb-card">
        <h2 className="font-heading text-xl font-bold">No notes yet</h2>
        <p className="mt-2 text-muted">Paste a lesson and NoteTypist will turn it into typing parts.</p>
        <Link href="/new" className="nb-btn nb-btn-primary mt-5 inline-block">
          Create notes
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {state.sets.map((s) => {
        const total = s.note_parts.length;
        return (
          <li key={s.id}>
            <Link href={`/notes/${s.id}`} className="block">
              <article className="nb-card">
                <h2 className="font-heading text-xl font-bold">{s.title}</h2>
                <p className="mt-1 text-sm text-muted">
                  {total} {total === 1 ? "part" : "parts"}, about {total * s.minutes} minutes,{" "}
                  {s.typed} of {total} typed
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full border-2 border-ink bg-muted/25">
                  <div
                    className="h-full bg-ok"
                    style={{ width: `${total ? (s.typed / total) * 100 : 0}%` }}
                  />
                </div>
              </article>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}