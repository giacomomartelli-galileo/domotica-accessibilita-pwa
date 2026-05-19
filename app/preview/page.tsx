import { RoomAnalyzer } from "@/components/room-analyzer";

const DEMO_ROOM_ID = "00000000-0000-4000-8000-000000000001";

export default function PreviewPage() {
  return (
    <main id="main-content" className="container py-8">
      <RoomAnalyzer roomId={DEMO_ROOM_ID} roomName="Demo" demoMode />
    </main>
  );
}
