import type { DangerLevel, IssueType, RoomType } from "@/lib/schemas/room-analysis";

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  bagno: "Bagno",
  cucina: "Cucina",
  camera: "Camera da letto",
  soggiorno: "Soggiorno",
  ingresso: "Ingresso",
  corridoio: "Corridoio",
  scale: "Scale",
  garage: "Garage",
  altro: "Altra stanza",
};

export const DANGER_LEVEL_LABELS: Record<DangerLevel, string> = {
  low: "Priorità bassa",
  medium: "Priorità media",
  high: "Priorità alta",
};

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  altezza_interruttori: "Altezza interruttori/prese",
  larghezza_porta: "Larghezza porta",
  gradino: "Gradino o dislivello",
  assenza_maniglione: "Assenza maniglione",
  spazio_manovra: "Spazio di manovra insufficiente",
  pavimento_scivoloso: "Pavimento scivoloso",
  illuminazione_insufficiente: "Illuminazione insufficiente",
  ostacolo_mobile: "Ostacolo mobile",
  ostacolo_fisso: "Ostacolo fisso",
  accesso_vasca_doccia: "Accesso vasca/doccia",
  altro: "Altro ostacolo",
};
