
-- ============================================================
-- Migration: Admin bootstrap + email-based user management
-- ============================================================
-- Fixes:
-- 1. No way to create the first admin (chicken-and-egg)
-- 2. UserManagement can't identify users by email
-- 3. Publishing news fails because no admin exists

-- ----------------------------------------------------------------
-- FUNCTION: has_any_admin()
-- Safe to call by anyone (anon + authenticated).
-- Returns TRUE if at least one admin exists in the system.
-- Used to decide whether to show the bootstrap setup UI.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_any_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
$$;

GRANT EXECUTE ON FUNCTION public.has_any_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.has_any_admin() TO authenticated;

-- ----------------------------------------------------------------
-- FUNCTION: bootstrap_first_admin()
-- Promotes the calling authenticated user to admin.
-- Only works when ZERO admins exist in the system (one-time use).
-- After an admin exists, this function returns an error JSON.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count INT;
  caller_id   UUID;
BEGIN
  caller_id := auth.uid();

  IF caller_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Debes iniciar sesión primero.'
    );
  END IF;

  -- Count existing admins
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE role = 'admin';

  IF admin_count > 0 THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Ya existe al menos un administrador en el sistema. Contacta a un administrador para obtener permisos.'
    );
  END IF;

  -- Promote the caller: update existing 'user' row to 'admin'
  UPDATE public.user_roles
  SET role = 'admin'
  WHERE user_id = caller_id;

  -- Safety: if the trigger-created row wasn't found, insert one
  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (caller_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', '¡Ahora sos administrador! La página se va a recargar.'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin() TO authenticated;

-- ----------------------------------------------------------------
-- FUNCTION: get_users_with_email()
-- Returns all registered users with email + current role.
-- Admin-only: raises an error for non-admins.
-- Uses SECURITY DEFINER to read auth.users (bypasses RLS).
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_users_with_email()
RETURNS TABLE(
  id           UUID,
  nombre       TEXT,
  email        TEXT,
  created_at   TIMESTAMPTZ,
  role         TEXT,
  role_row_id  UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Access guard: only admins can call this function
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acceso denegado: se requiere rol de administrador.';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.nombre,
    u.email::TEXT,
    p.created_at,
    COALESCE(ur.role::TEXT, 'user'),
    ur.id AS role_row_id
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  LEFT JOIN public.user_roles ur ON ur.user_id = p.id
  ORDER BY p.created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_users_with_email() TO authenticated;
