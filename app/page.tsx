import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { SAMPLE_NOTES } from "@/lib/samples";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <AuthButton />
          <ThemeToggle />
        </div>
      </div>

      <h1 className="mt-16 font-heading text-4xl font-bold leading-tight sm:text-5xl">
        Type your notes. Learn them while you practice.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Upload your study material, get short typeable notes, and build your
        typing speed on the things you actually need to remember.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/type/${SAMPLE_NOTES[0].id}`} className="nb-btn nb-btn-primary inline-block">
          Start typing
        </Link>
        <button className="nb-btn">Browse the library</button>
      </div>

      <section className="mt-14 grid gap-5 sm:grid-cols-2">
        {SAMPLE_NOTES.map((note) => (
          <Link key={note.id} href={`/type/${note.id}`}>
            <article className="nb-card h-full">
              <h2 className="font-heading text-lg font-bold">{note.title}</h2>
              <p className="mt-2 text-sm text-muted">
                {note.text.split(" ").length} words
              </p>
            </article>
          </Link>
        ))}
      </section>
    </main>
  );
}