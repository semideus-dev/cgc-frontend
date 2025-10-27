import CanvasDetailsView from "@/modules/canvas/ui/views/canvas-details-view";

export default async function CanvasDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CanvasDetailsView canvasId={id} />;
}
