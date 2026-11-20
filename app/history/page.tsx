import Link from "next/link";
import HistoryList from "@/components/HistoryList";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

export default function HistoryPage() {
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

      <h1 className="mt-12 font-heading text-4xl font-bold">Your history</h1>
      <p className="mb-8 mt-2 text-muted">Every session you finished while logged in.</p>

      <HistoryList />
    </main>
  );
}