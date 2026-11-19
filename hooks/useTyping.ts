"use client";

import { useEffect, useReducer, useState } from "react";

// strict = you must press the right key to move on
// free   = wrong keys move on too, and you can fix them with Backspace
export type Mode = "strict" | "free";

type State = {
  pos: number; // index of the character you must type next
  wrong: Set<number>; // positions typed wrong (free mode)
  keys: number; // total key presses
  errors: number; // wrong key presses
  missed: Record<string, number>; // how often each expected key was missed
  miss: { at: number; n: number }; // last miss, used to trigger the shake
  startedAt: number | null;
  finishedAt: number | null;
};

const initialState: State = {
  pos: 0,
  wrong: new Set(),
  keys: 0,
  errors: 0,
  missed: {},
  miss: { at: -1, n: 0 },
  startedAt: null,
  finishedAt: null,
};

type Action =
  | { type: "key"; key: string; text: string; mode: Mode; now: number }
  | { type: "backspace"; mode: Mode }
  | { type: "reset" };

// The reducer takes the old state and an action, and returns the NEW state.
// It never changes the old state, which is why we copy the Set before editing.
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "reset":
      return initialState;

    case "backspace": {
      if (action.mode !== "free" || state.pos === 0 || state.finishedAt) return state;
      const wrong = new Set(state.wrong);
      wrong.delete(state.pos - 1);
      return { ...state, pos: state.pos - 1, wrong };
    }

    case "key": {
      if (state.finishedAt) return state;

      const expected = action.text[state.pos];
      const startedAt = state.startedAt ?? action.now; // the clock starts on the first key
      const keys = state.keys + 1;

      // Correct key
      if (action.key === expected) {
        const pos = state.pos + 1;
        return {
          ...state,
          startedAt,
          keys,
          pos,
          finishedAt: pos >= action.text.length ? action.now : null,
        };
      }

      // Wrong key
      const errors = state.errors + 1;
      const missed = { ...state.missed, [expected]: (state.missed[expected] ?? 0) + 1 };

      if (action.mode === "strict") {
        // Stay on the same character and trigger the shake
        return { ...state, startedAt, keys, errors, missed, miss: { at: state.pos, n: state.miss.n + 1 } };
      }

      // Free mode: mark it wrong and move on
      const wrong = new Set(state.wrong);
      wrong.add(state.pos);
      const pos = state.pos + 1;
      return {
        ...state,
        startedAt,
        keys,
        errors,
        missed,
        wrong,
        pos,
        finishedAt: pos >= action.text.length ? action.now : null,
      };
    }
  }
}

export function useTyping(text: string, mode: Mode) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [now, setNow] = useState(0); // current time, refreshed while typing

  // Listen to the keyboard for the whole page
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return; // keep browser shortcuts working
      if (e.key === "Escape") {
        dispatch({ type: "reset" });
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        dispatch({ type: "backspace", mode });
        return;
      }
      if (e.key.length !== 1) return; // ignore Shift, Tab, arrows, etc.
      e.preventDefault(); // stops the space bar from scrolling the page
      const time = Date.now();
      setNow(time);
      dispatch({ type: "key", key: e.key, text, mode, now: time });
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [text, mode]);

  // Refresh the clock 4 times a second so the speed number updates live
  useEffect(() => {
    if (!state.startedAt || state.finishedAt) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [state.startedAt, state.finishedAt]);

  // Stats. Standard rule: 1 "word" = 5 characters.
  const end = state.finishedAt ?? now;
  const minutes = state.startedAt ? Math.max(end - state.startedAt, 0) / 60000 : 0;
  const correctChars = state.pos - state.wrong.size;
  const wpm = minutes > 0.02 ? Math.round(correctChars / 5 / minutes) : 0;
  const accuracy = state.keys
    ? Math.round(((state.keys - state.errors) / state.keys) * 100)
    : 100;
  const seconds =
    state.startedAt && state.finishedAt
      ? Math.round((state.finishedAt - state.startedAt) / 1000)
      : 0;

  return {
    pos: state.pos,
    wrong: state.wrong,
    miss: state.miss,
    missed: state.missed,
    started: state.startedAt !== null,
    finished: state.finishedAt !== null,
    wpm,
    accuracy,
    seconds,
    reset: () => dispatch({ type: "reset" }),
  };
}