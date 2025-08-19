-- ===================================================================
-- CREAR TABLAS COMPATIBLES CON SISTEMA EXISTENTE - POLIMAX CHILE
-- ===================================================================
-- NOTA: Mantiene estructura existente: users, sessions, purchases, systems
-- Solo agrega las tablas nuevas necesarias
-- ===================================================================

-- Primero verificar tablas existentes
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'sessions', 'purchases', 'systems');

-- ===================================================================
-- 1. TABLA DE CONTACTOS (Nueva)
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.contactos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  email text NOT NULL,
  telefono text NOT NULL,
  empresa text,
  rut text,
  cargo text,
  region text,
  comuna text,
  direccion text,
  tipo_contacto text NOT NULL CHECK (tipo_contacto IN ('cliente', 'proveedor', 'distribuidor')),
  tipo_consulta text NOT NULL CHECK (tipo_consulta IN ('cotizacion', 'soporte', 'reclamo', 'sugerencia')),
  prioridad text DEFAULT 'normal' CHECK (prioridad IN ('normal', 'alta', 'urgente')),
  mensaje text NOT NULL,
  presupuesto text,
  tiempo_proyecto text,
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'resuelto')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices para contactos
CREATE INDEX IF NOT EXISTS idx_contactos_email ON public.contactos(email);
CREATE INDEX IF NOT EXISTS idx_contactos_estado ON public.contactos(estado);
CREATE INDEX IF NOT EXISTS idx_contactos_created_at ON public.contactos(created_at);

