"use client";

import { useEffect, useRef } from "react";

type Props = {
  text: string;
  pos: number;
  wrong: Set<number>;
  miss: { at: number; n: number };
  done: boolean;
};

export default function TypingArea({ text, pos, wrong, miss, done }: Props) {
  const cursorRef = useRef<HTMLSpanElement>(null); // points at the current character
  const lastTop = useRef(-1); // vertical position of the line we last scrolled to

  useEffect(() => {
    // Back at the start (new session or Esc): return to the top
    if (pos === 0) {
      if (lastTop.current !== -1) window.scrollTo({ top: 0, behavior: "smooth" });
      lastTop.current = -1;
      return;
    }

    const el = cursorRef.current;
    if (!el) return;

    // Only scroll when the cursor reaches a new line
    if (el.offsetTop === lastTop.current) return;
    lastTop.current = el.offsetTop;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
  }, [pos]);

  return (
    <div
      aria-label="Text to type"
      className="max-w-[72ch] select-none whitespace-pre-wrap font-mono text-[clamp(1.05rem,2.6vw,1.4rem)] leading-[1.95] text-muted"
    >
      {text.split("").map((ch, i) => {
        let cls = "";
        if (i < pos) {
          cls = wrong.has(i)
            ? "rounded-[3px] bg-err text-[#111111] underline decoration-wavy decoration-[#111111] underline-offset-4"
            : "text-ink";
        } else if (i === pos && !done) {
          cls = "rounded-[3px] bg-pri text-[#111111] ring-2 ring-ink";
          if (miss.at === i) cls += " miss";
        }
        return (
          <span
            key={i === pos ? `${i}-${miss.n}` : i}
            ref={i === pos ? cursorRef : undefined}
            className={cls}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
}