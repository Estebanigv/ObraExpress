-- Actualizar el hash de la contraseña del admin para que coincida con nuestro sistema
-- Ejecutar este SQL en Supabase SQL Editor

UPDATE public.users 
SET password_hash = 'cG9saW1heDIwMjUkJHBvbGltYXhfc2FsdF8yMDI1'
WHERE email = 'polimax.store';

-- Verificar que se actualizó correctamente
SELECT email, password_hash, nombre FROM public.users WHERE email = 'polimax.store';