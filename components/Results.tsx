import Link from "next/link";

type Props = {
  wpm: number;
  accuracy: number;
  seconds: number;
  missed: Record<string, number>;
  onAgain: () => void;
  nextHref: string;
};

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg border-2 border-ink px-4 py-3 ${
        highlight ? "bg-pri text-[#111111]" : ""
      }`}
    >
      <span className="block text-sm opacity-80">{label}</span>
      <strong className="font-heading text-3xl">{value}</strong>
    </div>
  );
}

export default function Results({ wpm, accuracy, seconds, missed, onAgain, nextHref }: Props) {
  // The 6 keys you missed most
  const top = Object.entries(missed)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const time = `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

  return (
    <section className="nb-card">
      <h2 className="font-heading text-2xl font-bold">Nice work, session done</h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Speed" value={`${wpm} wpm`} highlight />
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Time" value={time} />
      </div>

      {top.length > 0 ? (
        <div className="mt-6">
          <p className="text-sm text-muted">Keys to practice</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {top.map(([key, count]) => (
              <span
                key={key}
                className="rounded-full border-2 border-ink bg-err px-3 py-0.5 font-mono text-sm text-[#111111]"
              >
                {key === " " ? "space" : key} x{count}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-6 text-muted">No missed keys. Clean run.</p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button className="nb-btn" onClick={onAgain}>
          Type it again
        </button>
        <Link href={nextHref} className="nb-btn nb-btn-primary inline-block">
          Next note
        </Link>
      </div>
    </section>
  );
}