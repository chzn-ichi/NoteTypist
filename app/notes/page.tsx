import Link from "next/link";
import Logo from "@/components/Logo";
import NotesList from "@/components/NotesList";
import ThemeToggle from "@/components/ThemeToggle";

export default function NotesPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="nb-btn inline-block">
            Back
          </Link>
          <Logo />
        </div>
        <ThemeToggle />
      </div>

      <div className="mb-8 mt-12 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-heading text-4xl font-bold">My notes</h1>
        <Link href="/new" className="nb-btn nb-btn-primary inline-block">
          Create notes
        </Link>
      </div>

      <NotesList />
    </main>
  );
}