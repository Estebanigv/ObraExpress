-- Desactivar temporalmente RLS y crear usuario admin
-- Ejecutar este SQL en Supabase SQL Editor

-- 1. Desactivar RLS temporalmente en la tabla users
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar cualquier usuario admin existente
DELETE FROM public.users WHERE email = 'polimax.store';

-- 3. Crear usuario admin
INSERT INTO public.users (
    email, 
    password_hash, 
    nombre, 
    telefono, 
    compras_realizadas, 
    total_comprado, 
    tiene_descuento, 
    porcentaje_descuento, 
    provider
) VALUES (
    'polimax.store',
    'cG9saW1heDIwMjUkJHBvbGltYXhfc2FsdF8yMDI1',
    'Polimax.store',
    '+56 9 0000 0000',
    0,
    0,
    true,
    100,
    'email'
);

-- 4. Verificar que se creó correctamente
SELECT 
    id,
    email, 
    password_hash, 
    nombre,
    tiene_descuento,
    porcentaje_descuento,
    created_at
FROM public.users 
WHERE email = 'polimax.store';

-- 5. Reactivar RLS (comentado por seguridad - actívalo después de confirmar que funciona)
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;