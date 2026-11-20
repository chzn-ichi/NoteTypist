import { NextResponse } from "next/server";
import { generateText } from "@/lib/ai/gemini";
import { buildPlan, buildPlanPrompt, parseAiPlan, PLAN_SYSTEM_PROMPT } from "@/lib/ai/plan";
import {
  DETAIL_LEVELS,
  estimateParts,
  MAX_CHARS,
  MIN_CHARS,
  MINUTE_OPTIONS,
  type DetailLevel,
} from "@/lib/notes/config";
import { createClient } from "@/lib/supabase/server";
import { chunkText, cleanText, countWords } from "@/lib/text/prepare";

function fail(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  // 1. Only logged-in users can use the AI
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return fail("Please log in to plan your notes.", 401);

  // 2. Read and check what the browser sent
  let body: { text?: unknown; minutes?: unknown; detail?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.", 400);
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const minutes = Number(body.minutes);
  const detail = body.detail as DetailLevel;

  if (text.length < MIN_CHARS) return fail(`Please add at least ${MIN_CHARS} characters of text.`, 400);
  if (text.length > MAX_CHARS) return fail(`That is too long for now. The limit is ${MAX_CHARS} characters.`, 400);
  if (!(MINUTE_OPTIONS as readonly number[]).includes(minutes)) return fail("Choose 3, 5, or 10 minutes per part.", 400);
  if (typeof detail !== "string" || !(detail in DETAIL_LEVELS)) return fail("Choose a detail level.", 400);

  // 3. Clean, cut into chunks, and decide how many parts we want
  const cleaned = cleanText(text);
  const chunks = chunkText(cleaned);
  const wanted = Math.min(estimateParts(countWords(cleaned), minutes, detail), chunks.length);

  // 4. Ask the AI for an outline
  try {
    const raw = await generateText({
      system: PLAN_SYSTEM_PROMPT,
      prompt: buildPlanPrompt(chunks, wanted),
      json: true,
    });

    let ai = null;
    try {
      ai = parseAiPlan(raw);
    } catch (e) {
      console.error("Plan answer was not valid, using an even split instead:", e);
    }

    return NextResponse.json({ plan: buildPlan(ai, chunks, wanted), chunks });
  } catch (err) {
    console.error("Planning failed:", err);
    const status = (err as { status?: number }).status;
    if (status === 429) {
      return fail("The AI is busy or the free limit was reached. Try again in a minute.", 429);
    }
    return fail("Could not plan your notes. Please try again.", 502);
  }
}