-- Limpiar y recrear usuario admin correctamente
-- Ejecutar este SQL en Supabase SQL Editor

-- 1. Eliminar cualquier usuario admin existente
DELETE FROM public.users WHERE email = 'polimax.store';

-- 2. Verificar que se eliminó
SELECT COUNT(*) as usuarios_admin FROM public.users WHERE email = 'polimax.store';

-- 3. Crear usuario admin con el hash correcto
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
    porcentaje_descuento
FROM public.users 
WHERE email = 'polimax.store';

-- 5. Contar total de usuarios
SELECT COUNT(*) as total_usuarios FROM public.users;