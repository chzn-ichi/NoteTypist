export const DEFAULT_WPM = 40; // later we will use each user's measured speed
export const MIN_CHARS = 200;
export const MAX_CHARS = 30000;
export const MAX_PARTS = 20;
export const MINUTE_OPTIONS = [3, 5, 10] as const;

// ratio = how much of the original the notes keep, measured in words
export const DETAIL_LEVELS = {
  brief: { label: "Brief", ratio: 0.25, hint: "Key ideas only" },
  standard: { label: "Standard", ratio: 0.5, hint: "A balanced summary" },
  thorough: { label: "Thorough", ratio: 0.8, hint: "Almost everything" },
} as const;

export type DetailLevel = keyof typeof DETAIL_LEVELS;

// How many parts will we make?
export function estimateParts(sourceWords: number, minutes: number, detail: DetailLevel) {
  const wordsPerPart = DEFAULT_WPM * minutes;
  const parts = Math.round((sourceWords * DETAIL_LEVELS[detail].ratio) / wordsPerPart);
  return Math.min(MAX_PARTS, Math.max(1, parts));
}