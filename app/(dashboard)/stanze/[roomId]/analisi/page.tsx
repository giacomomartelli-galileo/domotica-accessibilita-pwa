import { RoomAnalyzer } from "@/components/room-analyzer";

interface AnalisiStanzaPageProps {
  params: Promise<{ roomId: string }>;
}

export default async function AnalisiStanzaPage({ params }: AnalisiStanzaPageProps) {
  const { roomId } = await params;

  return (
    <main id="main-content" className="container py-8">
      <RoomAnalyzer roomId={roomId} />
    </main>
  );
}
