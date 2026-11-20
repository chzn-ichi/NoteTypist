import { Suspense } from "react";
import PartTyper from "@/components/PartTyper";

type Params = Promise<{ id: string; position: string }>;

export default function PartPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<p className="p-10 text-muted">Loading...</p>}>
      <PartContent params={params} />
    </Suspense>
  );
}

async function PartContent({ params }: { params: Params }) {
  const { id, position } = await params;
  return <PartTyper setId={id} position={Number(position)} />;
}