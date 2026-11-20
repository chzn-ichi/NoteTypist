export type PlanPart = {
  id: string;
  title: string;
  fromChunk: number;
  toChunk: number;
  keyItems: string[];
  sourceWords: number;
};

export type Plan = {
  title: string;
  parts: PlanPart[];
  sourceWords: number;
  chunkCount: number;
};

// A part that is ready to be written, with its slice of the source text
export type WritePart = {
  id: string;
  title: string;
  keyItems: string[];
  sourceWords: number;
  source: string;
};

export type NotesCoverage = {
  covered: number;
  total: number;
  missing: string[];
};

export type PartNotes = {
  notes: string;
  words: number;
  targetWords: number;
  coverage: NotesCoverage;
  cleaned: boolean; // true if we had to replace special characters
};