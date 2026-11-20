import Link from "next/link";
import Page from "@/components/Page";
import { SAMPLE_NOTES } from "@/lib/samples";

export default function Home() {
  return (
    <Page wide>
      <section className="pt-8 sm:pt-14">
        <h1 className="max-w-3xl font-heading text-4xl font-bold leading-tight sm:text-6xl">
          Type your notes. Learn them while you practice.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted">
          Upload your study material, get short typeable notes, and build your typing speed on
          the things you actually need to remember.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
          <Link href="/new" className="nb-btn nb-btn-primary px-6 py-3 text-base">
            Create notes from my document
          </Link>
          <Link href="/library" className="nb-link">
            Public library
          </Link>
        </div>
      </section>

      <section className="mt-20">
        <h2 className="font-heading text-xl font-bold">Samples to try</h2>
        <p className="mt-1 text-sm text-muted">Short notes for testing the typing screen.</p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SAMPLE_NOTES.map((note) => (
            <Link key={note.id} href={`/type/${note.id}`}>
              <article className="nb-card h-full">
                <h3 className="font-heading text-lg font-bold">{note.title}</h3>
                <p className="mt-2 text-sm text-muted">{note.text.split(" ").length} words</p>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </Page>
  );
}