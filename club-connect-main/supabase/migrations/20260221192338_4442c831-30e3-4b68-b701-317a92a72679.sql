
-- Create publicaciones table
CREATE TABLE public.publicaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT NOT NULL,
  imagen_url TEXT,
  video_url TEXT,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE public.publicaciones ENABLE ROW LEVEL SECURITY;

-- Everyone can read
CREATE POLICY "Anyone can read publicaciones"
ON public.publicaciones FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert publicaciones"
ON public.publicaciones FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update
CREATE POLICY "Admins can update publicaciones"
ON public.publicaciones FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete publicaciones"
ON public.publicaciones FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('publicaciones', 'publicaciones', true);

-- Anyone can view images
CREATE POLICY "Public read access on publicaciones bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'publicaciones');

-- Admins can upload
CREATE POLICY "Admins can upload to publicaciones bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'publicaciones' AND public.has_role(auth.uid(), 'admin'));

-- Admins can delete
CREATE POLICY "Admins can delete from publicaciones bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'publicaciones' AND public.has_role(auth.uid(), 'admin'));