-- ===================================================================
-- 2. TABLA DE COORDINACIONES DE DESPACHO (Nueva)
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.coordinaciones_despacho (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  nombre_cliente text NOT NULL,
  telefono_cliente text NOT NULL,
  email_cliente text NOT NULL,
  region text NOT NULL,
  comuna text NOT NULL,
  direccion text NOT NULL,
  fecha_despacho date NOT NULL,
  comentarios text,
  tipo_producto text NOT NULL,
  cantidad integer NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  descripcion_producto text,
  precio_estimado numeric DEFAULT 0 CHECK (precio_estimado >= 0),
  estado text DEFAULT 'programado' CHECK (estado IN ('programado', 'en_transito', 'entregado', 'cancelado')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices para coordinaciones
CREATE INDEX IF NOT EXISTS idx_coordinaciones_email ON public.coordinaciones_despacho(email_cliente);
CREATE INDEX IF NOT EXISTS idx_coordinaciones_fecha ON public.coordinaciones_despacho(fecha_despacho);
CREATE INDEX IF NOT EXISTS idx_coordinaciones_estado ON public.coordinaciones_despacho(estado);

-- ===================================================================
-- 3. TABLA DE DESCARGAS DE CATÁLOGOS (Nueva)
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.descargas_catalogos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  email text NOT NULL,
  empresa text,
  catalogos_seleccionados text[] NOT NULL,
  acepta_terminos boolean NOT NULL DEFAULT true,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Índices para descargas
CREATE INDEX IF NOT EXISTS idx_descargas_email ON public.descargas_catalogos(email);
CREATE INDEX IF NOT EXISTS idx_descargas_created_at ON public.descargas_catalogos(created_at);

-- ===================================================================
-- 4. RENOMBRAR Y EXPANDIR TABLA PURCHASES (Si es necesario)
-- ===================================================================
-- Verificar estructura actual de purchases
-- Si necesitas agregar campos, usa ALTER TABLE

-- Agregar campos faltantes a purchases si no existen
DO $$
BEGIN
    -- Verificar si la columna existe antes de agregarla
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchases' AND column_name = 'nombre_cliente') THEN
        ALTER TABLE public.purchases ADD COLUMN nombre_cliente text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchases' AND column_name = 'telefono_cliente') THEN
        ALTER TABLE public.purchases ADD COLUMN telefono_cliente text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchases' AND column_name = 'email_cliente') THEN
        ALTER TABLE public.purchases ADD COLUMN email_cliente text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchases' AND column_name = 'region') THEN
        ALTER TABLE public.purchases ADD COLUMN region text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchases' AND column_name = 'comuna') THEN
        ALTER TABLE public.purchases ADD COLUMN comuna text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchases' AND column_name = 'direccion') THEN
        ALTER TABLE public.purchases ADD COLUMN direccion text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchases' AND column_name = 'metodo_pago') THEN
        ALTER TABLE public.purchases ADD COLUMN metodo_pago text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchases' AND column_name = 'estado') THEN
        ALTER TABLE public.purchases ADD COLUMN estado text DEFAULT 'pendiente';
    END IF;
END $$;

-- ===================================================================
-- 5. TABLA DE ITEMS DE COMPRA (Nueva - complementa purchases)
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.purchase_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id uuid REFERENCES public.purchases(id) ON DELETE CASCADE,
  
  -- Datos del producto
  producto_id text NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  precio_unitario numeric NOT NULL CHECK (precio_unitario >= 0),
  cantidad integer NOT NULL CHECK (cantidad > 0),
  total numeric NOT NULL CHECK (total >= 0),
  imagen text,
  tipo text DEFAULT 'producto' CHECK (tipo IN ('producto', 'coordinacion')),
  
  -- Para coordinaciones
  fecha_despacho date,
  region_despacho text,
  comuna_despacho text,
  
  created_at timestamp with time zone DEFAULT now()
);

-- Índices para purchase_items
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON public.purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_producto ON public.purchase_items(producto_id);

-- ===================================================================
-- 6. TABLA DE PRODUCTOS (Nueva)
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.productos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo text UNIQUE NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  categoria text NOT NULL CHECK (categoria IN ('laminas-alveolares', 'rollos-compactos', 'accesorios', 'estructuras')),
  subcategoria text,
  precio numeric NOT NULL DEFAULT 0 CHECK (precio >= 0),
  precio_descuento numeric CHECK (precio_descuento >= 0),
  imagen text,
  imagenes text[],
  especificaciones jsonb,
  stock integer DEFAULT 0 CHECK (stock >= 0),
  activo boolean DEFAULT true,
  destacado boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON public.productos(codigo);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON public.productos(activo);

-- ===================================================================
-- 7. TABLA DE COTIZACIONES (Nueva)
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.cotizaciones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  codigo_cotizacion text UNIQUE NOT NULL,
  
  -- Datos del cliente
  nombre_cliente text NOT NULL,
  email_cliente text NOT NULL,
  telefono_cliente text,
  empresa text,
  
  -- Productos y totales
  productos jsonb NOT NULL,
  subtotal numeric NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  descuento_porcentaje numeric DEFAULT 0,
  total numeric NOT NULL DEFAULT 0 CHECK (total >= 0),
  
  -- Estado
  estado text DEFAULT 'borrador' CHECK (estado IN ('borrador', 'enviada', 'aceptada', 'rechazada', 'expirada')),
  valida_hasta date,
  
  -- Notas
  notas_internas text,
  notas_cliente text,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices para cotizaciones
CREATE INDEX IF NOT EXISTS idx_cotizaciones_codigo ON public.cotizaciones(codigo_cotizacion);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_email ON public.cotizaciones(email_cliente);

-- ===================================================================
-- 8. TABLA DE NOTIFICACIONES (Nueva)
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('compra', 'despacho', 'cotizacion', 'promocion', 'sistema')),
  titulo text NOT NULL,
  mensaje text NOT NULL,
  leida boolean DEFAULT false,
  data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Índices para notificaciones
