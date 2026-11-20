import { NextResponse } from "next/server";
import { generateText } from "@/lib/ai/gemini";
import { buildPartPrompt, buildRepairPrompt, NOTES_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { DEFAULT_WPM, MAX_CHARS, MINUTE_OPTIONS } from "@/lib/notes/config";
import { createClient } from "@/lib/supabase/server";
import { checkCoverage } from "@/lib/text/coverage";
import { countWords } from "@/lib/text/prepare";
import { makeTypeable } from "@/lib/text/typeable";

function fail(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  // 1. Only logged-in users can use the AI
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return fail("Please log in to generate notes.", 401);

  // 2. Read and check what the browser sent
  let body: { source?: unknown; title?: unknown; keyItems?: unknown; minutes?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.", 400);
  }

  const source = typeof body.source === "string" ? body.source.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
  const keyItems = Array.isArray(body.keyItems)
    ? body.keyItems
        .filter((k): k is string => typeof k === "string")
        .map((k) => k.trim().slice(0, 160))
        .filter(Boolean)
        .slice(0, 30)
    : [];
  const minutes = Number(body.minutes);

  if (source.length < 50) return fail("This part has too little text.", 400);
  if (source.length > MAX_CHARS) return fail("This part is too long.", 400);
  if (!(MINUTE_OPTIONS as readonly number[]).includes(minutes)) {
    return fail("Choose 3, 5, or 10 minutes per part.", 400);
  }

  // 3. Target length = typing speed x minutes, but never much longer than the source itself
  const sourceWords = countWords(source);
  const targetWords = Math.min(DEFAULT_WPM * minutes, Math.max(40, Math.round(sourceWords * 0.9)));

  // 4. Write, clean, check coverage, and repair once if needed
  try {
    const first = makeTypeable(
      await generateText({
        system: NOTES_SYSTEM_PROMPT,
        prompt: buildPartPrompt({ title, source, keyItems, targetWords }),
      })
    );
    let text = first.text;
    let cleaned = first.cleaned;
    let coverage = checkCoverage(text, keyItems);

    if (coverage.total > 0 && coverage.covered / coverage.total < 0.85) {
      const second = makeTypeable(
        await generateText({
          system: NOTES_SYSTEM_PROMPT,
          prompt: buildRepairPrompt({
            source,
            notes: text,
            missing: coverage.missing,
            maxWords: Math.round(targetWords * 1.2),
          }),
        })
      );
      const secondCoverage = checkCoverage(second.text, keyItems);
      if (secondCoverage.covered >= coverage.covered) {
        text = second.text;
        cleaned = cleaned || second.cleaned;
        coverage = secondCoverage;
      }
    }

    if (!text) return fail("The AI returned empty notes. Please try again.", 502);

    return NextResponse.json({
      notes: text,
      words: countWords(text),
      targetWords,
      coverage,
      cleaned,
    });
  } catch (err) {
    console.error("Writing notes failed:", err);
    const status = (err as { status?: number }).status;
    if (status === 429) {
      return fail("The AI is busy or the free limit was reached. Wait a minute, then continue.", 429);
    }
    return fail("Could not write this part. Please try again.", 502);
  }
}