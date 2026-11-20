import Link from "next/link";
import Page from "@/components/Page";

export default function LibraryPage() {
  return (
    <Page back={{ href: "/", label: "Back to home" }}>
      <h1 className="font-heading text-4xl font-bold">Public library</h1>
      <p className="mb-8 mt-2 text-muted">Notes that other students chose to share.</p>

      <div className="nb-card">
        <h2 className="font-heading text-xl font-bold">Coming soon</h2>
        <p className="mt-2 text-muted">
          Soon you will be able to browse notes shared by other students and type them, or share
          your own. In the meantime, you can turn your own material into notes.
        </p>
        <Link href="/new" className="nb-btn nb-btn-primary mt-5">
          Create notes
        </Link>
      </div>
    </Page>
  );
}