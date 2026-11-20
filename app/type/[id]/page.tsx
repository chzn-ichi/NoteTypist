import { notFound } from "next/navigation";
import TypingSession from "@/components/TypingSession";
import { SAMPLE_NOTES } from "@/lib/samples";

export function generateStaticParams() {
  return SAMPLE_NOTES.map((note) => ({ id: note.id }));
}

export default async function TypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const index = SAMPLE_NOTES.findIndex((n) => n.id === id);
  if (index === -1) notFound();

  const note = SAMPLE_NOTES[index];
  const next = SAMPLE_NOTES[(index + 1) % SAMPLE_NOTES.length];

  return (
    <TypingSession key={note.id} note={note} backHref="/" nextHref={`/type/${next.id}`} />
  );
}