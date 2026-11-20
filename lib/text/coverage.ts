import type { NotesCoverage } from "@/lib/notes/types";

const STOP = new Set([
  "the", "and", "for", "with", "that", "this", "from", "are", "was", "were", "has", "have",
  "its", "their", "into", "than", "then", "also", "such", "used", "uses", "using", "can",
  "may", "any", "all", "each", "both", "not", "but", "one", "two", "more", "most", "very",
  "which", "what", "when", "where", "who", "how", "why", "other", "some", "over", "under",
]);

// Crude plural handling so "keys" matches "key"
function stem(w: string) {
  return w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w;
}

function words(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(stem);
}

export function checkCoverage(notes: string, keyItems: string[]): NotesCoverage {
  const inNotes = new Set(words(notes));
  const missing: string[] = [];
  let covered = 0;

  for (const item of keyItems) {
    const important = words(item).filter((w) => w.length > 2 && !STOP.has(w));
    if (important.length === 0) {
      covered++;
      continue;
    }
    const found = important.filter((w) => inNotes.has(w)).length;
    if (found / important.length >= 0.6) covered++;
    else missing.push(item);
  }

  return { covered, total: keyItems.length, missing };
}