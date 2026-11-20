import Link from "next/link";
import { Suspense } from "react";
import Page from "@/components/Page";
import SetView from "@/components/SetView";

type Params = Promise<{ id: string }>;

export default function SetPage({ params }: { params: Params }) {
  return (
    <Page>
      <Link href="/notes" className="nb-link">
        Back to My notes
      </Link>

      <Suspense fallback={<p className="mt-8 text-muted">Loading...</p>}>
        <SetContent params={params} />
      </Suspense>
    </Page>
  );
}

async function SetContent({ params }: { params: Params }) {
  const { id } = await params;
  return <SetView setId={id} />;
}