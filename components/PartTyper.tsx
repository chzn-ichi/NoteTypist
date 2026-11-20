"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TypingSession from "@/components/TypingSession";
import { createClient } from "@/lib/supabase/client";

type PartRow = { id: string; position: number; title: string; text: string };

type State =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "missing" }
  | { status: "ready"; parts: PartRow[]; doneIds: string[] };

export default function PartTyper({ setId, position }: { setId: string; position: number }) {
  const [state, setState] = useState<State>({ status: "loading" });

  // Reloads when you move to another part, so the progress bar is always up to date
  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setState({ status: "guest" });
        return;
      }

      const { data: parts } = await supabase
        .from("note_parts")
        .select("id, position, title, text")
        .eq("set_id", setId)
        .order("position");

      if (!parts || parts.length === 0) {
        setState({ status: "missing" });
        return;
      }

      const ids = (parts as PartRow[]).map((p) => p.id);
      const { data: sessions } = await supabase
        .from("typing_sessions")
        .select("note_id")
        .in("note_id", ids);

      setState({
        status: "ready",
        parts: parts as PartRow[],
        doneIds: [...new Set((sessions ?? []).map((s: { note_id: string }) => s.note_id))],
      });
    }
    load();
  }, [setId, position]);

  if (state.status === "loading") return <p className="p-10 text-muted">Loading...</p>;

  if (state.status === "guest") {
    return (
      <main className="mx-auto max-w-md px-5 py-10">
        <div className="nb-card">
          <h2 className="font-heading text-xl font-bold">Log in to type your notes</h2>
          <Link href="/login" className="nb-btn nb-btn-primary mt-5 inline-block">
            Log in
          </Link>
        </div>
      </main>
    );
  }

  const index = state.status === "ready" ? state.parts.findIndex((p) => p.position === position) : -1;

  if (state.status === "missing" || index === -1) {
    return (
      <main className="mx-auto max-w-md px-5 py-10">
        <div className="nb-card">
          <h2 className="font-heading text-xl font-bold">Part not found</h2>
          <Link href="/notes" className="nb-btn nb-btn-primary mt-5 inline-block">
            My notes
          </Link>
        </div>
      </main>
    );
  }

  const { parts, doneIds } = state;
  const part = parts[index];
  const next = parts[index + 1];

  return (
    <TypingSession
      key={part.id}
      note={{ id: part.id, title: part.title, text: part.text }}
      backHref={`/notes/${setId}`}
      nextHref={next ? `/notes/${setId}/${next.position}` : `/notes/${setId}`}
      nextLabel={next ? "Next part" : "Back to my notes"}
      label={`Part ${index + 1} of ${parts.length}`}
      currentIndex={index}
      segments={parts.map((p) => ({
        href: `/notes/${setId}/${p.position}`,
        title: p.title,
        done: doneIds.includes(p.id),
      }))}
    />
  );
}