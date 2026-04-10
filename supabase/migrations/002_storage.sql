-- Bucket público para posters de películas
INSERT INTO storage.buckets (id, name, public)
VALUES ('posters', 'posters', true)
ON CONFLICT (id) DO NOTHING;

-- Cualquier persona puede ver los posters (son públicos)
CREATE POLICY "Posters son públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'posters');

-- Solo usuarios autenticados pueden subir/actualizar/borrar
CREATE POLICY "Admins pueden subir posters"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'posters' AND auth.role() = 'authenticated');

CREATE POLICY "Admins pueden actualizar posters"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'posters' AND auth.role() = 'authenticated');

CREATE POLICY "Admins pueden borrar posters"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'posters' AND auth.role() = 'authenticated');
