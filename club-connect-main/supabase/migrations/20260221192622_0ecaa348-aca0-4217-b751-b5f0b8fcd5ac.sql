
-- Allow unauthenticated users to read publicaciones too
DROP POLICY "Anyone can read publicaciones" ON public.publicaciones;
CREATE POLICY "Anyone can read publicaciones"
ON public.publicaciones FOR SELECT
USING (true);
