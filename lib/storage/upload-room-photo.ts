import { createClient } from "@/lib/supabase/client";

const BUCKET = "room-photos";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export type UploadRoomPhotoResult =
  | { ok: true; storagePath: string; publicUrl: string }
  | { ok: false; error: string };

export async function uploadRoomPhoto(
  file: File,
  roomId: string
): Promise<UploadRoomPhotoResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      ok: false,
      error: "Formato non supportato. Usa JPEG, PNG o WebP.",
    };
  }

  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      error: "L'immagine supera la dimensione massima di 10 MB.",
    };
  }

  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, error: "Devi accedere per caricare una foto." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const storagePath = `${user.id}/${roomId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    return {
      ok: false,
      error: "Caricamento fallito. Verifica la connessione e riprova.",
    };
  }

  // Bucket privato: URL firmato per l'API Vision (validità 1 ora)
  const { data: signedData, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (signError || !signedData?.signedUrl) {
    return {
      ok: false,
      error: "Impossibile ottenere l'URL dell'immagine.",
    };
  }

  return {
    ok: true,
    storagePath,
    publicUrl: signedData.signedUrl,
  };
}
