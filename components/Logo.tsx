export default function Logo() {
  return (
    <div className="flex items-center gap-2.5 font-heading text-2xl font-bold tracking-tight">
      <span
        aria-hidden="true"
        className="h-6 w-3.5 rounded-[3px] border-2 border-ink bg-pri"
        style={{ animation: "blink 1.1s steps(1) infinite" }}
      />
      NoteTypist
    </div>
  );
}