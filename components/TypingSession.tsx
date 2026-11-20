"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import PartProgress, { type Segment } from "@/components/PartProgress";
import Results, { type SaveStatus } from "@/components/Results";
import TypingArea from "@/components/TypingArea";
import { useDismiss } from "@/hooks/useDismiss";
import { useTyping, type Mode } from "@/hooks/useTyping";
import { createClient } from "@/lib/supabase/client";
import { toggleTheme } from "@/lib/theme";

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const t = useTyping(note.text, mode);
  const typing = t.started && !t.finished;
  const resultsRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const saved = useRef(false);

  useDismiss(settingsOpen, settingsRef, () => setSettingsOpen(false));

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

  function chooseMode(next: Mode) {
    setSettingsOpen(false);
    if (next === mode) return;
    setMode(next);
    t.reset();
  }

  // The current part turns mint as soon as you finish it
  const shownSegments = segments?.map((s, i) =>
    i === currentIndex ? { ...s, done: s.done || t.finished } : s
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-5">
      {/* Fades while you type. Hover over it to bring it back. */}
      <header
        className={`flex items-center justify-between gap-3 py-5 transition-opacity duration-500 ${
          typing ? "opacity-10 hover:opacity-100 focus-within:opacity-100" : ""
        }`}
      >
        <Link href="/" aria-label="NoteTypist home">
          <Logo />
        </Link>

        <div className="relative" ref={settingsRef}>
          <button
            className="nb-btn"
            aria-haspopup="dialog"
            aria-expanded={settingsOpen && !typing}
            onClick={(e) => {
              e.currentTarget.blur();
              setSettingsOpen((o) => !o);
            }}
          >
            Settings
          </button>

          {settingsOpen && !typing && (
            <div className="nb-menu" role="dialog" aria-label="Typing settings">
              <p className="px-2.5 pb-1 pt-1.5 text-sm text-muted">When you make a mistake</p>
              <div className="grid gap-2 px-1.5 pb-1.5">
                <button
                  className={mode === "strict" ? "nb-btn nb-btn-primary" : "nb-btn"}
                  onClick={() => chooseMode("strict")}
                >
                  Fix it to continue
                </button>
                <button
                  className={mode === "free" ? "nb-btn nb-btn-primary" : "nb-btn"}
                  onClick={() => chooseMode("free")}
                >
                  Keep going
                </button>
              </div>
              <hr />
              <button
                className="nb-menu-item"
                onClick={(e) => {
                  e.currentTarget.blur();
                  toggleTheme();
                }}
              >
                Switch theme
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl pb-20 pt-6">
        <Link
          href={backHref}
          className={`nb-link mb-6 transition-opacity duration-500 ${
            typing ? "opacity-10 hover:opacity-100" : ""
          }`}
        >
          Back
        </Link>
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