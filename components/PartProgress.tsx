import Link from "next/link";

export type Segment = { href: string; title: string; done: boolean };

export default function PartProgress({
  segments,
  currentIndex = -1,
}: {
  segments: Segment[];
  currentIndex?: number;
}) {
  return (
    <nav aria-label="Parts" className="flex gap-1.5">
      {segments.map((s, i) => (
        <Link
          key={s.href}
          href={s.href}
          title={`Part ${i + 1}: ${s.title}`}
          aria-label={`Part ${i + 1}: ${s.title}${s.done ? ", typed" : ""}`}
          aria-current={i === currentIndex ? "step" : undefined}
          className={`block h-3 flex-1 rounded-full border-2 border-ink transition-colors ${
            s.done ? "bg-ok" : i === currentIndex ? "bg-pri" : "bg-muted/25"
          } ${i === currentIndex ? "ring-2 ring-acc ring-offset-2 ring-offset-paper" : ""}`}
        />
      ))}
    </nav>
  );
}