
-- Allow authenticated users to read all profile names (needed for comment author display)
DROP POLICY "Users can view their own profile" ON public.profiles;

CREATE POLICY "Anyone can view profiles"
ON public.profiles FOR SELECT USING (true);
