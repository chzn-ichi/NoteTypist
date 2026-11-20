"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PartProgress from "@/components/PartProgress";
import { createClient } from "@/lib/supabase/client";
import { countWords } from "@/lib/text/prepare";

type PartInfo = {
  id: string;
  position: number;
  title: string;
  text: string;
  done: boolean;
  bestWpm: number;
};

type State =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "missing" }
  | { status: "ready"; title: string; minutes: number; parts: PartInfo[] };

export default function SetView({ setId }: { setId: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setState({ status: "guest" });
        return;
      }

      const { data: set } = await supabase
        .from("note_sets")
        .select("title, minutes")
        .eq("id", setId)
        .maybeSingle();
      const { data: parts } = await supabase
        .from("note_parts")
        .select("id, position, title, text")
        .eq("set_id", setId)
        .order("position");

      if (!set || !parts || parts.length === 0) {
        setState({ status: "missing" });
        return;
      }

      const ids = parts.map((p: { id: string }) => p.id);
      const { data: sessions } = await supabase
        .from("typing_sessions")
        .select("note_id, wpm")
        .in("note_id", ids);

      const best: Record<string, number> = {};
      for (const s of (sessions ?? []) as { note_id: string; wpm: number }[]) {
        best[s.note_id] = Math.max(best[s.note_id] ?? 0, s.wpm);
      }

      setState({
        status: "ready",
        title: set.title,
        minutes: set.minutes,
        parts: (parts as { id: string; position: number; title: string; text: string }[]).map((p) => ({
          ...p,
          done: p.id in best,
          bestWpm: best[p.id] ?? 0,
        })),
      });
    }
    load();
  }, [setId]);

  async function deleteSet() {
    if (!confirm("Delete these notes? Your typing history stays.")) return;
    const { error } = await createClient().from("note_sets").delete().eq("id", setId);
    if (error) setDeleteError("Could not delete. Please try again.");
    else router.push("/notes");
  }

  if (state.status === "loading") return <p className="mt-12 text-muted">Loading...</p>;

  if (state.status === "guest") {
    return (
      <div className="nb-card mt-12">
        <h2 className="font-heading text-xl font-bold">Log in to see these notes</h2>
        <Link href="/login" className="nb-btn nb-btn-primary mt-5 inline-block">
          Log in
        </Link>
      </div>
    );
  }

  if (state.status === "missing") {
    return (
      <div className="nb-card mt-12">
        <h2 className="font-heading text-xl font-bold">Notes not found</h2>
        <p className="mt-2 text-muted">They may have been deleted, or they belong to another account.</p>
        <Link href="/notes" className="nb-btn nb-btn-primary mt-5 inline-block">
          My notes
        </Link>
      </div>
    );
  }

  const { title, minutes, parts } = state;
  const typed = parts.filter((p) => p.done).length;
  const nextUp = parts.findIndex((p) => !p.done); // first part you have not typed
  const segments = parts.map((p) => ({
    href: `/notes/${setId}/${p.position}`,
    title: p.title,
    done: p.done,
  }));

  return (
    <div className="mt-12 space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold">{title}</h1>
        <p className="mt-2 text-muted">
          {parts.length} {parts.length === 1 ? "part" : "parts"}, about {parts.length * minutes} minutes
          of typing. {typed} of {parts.length} typed.
        </p>
      </div>

      <PartProgress segments={segments} currentIndex={nextUp} />

      <div className="flex flex-wrap items-center gap-3">
        {nextUp === -1 ? (
          <>
            <p className="font-semibold">You typed every part. Great work!</p>
            <Link href={`/notes/${setId}/1`} className="nb-btn nb-btn-primary inline-block">
              Type again from part 1
            </Link>
          </>
        ) : (
          <Link
            href={`/notes/${setId}/${parts[nextUp].position}`}
            className="nb-btn nb-btn-primary inline-block"
          >
            {typed === 0 ? "Start part 1" : `Continue with part ${nextUp + 1}`}
          </Link>
        )}
      </div>

      <ol className="space-y-3">
        {parts.map((p, i) => (
          <li
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-lg border-2 border-ink bg-surface px-4 py-3"
          >
            <div>
              <p className="font-semibold">
                Part {i + 1}: {p.title}
              </p>
              <p className="text-sm text-muted">
                {countWords(p.text)} words,{" "}
                {p.done ? `typed, best ${p.bestWpm} wpm` : "not typed yet"}
              </p>
            </div>
            <Link href={`/notes/${setId}/${p.position}`} className="nb-btn inline-block">
              {p.done ? "Type again" : "Type"}
            </Link>
          </li>
        ))}
      </ol>

      <div>
        <button className="nb-btn" onClick={deleteSet}>
          Delete these notes
        </button>
        {deleteError && <p className="mt-2 text-sm">{deleteError}</p>}
      </div>
    </div>
  );
}