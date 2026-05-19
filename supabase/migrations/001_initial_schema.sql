-- =============================================================================
-- Schema: PWA Abbattimento Barriere Architettoniche + Domotica Assistiva
-- Eseguire in Supabase SQL Editor o via CLI: supabase db push
-- =============================================================================

-- Tipi enum
CREATE TYPE public.room_type AS ENUM (
  'bagno',
  'cucina',
  'camera',
  'soggiorno',
  'ingresso',
  'corridoio',
  'scale',
  'garage',
  'altro'
);

CREATE TYPE public.danger_level AS ENUM ('low', 'medium', 'high');

CREATE TYPE public.issue_type AS ENUM (
  'altezza_interruttori',
  'larghezza_porta',
  'gradino',
  'assenza_maniglione',
  'spazio_manovra',
  'pavimento_scivoloso',
  'illuminazione_insufficiente',
  'ostacolo_mobile',
  'ostacolo_fisso',
  'accesso_vasca_doccia',
  'altro'
);

-- -----------------------------------------------------------------------------
-- Tabelle
-- -----------------------------------------------------------------------------

CREATE TABLE public.houses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name        TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.rooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id    UUID NOT NULL REFERENCES public.houses (id) ON DELETE CASCADE,
  name        TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  type        public.room_type NOT NULL DEFAULT 'altro',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.room_photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id      UUID NOT NULL REFERENCES public.rooms (id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  storage_url  TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.accessibility_issues (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id       UUID NOT NULL REFERENCES public.rooms (id) ON DELETE CASCADE,
  photo_id      UUID REFERENCES public.room_photos (id) ON DELETE SET NULL,
  type          public.issue_type NOT NULL,
  danger_level  public.danger_level NOT NULL,
  description   TEXT NOT NULL CHECK (char_length(trim(description)) > 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.domotic_suggestions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id            UUID NOT NULL REFERENCES public.accessibility_issues (id) ON DELETE CASCADE,
  product_name        TEXT NOT NULL CHECK (char_length(trim(product_name)) > 0),
  category            TEXT NOT NULL CHECK (char_length(trim(category)) > 0),
  installation_notes  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indici per query frequenti
CREATE INDEX idx_houses_user_id ON public.houses (user_id);
CREATE INDEX idx_rooms_house_id ON public.rooms (house_id);
CREATE INDEX idx_room_photos_room_id ON public.room_photos (room_id);
CREATE INDEX idx_accessibility_issues_room_id ON public.accessibility_issues (room_id);
CREATE INDEX idx_domotic_suggestions_issue_id ON public.domotic_suggestions (issue_id);

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessibility_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domotic_suggestions ENABLE ROW LEVEL SECURITY;

-- houses: solo il proprietario
CREATE POLICY "houses_select_own"
  ON public.houses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "houses_insert_own"
  ON public.houses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "houses_update_own"
  ON public.houses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "houses_delete_own"
  ON public.houses FOR DELETE
  USING (auth.uid() = user_id);

-- rooms: tramite house del proprietario
CREATE POLICY "rooms_select_own"
  ON public.rooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.houses h
      WHERE h.id = rooms.house_id AND h.user_id = auth.uid()
    )
  );

CREATE POLICY "rooms_insert_own"
  ON public.rooms FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.houses h
      WHERE h.id = house_id AND h.user_id = auth.uid()
    )
  );

CREATE POLICY "rooms_update_own"
  ON public.rooms FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.houses h
      WHERE h.id = rooms.house_id AND h.user_id = auth.uid()
    )
  );

CREATE POLICY "rooms_delete_own"
  ON public.rooms FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.houses h
      WHERE h.id = rooms.house_id AND h.user_id = auth.uid()
    )
  );

-- room_photos
CREATE POLICY "room_photos_select_own"
  ON public.room_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.houses h ON h.id = r.house_id
      WHERE r.id = room_photos.room_id AND h.user_id = auth.uid()
    )
  );

CREATE POLICY "room_photos_insert_own"
  ON public.room_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.houses h ON h.id = r.house_id
      WHERE r.id = room_id AND h.user_id = auth.uid()
    )
  );

CREATE POLICY "room_photos_delete_own"
  ON public.room_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.houses h ON h.id = r.house_id
      WHERE r.id = room_photos.room_id AND h.user_id = auth.uid()
    )
  );

-- accessibility_issues
CREATE POLICY "accessibility_issues_select_own"
  ON public.accessibility_issues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.houses h ON h.id = r.house_id
      WHERE r.id = accessibility_issues.room_id AND h.user_id = auth.uid()
    )
  );

CREATE POLICY "accessibility_issues_insert_own"
  ON public.accessibility_issues FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.houses h ON h.id = r.house_id
      WHERE r.id = room_id AND h.user_id = auth.uid()
    )
  );

CREATE POLICY "accessibility_issues_delete_own"
  ON public.accessibility_issues FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.houses h ON h.id = r.house_id
      WHERE r.id = accessibility_issues.room_id AND h.user_id = auth.uid()
    )
  );

-- domotic_suggestions (via issue -> room -> house)
CREATE POLICY "domotic_suggestions_select_own"
  ON public.domotic_suggestions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.accessibility_issues ai
      JOIN public.rooms r ON r.id = ai.room_id
      JOIN public.houses h ON h.id = r.house_id
      WHERE ai.id = domotic_suggestions.issue_id AND h.user_id = auth.uid()
    )
  );

CREATE POLICY "domotic_suggestions_insert_own"
  ON public.domotic_suggestions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accessibility_issues ai
      JOIN public.rooms r ON r.id = ai.room_id
      JOIN public.houses h ON h.id = r.house_id
      WHERE ai.id = issue_id AND h.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- Storage bucket per foto stanze (policy RLS su storage.objects)
-- Creare il bucket "room-photos" dalla dashboard Supabase (privato).
-- -----------------------------------------------------------------------------

-- Esempio policy (eseguire dopo creazione bucket):
--
-- CREATE POLICY "room_photos_upload_own"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'room-photos'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );
--
-- CREATE POLICY "room_photos_read_own"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'room-photos'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );
