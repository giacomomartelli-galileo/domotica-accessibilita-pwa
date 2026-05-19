import { ROOM_TYPE_LABELS } from "@/lib/constants/room-labels";
import type { RoomAnalysis, RoomType } from "@/lib/schemas/room-analysis";

export function getMockRoomAnalysis(roomType: RoomType): RoomAnalysis {
  const label = ROOM_TYPE_LABELS[roomType];
  return {
    summary: `Analisi demo per ${label}: ostacoli di esempio per il prototipo. Con l'API reale i risultati saranno basati sulla foto caricata.`,
    issues: [
      {
        type: "gradino",
        danger_level: "high",
        description:
          "Soglia o gradino all'ingresso della stanza. Rischio per carrozzine e deambulatori.",
        domotic_suggestions: [
          {
            product_name: "Piattaforma elevatrice domestica",
            category: "Motorizzazione accessi",
            installation_notes: "Richiede sopralluogo tecnico.",
          },
        ],
      },
      {
        type: "altezza_interruttori",
        danger_level: "medium",
        description:
          "Interruttori probabilmente troppo alti rispetto alla seduta in carrozzina.",
        domotic_suggestions: [
          {
            product_name: "Pulsante wireless smart + relè luci",
            category: "Illuminazione smart",
            installation_notes: "Montaggio a 90–100 cm dal pavimento.",
          },
        ],
      },
    ],
  };
}
