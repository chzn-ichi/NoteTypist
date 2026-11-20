import Link from "next/link";
import Logo from "@/components/Logo";
import NewNotes from "@/components/NewNotes";
import ThemeToggle from "@/components/ThemeToggle";

export default function NewPage() {
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

      <h1 className="mt-12 font-heading text-4xl font-bold">Create notes</h1>
      <p className="mb-8 mt-2 text-muted">
        Paste your material and choose how much time you want to spend.
      </p>

      <NewNotes />
    </main>
  );
}