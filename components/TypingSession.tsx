"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import PartProgress, { type Segment } from "@/components/PartProgress";
import Results, { type SaveStatus } from "@/components/Results";
import ThemeToggle from "@/components/ThemeToggle";
import TypingArea from "@/components/TypingArea";
import { useTyping, type Mode } from "@/hooks/useTyping";
import { createClient } from "@/lib/supabase/client";

type Props = {
  note: { id: string; title: string; text: string };
  backHref: string;
  nextHref: string;
  nextLabel?: string;
  segments?: Segment[];
  currentIndex?: number;
  label?: string; // for example "Part 3 of 9"
};

export default function TypingSession({
  note,
  backHref,
  nextHref,
  nextLabel,
  segments,
  currentIndex = -1,
  label,
}: Props) {
  const [mode, setMode] = useState<Mode>("strict");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const t = useTyping(note.text, mode);
  const typing = t.started && !t.finished;
  const resultsRef = useRef<HTMLDivElement>(null);
  const saved = useRef(false);

  useEffect(() => {
    if (t.finished) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [t.finished]);

  useEffect(() => {
    if (!t.finished) {
      saved.current = false;
      return;
    }
    if (saved.current) return;
    saved.current = true;

    async function save() {
      setSaveStatus("saving");
      const supabase = createClient();

      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setSaveStatus("guest");
        return;
      }

      const { error } = await supabase.from("typing_sessions").insert({
        note_id: note.id,
        note_title: note.title,
        mode,
        wpm: t.wpm,
        accuracy: t.accuracy,
        seconds: t.seconds,
        chars: note.text.length,
        missed: t.missed,
      });
      setSaveStatus(error ? "error" : "saved");
    }
    save();
  }, [t.finished, t.wpm, t.accuracy, t.seconds, t.missed, mode, note]);

  function toggleMode(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.blur();
    setMode(mode === "strict" ? "free" : "strict");
    t.reset();
  }

  // The current part turns mint as soon as you finish it
  const shownSegments = segments?.map((s, i) =>
    i === currentIndex ? { ...s, done: s.done || t.finished } : s
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-6">
      <header
        className={`flex flex-wrap items-center justify-between gap-3 transition-opacity duration-500 ${
          typing ? "opacity-10 hover:opacity-100 focus-within:opacity-100" : ""
        }`}
      >
        <div className="flex items-center gap-4">
          <Link href={backHref} className="nb-btn inline-block">
            Back
          </Link>
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="nb-btn" onClick={toggleMode}>
            Mode: {mode === "strict" ? "fix mistakes" : "keep going"}
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="pt-12">
        {shownSegments && shownSegments.length > 1 && (
          <div className="mb-6">
            <PartProgress segments={shownSegments} currentIndex={currentIndex} />
          </div>
        )}

        <div className="mb-2 flex justify-between gap-4 text-sm text-muted">
          <span>
            {label ? `${label}: ` : ""}
            {note.title}
          </span>
          <span>
            Speed <b className="font-semibold text-ink">{t.wpm}</b> wpm, accuracy{" "}
            <b className="font-semibold text-ink">{t.accuracy}%</b>
          </span>
        </div>

        <div className="mb-7 h-1.5 overflow-hidden rounded-full bg-muted/25">
          <div
            className="h-full bg-acc transition-[width] duration-150"
            style={{ width: `${(t.pos / note.text.length) * 100}%` }}
          />
        </div>

        <TypingArea
          text={note.text}
          pos={t.pos}
          wrong={t.wrong}
          miss={t.miss}
          done={t.finished}
        />

        {!t.started && (
          <p className="mt-7 text-sm text-muted">
            Start typing to begin. Press Esc to restart.
          </p>
        )}

        {t.finished && (
          <div ref={resultsRef} className="mt-10">
            <Results
              wpm={t.wpm}
              accuracy={t.accuracy}
              seconds={t.seconds}
              missed={t.missed}
              onAgain={t.reset}
              nextHref={nextHref}
              nextLabel={nextLabel}
              saveStatus={saveStatus}
            />
          </div>
        )}
      </main>
    </div>
  );
}