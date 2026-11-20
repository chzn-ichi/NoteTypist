"use client";

import Link from "next/link";
import { useState } from "react";
import WriteNotes from "@/components/WriteNotes";
import {
  DETAIL_LEVELS,
  MAX_CHARS,
  MIN_CHARS,
  MINUTE_OPTIONS,
  estimateParts,
  type DetailLevel,
} from "@/lib/notes/config";
import type { Plan, PlanPart, WritePart } from "@/lib/notes/types";

type DraftPart = PlanPart & { include: boolean };
type Step = "input" | "planning" | "review" | "write";

export default function NewNotes() {
  const [step, setStep] = useState<Step>("input");
  const [text, setText] = useState("");
  const [minutes, setMinutes] = useState<number>(5);
  const [detail, setDetail] = useState<DetailLevel>("standard");
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [title, setTitle] = useState("");
  const [parts, setParts] = useState<DraftPart[]>([]);
  const [chunks, setChunks] = useState<string[]>([]);
  const [writeParts, setWriteParts] = useState<WritePart[]>([]);

  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const tooShort = trimmed.length < MIN_CHARS;
  const tooLong = text.length > MAX_CHARS;
  const estParts = estimateParts(words, minutes, detail);

  async function makePlan() {
    setError("");
    setNeedsLogin(false);
    setStep("planning");

    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, minutes, detail }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setNeedsLogin(res.status === 401);
      setStep("input");
      return;
    }

    const plan: Plan = data.plan;
    setTitle(plan.title);
    setChunks(data.chunks as string[]);
    setParts(plan.parts.map((p) => ({ ...p, include: true })));
    setStep("review");
  }

  function updatePart(id: string, changes: Partial<DraftPart>) {
    setParts((all) => all.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  }

  // Turns the chosen parts into parts with their slice of the source text
  function startWriting() {
    const chosen = parts.filter((p) => p.include);
    setWriteParts(
      chosen.map((p) => ({
        id: p.id,
        title: p.title,
        keyItems: p.keyItems,
        sourceWords: p.sourceWords,
        source: chunks.slice(p.fromChunk - 1, p.toChunk).join("\n\n"),
      }))
    );
    setStep("write");
  }

  // ---------- Waiting for the plan ----------
  if (step === "planning") {
    return (
      <div className="nb-card">
        <h2 className="font-heading text-2xl font-bold">Planning your notes...</h2>
        <p className="mt-2 text-muted">
          Reading your document and splitting it into parts. This can take 10 to 30 seconds.
        </p>
      </div>
    );
  }

  // ---------- Writing the notes ----------
  if (step === "write") {
    return (
      <WriteNotes
        title={title}
        parts={writeParts}
        minutes={minutes}
        onBack={() => setStep("review")}
      />
    );
  }

  // ---------- Review the plan ----------
  if (step === "review") {
    const chosen = parts.filter((p) => p.include);

    return (
      <div className="space-y-6">
        <div>
          <input
            className="nb-input font-heading text-2xl font-bold"
            aria-label="Title of your notes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <p className="mt-2 text-muted">
            {chosen.length} of {parts.length} parts selected, about {chosen.length * minutes} minutes
            of typing. Rename parts or skip the ones you do not need.
          </p>
        </div>

        <ol className="space-y-4">
          {parts.map((p, i) => (
            <li key={p.id} className={`nb-card ${p.include ? "" : "opacity-50"}`}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-heading text-lg font-bold">Part {i + 1}</span>
                <input
                  className="nb-input min-w-0 flex-1"
                  aria-label={`Title of part ${i + 1}`}
                  value={p.title}
                  onChange={(e) => updatePart(p.id, { title: e.target.value })}
                />
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={p.include}
                    onChange={(e) => updatePart(p.id, { include: e.target.checked })}
                  />
                  Include
                </label>
              </div>

              <p className="mt-3 text-sm text-muted">
                From about {p.sourceWords} words of your document
              </p>

              {p.keyItems.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.keyItems.slice(0, 6).map((k) => (
                    <span key={k} className="rounded-full border-2 border-ink px-3 py-0.5 text-sm">
                      {k}
                    </span>
                  ))}
                  {p.keyItems.length > 6 && (
                    <span className="px-1 py-0.5 text-sm text-muted">
                      +{p.keyItems.length - 6} more key items
                    </span>
                  )}
                </div>
              )}
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap items-center gap-3">
          <button className="nb-btn" onClick={() => setStep("input")}>
            Back to my text
          </button>
          <button
            className="nb-btn nb-btn-primary"
            onClick={startWriting}
            disabled={chosen.length === 0}
          >
            Generate notes
          </button>
        </div>
      </div>
    );
  }

  // ---------- Paste your text and choose settings ----------
  return (
    <div className="space-y-7">
      <div>
        <label htmlFor="source" className="mb-2 block font-semibold">
          Your study material
        </label>
        <textarea
          id="source"
          className="nb-input h-72"
          placeholder="Paste a lesson, a chapter, or your class notes here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <p className="mt-2 text-sm text-muted">
          {words} words.{" "}
          {tooShort && words > 0 && `Add at least ${MIN_CHARS} characters.`}
          {tooLong && `Too long: the limit is ${MAX_CHARS} characters.`}
        </p>
      </div>

      <div>
        <p className="mb-2 font-semibold">Minutes per part</p>
        <div className="flex flex-wrap gap-3">
          {MINUTE_OPTIONS.map((m) => (
            <button
              key={m}
              className={m === minutes ? "nb-btn nb-btn-primary" : "nb-btn"}
              onClick={() => setMinutes(m)}
            >
              {m} min
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 font-semibold">How much detail?</p>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(DETAIL_LEVELS) as DetailLevel[]).map((d) => (
            <button
              key={d}
              className={d === detail ? "nb-btn nb-btn-primary" : "nb-btn"}
              onClick={() => setDetail(d)}
            >
              {DETAIL_LEVELS[d].label}
              <span className="block text-xs font-normal opacity-80">{DETAIL_LEVELS[d].hint}</span>
            </button>
          ))}
        </div>
      </div>

      {words > 0 && !tooShort && (
        <p className="rounded-lg border-2 border-ink bg-surface px-4 py-3">
          About <b>{estParts}</b> {estParts === 1 ? "part" : "parts"}, roughly{" "}
          <b>{estParts * minutes} minutes</b> of typing in total.
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-lg border-2 border-ink bg-err px-3 py-2 text-[#111111]">
          {error}{" "}
          {needsLogin && (
            <Link href="/login" className="font-semibold underline underline-offset-4">
              Log in
            </Link>
          )}
        </p>
      )}

      <button className="nb-btn nb-btn-primary" onClick={makePlan} disabled={tooShort || tooLong}>
        Plan my notes
      </button>
    </div>
  );
}