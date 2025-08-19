-- Esquema de base de datos para POLIMAX
-- Ejecutar este SQL en Supabase SQL Editor

-- Extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    compras_realizadas INTEGER DEFAULT 0,
    total_comprado DECIMAL(10,2) DEFAULT 0,
    tiene_descuento BOOLEAN DEFAULT false,
    porcentaje_descuento INTEGER DEFAULT 0,
    provider VARCHAR(50) DEFAULT 'email',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de sesiones
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    remember_me BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de compras
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    productos JSONB NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    fecha_compra TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estado VARCHAR(50) DEFAULT 'pendiente',
    direccion_entrega TEXT,
    telefono_contacto VARCHAR(20),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS public.systems (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON public.sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_fecha ON public.purchases(fecha_compra);
CREATE INDEX IF NOT EXISTS idx_systems_clave ON public.systems(clave);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas que lo necesiten
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_systems_updated_at BEFORE UPDATE ON public.systems
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar usuario administrador por defecto
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
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Hash de 'polimax2025$$'
    'Polimax.store',
    '+56 9 0000 0000',
    0,
    0,
    true,
    100,
    'email'
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    nombre = EXCLUDED.nombre,
    telefono = EXCLUDED.telefono,
    tiene_descuento = EXCLUDED.tiene_descuento,
    porcentaje_descuento = EXCLUDED.porcentaje_descuento,
    updated_at = NOW();

-- Configuraciones iniciales del sistema
INSERT INTO public.systems (clave, valor, descripcion) VALUES
    ('site_maintenance', 'false', 'Modo mantenimiento del sitio'),
    ('max_sessions_per_user', '5', 'Máximo de sesiones activas por usuario'),
    ('session_cleanup_days', '30', 'Días para limpiar sesiones expiradas'),
    ('default_discount', '5', 'Descuento por defecto para nuevos usuarios')
ON CONFLICT (clave) DO UPDATE SET
    valor = EXCLUDED.valor,
    updated_at = NOW();

-- Política de seguridad RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.systems ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios (pueden ver/editar solo sus propios datos)
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Políticas para sesiones
CREATE POLICY "Users can view own sessions" ON public.sessions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own sessions" ON public.sessions
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Políticas para compras
CREATE POLICY "Users can view own purchases" ON public.purchases
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own purchases" ON public.purchases
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Políticas para configuración del sistema (solo lectura para usuarios autenticados)
CREATE POLICY "Authenticated users can view system config" ON public.systems
    FOR SELECT TO authenticated USING (true);

-- Función para limpiar sesiones expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM public.sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;