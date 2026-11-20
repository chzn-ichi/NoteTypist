import { notFound } from "next/navigation";
import { Suspense } from "react";
import TypingSession from "@/components/TypingSession";
import { SAMPLE_NOTES } from "@/lib/samples";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return SAMPLE_NOTES.map((note) => ({ id: note.id }));
}

export default function TypePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<p className="p-10 text-muted">Loading...</p>}>
      <TypeContent params={params} />
    </Suspense>
  );
}

async function TypeContent({ params }: { params: Params }) {
  const { id } = await params;
  const index = SAMPLE_NOTES.findIndex((n) => n.id === id);
  if (index === -1) notFound();

  const note = SAMPLE_NOTES[index];
  const next = SAMPLE_NOTES[(index + 1) % SAMPLE_NOTES.length];

  return (
    <TypingSession key={note.id} note={note} backHref="/" nextHref={`/type/${next.id}`} />
  );
}