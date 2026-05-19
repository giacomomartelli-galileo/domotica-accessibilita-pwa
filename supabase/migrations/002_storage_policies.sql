-- Eseguire DOPO aver creato il bucket "room-photos" (privato) dalla dashboard Supabase.

INSERT INTO storage.buckets (id, name, public)
VALUES ('room-photos', 'room-photos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "room_photos_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'room-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "room_photos_select_own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'room-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "room_photos_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'room-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
