"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { PartNotes, WritePart } from "@/lib/notes/types";
import { createClient } from "@/lib/supabase/client";
import { countWords } from "@/lib/text/prepare";
import { makeTypeable } from "@/lib/text/typeable";

type Status =
  | { state: "pending" }
  | { state: "working" }
  | { state: "done"; result: PartNotes }
  | { state: "error"; message: string };

type Props = {
  title: string;
  parts: WritePart[];
  minutes: number;
  onBack: () => void;
};

export default function WriteNotes({ title, parts, minutes, onBack }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Record<string, Status>>(() =>
    Object.fromEntries(parts.map((p) => [p.id, { state: "pending" } as Status]))
  );
  const [edited, setEdited] = useState<Record<string, string>>({}); // your edits, by part id
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const stopRef = useRef(false);
  const doneRef = useRef(new Set<string>());

  useEffect(() => {
    return () => {
      stopRef.current = true;
    };
  }, []);

  async function writePart(p: WritePart): Promise<boolean> {
    setStatus((s) => ({ ...s, [p.id]: { state: "working" } }));
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: p.source,
          title: p.title,
          keyItems: p.keyItems,
          minutes,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus((s) => ({
          ...s,
          [p.id]: { state: "error", message: data.error ?? "Something went wrong." },
        }));
        return false;
      }

      doneRef.current.add(p.id);
      // A rewrite replaces any earlier edit of this part
      setEdited((e) => {
        const copy = { ...e };
        delete copy[p.id];
        return copy;
      });
      setStatus((s) => ({ ...s, [p.id]: { state: "done", result: data as PartNotes } }));
      return true;
    } catch {
      setStatus((s) => ({
        ...s,
        [p.id]: { state: "error", message: "Network problem. Check your connection." },
      }));
      return false;
    }
  }

  async function runAll() {
    stopRef.current = false;
    setRunning(true);
    for (const p of parts) {
      if (stopRef.current) break;
      if (doneRef.current.has(p.id)) continue;
      const ok = await writePart(p);
      if (!ok) break;
    }
    setRunning(false);
  }

  async function retryOne(p: WritePart) {
    setRunning(true);
    await writePart(p);
    setRunning(false);
  }

  function goBack() {
    if (doneRef.current.size === 0 || confirm("Going back will discard the notes written so far. Continue?")) {
      stopRef.current = true;
      onBack();
    }
  }

  // The text we will save for a part: your edit if there is one, cleaned so it is typeable
  function finalText(p: WritePart) {
    const s = status[p.id];
    if (s.state !== "done") return "";
    return makeTypeable(edited[p.id] ?? s.result.notes).text;
  }

  async function saveAll() {
    setSaveError("");

    for (let i = 0; i < parts.length; i++) {
      const len = finalText(parts[i]).length;
      if (len < 20) {
        setSaveError(`Part ${i + 1} is too short to save. Write at least a sentence.`);
        return;
      }
      if (len > 8000) {
        setSaveError(`Part ${i + 1} is too long. Please shorten it.`);
        return;
      }
    }

    setSaving(true);
    const supabase = createClient();

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setSaveError("You need to be logged in to save.");
      setSaving(false);
      return;
    }

    const { data: set, error: setError } = await supabase
      .from("note_sets")
      .insert({ title: title.trim() || "Untitled notes", minutes })
      .select("id")
      .single();

    if (setError || !set) {
      setSaveError("Could not save your notes. Please try again.");
      setSaving(false);
      return;
    }

    const rows = parts.map((p, i) => {
      const s = status[p.id];
      return {
        set_id: set.id,
        position: i + 1,
        title: p.title.trim() || `Part ${i + 1}`,
        text: finalText(p),
        key_items: p.keyItems,
        coverage: s.state === "done" ? s.result.coverage : null,
      };
    });

    const { error: partsError } = await supabase.from("note_parts").insert(rows);

    if (partsError) {
      // Do not leave a half-saved set behind
      await supabase.from("note_sets").delete().eq("id", set.id);
      setSaveError("Could not save your notes. Please try again.");
      setSaving(false);
      return;
    }

    router.push(`/notes/${set.id}`);
  }

  const doneCount = parts.filter((p) => status[p.id]?.state === "done").length;
  const allDone = doneCount === parts.length;
  const hasStarted = parts.some((p) => status[p.id]?.state !== "pending");
  const busy = running || saving;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl font-bold">
          {allDone
            ? "All parts written"
            : hasStarted
              ? "Writing your notes"
              : "Ready to write your notes"}
        </h2>
        <p className="mt-2 text-muted">
          {hasStarted
            ? `${doneCount} of ${parts.length} parts done. Keep this page open until you save, because your notes are not saved yet.`
            : `${parts.length} ${parts.length === 1 ? "part" : "parts"} will be written one after another, which takes a few seconds each. Click Start writing when you are ready.`}
        </p>
        {!hasStarted && (
          <button className="nb-btn nb-btn-primary mt-5" onClick={runAll}>
            Start writing
          </button>
        )}
      </div>

      <div className="flex gap-1.5" aria-hidden="true">
        {parts.map((p) => {
          const s = status[p.id]?.state;
          const color =
            s === "done" ? "bg-ok" : s === "working" ? "bg-pri" : s === "error" ? "bg-err" : "bg-muted/25";
          return <div key={p.id} className={`h-3 flex-1 rounded-full border-2 border-ink ${color}`} />;
        })}
      </div>

      <ol className="space-y-4">
        {parts.map((p, i) => {
          const s = status[p.id];
          return (
            <li key={p.id} className="nb-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-heading text-lg font-bold">
                  Part {i + 1}: {p.title}
                </p>
                <span className="text-sm text-muted">
                  {s.state === "pending" && hasStarted && "Up next"}
                  {s.state === "working" && "Writing..."}
                  {s.state === "done" && `${countWords(edited[p.id] ?? s.result.notes)} words`}
                  {s.state === "error" && "Failed"}
                </span>
              </div>

              {s.state === "error" && (
                <div className="mt-3 space-y-3">
                  <p role="alert" className="rounded-lg border-2 border-ink bg-err px-3 py-2 text-sm text-[#111111]">
                    {s.message}
                  </p>
                  <button className="nb-btn" onClick={() => retryOne(p)} disabled={busy}>
                    Try this part again
                  </button>
                </div>
              )}

              {s.state === "done" && (
                <div className="mt-3 space-y-3">
                  <p className="text-sm">
                    <span className="rounded-full border-2 border-ink bg-ok px-3 py-0.5 text-[#111111]">
                      {s.result.coverage.total > 0
                        ? `Covers ${s.result.coverage.covered} of ${s.result.coverage.total} key items`
                        : "No key items to check"}
                    </span>
                    <span className="ml-2 text-muted">(estimated)</span>
                  </p>

                  {s.result.coverage.missing.length > 0 && (
                    <p className="text-sm text-muted">
                      Possibly missing: {s.result.coverage.missing.join("; ")}
                    </p>
                  )}

                  <details>
                    <summary className="cursor-pointer text-sm font-semibold">Preview and edit</summary>
                    <textarea
                      className="nb-input mt-3 h-48 font-mono text-sm leading-relaxed"
                      aria-label={`Notes for part ${i + 1}`}
                      value={edited[p.id] ?? s.result.notes}
                      onChange={(e) => setEdited((all) => ({ ...all, [p.id]: e.target.value }))}
                    />
                    <p className="mt-1 text-sm text-muted">
                      Special characters and line breaks are cleaned when you save, so everything stays
                      easy to type.
                    </p>
                  </details>

                  <button className="nb-btn" onClick={() => retryOne(p)} disabled={busy}>
                    Rewrite this part
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {saveError && (
        <p role="alert" className="rounded-lg border-2 border-ink bg-err px-3 py-2 text-[#111111]">
          {saveError}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button className="nb-btn" onClick={goBack} disabled={saving}>
          Back to the plan
        </button>
        {!allDone && !running && hasStarted && (
          <button className="nb-btn nb-btn-primary" onClick={runAll}>
            Continue writing
          </button>
        )}
        {running && (
          <button className="nb-btn" onClick={() => (stopRef.current = true)}>
            Stop after this part
          </button>
        )}
        {allDone && (
          <button className="nb-btn nb-btn-primary" onClick={saveAll} disabled={busy}>
            {saving ? "Saving..." : "Save notes"}
          </button>
        )}
      </div>
    </div>
  );
}