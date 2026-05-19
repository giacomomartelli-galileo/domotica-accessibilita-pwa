import type { RoomAnalysis } from "@/lib/schemas/room-analysis";
import { createClient } from "@/lib/supabase/server";

/**
 * Salva l'esito dell'analisi AI nelle tabelle accessibility_issues e domotic_suggestions.
 * Chiamare dalla route API o da una Server Action dopo generateObject.
 */
export async function persistRoomAnalysis(
  roomId: string,
  photoId: string | null,
  analysis: RoomAnalysis
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();

  for (const issue of analysis.issues) {
    const { data: insertedIssue, error: issueError } = await supabase
      .from("accessibility_issues")
      .insert({
        room_id: roomId,
        photo_id: photoId,
        type: issue.type,
        danger_level: issue.danger_level,
        description: issue.description,
      })
      .select("id")
      .single();

    if (issueError || !insertedIssue) {
      return {
        ok: false,
        error: issueError?.message ?? "Impossibile salvare l'ostacolo.",
      };
    }

    const suggestions = issue.domotic_suggestions.map((s) => ({
      issue_id: insertedIssue.id,
      product_name: s.product_name,
      category: s.category,
      installation_notes: s.installation_notes ?? null,
    }));

    const { error: suggestionsError } = await supabase
      .from("domotic_suggestions")
      .insert(suggestions);

    if (suggestionsError) {
      return {
        ok: false,
        error: suggestionsError.message,
      };
    }
  }

  return { ok: true };
}
