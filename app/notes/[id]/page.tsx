import Link from "next/link";
import { Suspense } from "react";
import Logo from "@/components/Logo";
import SetView from "@/components/SetView";
import ThemeToggle from "@/components/ThemeToggle";

type Params = Promise<{ id: string }>;

export default function SetPage({ params }: { params: Params }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/notes" className="nb-btn inline-block">
            Back
          </Link>
          <Logo />
        </div>
        <ThemeToggle />
      </div>

      <Suspense fallback={<p className="mt-12 text-muted">Loading...</p>}>
        <SetContent params={params} />
      </Suspense>
    </main>
  );
}

async function SetContent({ params }: { params: Params }) {
  const { id } = await params;
  return <SetView setId={id} />;
}