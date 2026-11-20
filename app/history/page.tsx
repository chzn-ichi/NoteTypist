import HistoryList from "@/components/HistoryList";
import Page from "@/components/Page";

export default function HistoryPage() {
  return (
    <Page back={{ href: "/", label: "Back to home" }}>
      <h1 className="font-heading text-4xl font-bold">Your history</h1>
      <p className="mb-8 mt-2 text-muted">Every session you finished while logged in.</p>
      <HistoryList />
    </Page>
  );
}