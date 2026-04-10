-- ============================================================
--  ZAIRO FILMS — Fix política RLS de movie_secure
--
--  Problema: movie_secure_select_purchasers solo permite leer
--  el video_url a usuarios con compra. Pero el diseño es:
--    - free (logueado, sin compra) → ve la peli con anuncios
--    - watch/download (con compra) → ve la peli sin anuncios
--  Ambos usan la misma URL, la diferencia es UX (ads overlay).
--
--  Solución: reemplazar la política restrictiva por una que
--  permita leer a cualquier usuario autenticado.
-- ============================================================

-- Eliminar la política vieja que requería una compra previa
drop policy if exists "movie_secure_select_purchasers" on public.movie_secure;

-- Nueva política: cualquier usuario logueado puede leer el video_url
create policy "movie_secure_select_authenticated"
  on public.movie_secure for select
  using (auth.uid() is not null);
