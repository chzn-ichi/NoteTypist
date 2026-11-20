// Anything outside this list counts as "special"
const SPECIAL = /[^A-Za-z0-9 .,;:!?'"()\-\/%&+=$@#\s]/;
const DISALLOWED = /[^A-Za-z0-9\s.,;:!?'"()\-\/%&+=$@#]/g;

// Swaps fancy characters for keyboard ones, before we strip whatever is left
const REPLACEMENTS: [RegExp, string][] = [
  [/[\u2018\u2019\u201A\u2032]/g, "'"], // curly single quotes
  [/[\u201C\u201D\u201E\u2033]/g, '"'], // curly double quotes
  [/\u2014/g, " - "], // em dash
  [/[\u2013\u2212]/g, "-"], // en dash, minus sign
  [/\u2026/g, "..."], // ellipsis
  [/[\u00A0\u2002\u2003\u2009\u200B]/g, " "], // odd spaces
  [/[\u2192\u21D2]/g, " to "], // arrows
  [/\u00D7/g, " x "],
  [/\u00F7/g, " divided by "],
  [/\u00B0/g, " degrees"],
  [/\u2264/g, " at most "],
  [/\u2265/g, " at least "],
  [/\u2260/g, " is not equal to "],
  [/[\u2022\u25CF\u25AA\u25E6\u25A0\u25A1]/g, ""], // bullet symbols
];

export function makeTypeable(raw: string): { text: string; cleaned: boolean } {
  const cleaned = SPECIAL.test(raw);

  let t = raw;
  for (const [pattern, replacement] of REPLACEMENTS) t = t.replace(pattern, replacement);

  t = t
    .replace(/^\s*#{1,6}\s+/gm, "") // markdown headings
    .replace(/^\s*(?:[-*+]|\d+[.)])\s+/gm, "") // list markers at the start of a line
    .replace(/\*\*|__|`/g, "") // bold and code marks
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents: e with an accent becomes e
    .replace(DISALLOWED, "") // anything else off the keyboard
    .replace(/\s+/g, " ") // newlines and double spaces become single spaces
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();

  return { text: t, cleaned };
}