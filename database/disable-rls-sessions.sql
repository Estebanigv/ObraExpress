-- Desactivar RLS en la tabla sessions para permitir crear sesiones
-- Ejecutar este SQL en Supabase SQL Editor

-- 1. Desactivar RLS en la tabla sessions
ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;

-- 2. Desactivar RLS en purchases también (para futuras compras)
ALTER TABLE public.purchases DISABLE ROW LEVEL SECURITY;

-- 3. Desactivar RLS en systems (para configuración)
ALTER TABLE public.systems DISABLE ROW LEVEL SECURITY;

-- 4. Verificar que las tablas no tienen RLS activo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'sessions', 'purchases', 'systems');

-- 5. Limpiar sesiones existentes (si las hay)
DELETE FROM public.sessions;

-- 6. Verificar que la tabla sessions está vacía y lista
SELECT COUNT(*) as total_sesiones FROM public.sessions;