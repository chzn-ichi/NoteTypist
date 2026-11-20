import NewNotes from "@/components/NewNotes";
import Page from "@/components/Page";

export default function NewPage() {
  return (
    <Page back={{ href: "/", label: "Back to home" }}>
      <h1 className="font-heading text-4xl font-bold">Create notes</h1>
      <p className="mb-8 mt-2 text-muted">
        Paste your material and choose how much time you want to spend.
      </p>
      <NewNotes />
    </Page>
  );
}