CREATE INDEX IF NOT EXISTS idx_notificaciones_user ON public.notificaciones(user_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON public.notificaciones(leida);

-- ===================================================================
-- TRIGGERS PARA UPDATED_AT (Compatible con sistema existente)
-- ===================================================================

-- Crear función si no existe
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers solo a tablas nuevas
CREATE TRIGGER IF NOT EXISTS update_contactos_updated_at 
    BEFORE UPDATE ON public.contactos 
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_coordinaciones_updated_at 
    BEFORE UPDATE ON public.coordinaciones_despacho 
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_productos_updated_at 
    BEFORE UPDATE ON public.productos 
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_cotizaciones_updated_at 
    BEFORE UPDATE ON public.cotizaciones 
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ===================================================================
-- DESACTIVAR RLS EN TODAS LAS TABLAS (Compatible con tu sistema)
-- ===================================================================

-- Tablas existentes (ya las tienes desactivadas)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.systems DISABLE ROW LEVEL SECURITY;

-- Tablas nuevas
ALTER TABLE public.contactos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordinaciones_despacho DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.descargas_catalogos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones DISABLE ROW LEVEL SECURITY;

-- ===================================================================
-- INSERTAR PRODUCTOS DE EJEMPLO
-- ===================================================================

INSERT INTO public.productos (codigo, nombre, descripcion, categoria, precio, activo, destacado, stock) VALUES
('LAM-ALV-6MM-CLEAR', 'Lámina Alveolar 6mm Transparente', 'Lámina de policarbonato alveolar de 6mm, transparente, protección UV 10 años', 'laminas-alveolares', 12500, true, true, 100),
('LAM-ALV-10MM-BRONCE', 'Lámina Alveolar 10mm Bronce', 'Lámina de policarbonato alveolar de 10mm, color bronce, protección UV 10 años', 'laminas-alveolares', 18900, true, true, 80),
('LAM-ALV-16MM-OPAL', 'Lámina Alveolar 16mm Opal', 'Lámina de policarbonato alveolar de 16mm, color opal, máximo aislamiento', 'laminas-alveolares', 24500, true, true, 50),
('ROLLO-COMP-2MM', 'Rollo Compacto 2mm Transparente', 'Rollo de policarbonato compacto de 2mm, alta resistencia al impacto', 'rollos-compactos', 8500, true, false, 60),
('ROLLO-COMP-3MM', 'Rollo Compacto 3mm Transparente', 'Rollo de policarbonato compacto de 3mm, mayor resistencia', 'rollos-compactos', 11200, true, true, 40),
('PERFIL-H-6MM', 'Perfil H para 6mm', 'Perfil de unión H para láminas de 6mm, aluminio anodizado', 'accesorios', 2500, true, false, 200),
('PERFIL-H-10MM', 'Perfil H para 10mm', 'Perfil de unión H para láminas de 10mm, aluminio anodizado', 'accesorios', 3200, true, false, 150),
('TORNILLO-AUTOPERT', 'Tornillo Autoperforante c/Arandela', 'Tornillo autoperforante con arandela de goma EPDM', 'accesorios', 150, true, false, 1000),
('PERFIL-U-CIERRE', 'Perfil U de Cierre', 'Perfil U para cierre de bordes, protección contra filtraciones', 'accesorios', 1800, true, false, 100),
('ESTRUCTURA-BASE', 'Sistema Estructural Básico', 'Sistema completo de perfiles para estructura básica', 'estructuras', 45000, true, true, 25)
ON CONFLICT (codigo) DO NOTHING;

-- ===================================================================
-- VERIFICAR ESTADO FINAL
-- ===================================================================

-- Mostrar todas las tablas y su estado de RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Contar productos insertados
SELECT COUNT(*) as total_productos FROM public.productos;

-- ===================================================================
-- ¡SCRIPT COMPLETADO EXITOSAMENTE!
-- ===================================================================
-- Tablas creadas y compatibles con tu sistema existente:
-- ✅ contactos (nueva)
-- ✅ coordinaciones_despacho (nueva) 
-- ✅ descargas_catalogos (nueva)
-- ✅ purchases (expandida con nuevos campos)
-- ✅ purchase_items (nueva)
-- ✅ productos (nueva con 10 productos de ejemplo)
-- ✅ cotizaciones (nueva)
-- ✅ notificaciones (nueva)
-- ===================================================================