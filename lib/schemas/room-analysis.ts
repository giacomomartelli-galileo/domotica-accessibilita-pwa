import { z } from "zod";

export const roomTypeSchema = z.enum([
  "bagno",
  "cucina",
  "camera",
  "soggiorno",
  "ingresso",
  "corridoio",
  "scale",
  "garage",
  "altro",
]);

export const dangerLevelSchema = z.enum(["low", "medium", "high"]);

export const issueTypeSchema = z.enum([
  "altezza_interruttori",
  "larghezza_porta",
  "gradino",
  "assenza_maniglione",
  "spazio_manovra",
  "pavimento_scivoloso",
  "illuminazione_insufficiente",
  "ostacolo_mobile",
  "ostacolo_fisso",
  "accesso_vasca_doccia",
  "altro",
]);

export const domoticSuggestionSchema = z.object({
  product_name: z
    .string()
    .describe("Nome commerciale o tipo di dispositivo domotico consigliato"),
  category: z
    .string()
    .describe(
      "Categoria: es. illuminazione smart, motorizzazione tapparelle, sensori caduta, campanello video"
    ),
  installation_notes: z
    .string()
    .optional()
    .describe("Note per l'installatore: posizione, cablaggio, requisiti"),
});

export const accessibilityIssueSchema = z.object({
  type: issueTypeSchema.describe("Tipologia di ostacolo rilevato"),
  danger_level: dangerLevelSchema.describe(
    "Gravità: low = miglioramento consigliato, medium = barriera significativa, high = rischio sicurezza"
  ),
  description: z
    .string()
    .describe(
      "Descrizione accessibile dell'ostacolo, con riferimenti visibili nella foto"
    ),
  domotic_suggestions: z
    .array(domoticSuggestionSchema)
    .min(1)
    .describe("Almeno una soluzione domotica per questo ostacolo"),
});

/** Schema di output per generateObject — allineato alle tabelle DB */
export const roomAnalysisSchema = z.object({
  summary: z
    .string()
    .describe(
      "Sintesi in italiano chiaro per famiglia e installatore (2-4 frasi)"
    ),
  issues: z
    .array(accessibilityIssueSchema)
    .describe("Elenco ostacoli rilevati nella stanza"),
});

export const analyzeRoomRequestSchema = z.object({
  imageUrl: z.string().url("URL immagine non valido").optional(),
  roomType: roomTypeSchema,
  roomId: z.string().uuid().optional(),
  demo: z.boolean().optional(),
});

export type RoomType = z.infer<typeof roomTypeSchema>;
export type DangerLevel = z.infer<typeof dangerLevelSchema>;
export type IssueType = z.infer<typeof issueTypeSchema>;
export type DomoticSuggestion = z.infer<typeof domoticSuggestionSchema>;
export type AccessibilityIssue = z.infer<typeof accessibilityIssueSchema>;
export type RoomAnalysis = z.infer<typeof roomAnalysisSchema>;
export type AnalyzeRoomRequest = z.infer<typeof analyzeRoomRequestSchema>;
