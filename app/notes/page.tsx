import NotesList from "@/components/NotesList";
import Page from "@/components/Page";

export default function NotesPage() {
  return (
    <Page back={{ href: "/", label: "Back to home" }}>
      <h1 className="font-heading text-4xl font-bold">My notes</h1>
      <p className="mb-8 mt-2 text-muted">Everything you have turned into typing parts.</p>
      <NotesList />
    </Page>
  );
}