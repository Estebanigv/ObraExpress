-- ===================================================================
-- CREAR TABLAS FALTANTES EN SUPABASE - POLIMAX CHILE
-- ===================================================================
-- NOTA: Las tablas 'users' y 'sessions' ya están creadas
-- Este script crea solo las 8 tablas restantes
-- ===================================================================

-- 1. TABLA DE CONTACTOS
-- ===================================================================
CREATE TABLE public.contactos (
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

CREATE INDEX idx_contactos_email ON public.contactos(email);
CREATE INDEX idx_contactos_estado ON public.contactos(estado);
CREATE INDEX idx_contactos_created_at ON public.contactos(created_at);

-- 2. TABLA DE COORDINACIONES DE DESPACHO
-- ===================================================================
CREATE TABLE public.coordinaciones_despacho (
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

CREATE INDEX idx_coordinaciones_email ON public.coordinaciones_despacho(email_cliente);
CREATE INDEX idx_coordinaciones_fecha ON public.coordinaciones_despacho(fecha_despacho);
CREATE INDEX idx_coordinaciones_estado ON public.coordinaciones_despacho(estado);

-- 3. TABLA DE DESCARGAS DE CATÁLOGOS
-- ===================================================================
CREATE TABLE public.descargas_catalogos (
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

CREATE INDEX idx_descargas_email ON public.descargas_catalogos(email);
CREATE INDEX idx_descargas_created_at ON public.descargas_catalogos(created_at);

-- 4. TABLA DE COMPRAS
-- ===================================================================
CREATE TABLE public.compras (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Datos del cliente
  nombre_cliente text NOT NULL,
  telefono_cliente text NOT NULL,
  email_cliente text NOT NULL,
  region text NOT NULL,
  comuna text NOT NULL,
  direccion text NOT NULL,
  comentarios text,
  
  -- Datos de pago
  metodo_pago text NOT NULL CHECK (metodo_pago IN ('card', 'transbank', 'transferencia')),
  titular_tarjeta text,
  
  -- Totales
  subtotal numeric NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  descuento_porcentaje numeric DEFAULT 0 CHECK (descuento_porcentaje >= 0 AND descuento_porcentaje <= 100),
  descuento_monto numeric DEFAULT 0 CHECK (descuento_monto >= 0),
  total numeric NOT NULL DEFAULT 0 CHECK (total >= 0),
  
  -- Estado
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado')),
  transaccion_id text,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_compras_user ON public.compras(user_id);
CREATE INDEX idx_compras_email ON public.compras(email_cliente);
CREATE INDEX idx_compras_estado ON public.compras(estado);

-- 5. TABLA DE ITEMS DE COMPRA
-- ===================================================================
CREATE TABLE public.items_compra (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  compra_id uuid REFERENCES public.compras(id) ON DELETE CASCADE,
  
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

CREATE INDEX idx_items_compra ON public.items_compra(compra_id);
CREATE INDEX idx_items_producto ON public.items_compra(producto_id);

-- 6. TABLA DE PRODUCTOS
-- ===================================================================
CREATE TABLE public.productos (
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

CREATE INDEX idx_productos_codigo ON public.productos(codigo);
CREATE INDEX idx_productos_categoria ON public.productos(categoria);
CREATE INDEX idx_productos_activo ON public.productos(activo);

-- 7. TABLA DE COTIZACIONES
-- ===================================================================
CREATE TABLE public.cotizaciones (
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

CREATE INDEX idx_cotizaciones_codigo ON public.cotizaciones(codigo_cotizacion);
CREATE INDEX idx_cotizaciones_email ON public.cotizaciones(email_cliente);

-- 8. TABLA DE NOTIFICACIONES
-- ===================================================================
CREATE TABLE public.notificaciones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('compra', 'despacho', 'cotizacion', 'promocion', 'sistema')),
  titulo text NOT NULL,
  mensaje text NOT NULL,
  leida boolean DEFAULT false,
  data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_notificaciones_user ON public.notificaciones(user_id);
CREATE INDEX idx_notificaciones_leida ON public.notificaciones(leida);

-- ===================================================================
-- TRIGGERS PARA UPDATED_AT
-- ===================================================================

-- Crear función si no existe (puede que ya esté creada)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers
CREATE TRIGGER update_contactos_updated_at BEFORE UPDATE ON public.contactos FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_coordinaciones_updated_at BEFORE UPDATE ON public.coordinaciones_despacho FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_compras_updated_at BEFORE UPDATE ON public.compras FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON public.productos FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_cotizaciones_updated_at BEFORE UPDATE ON public.cotizaciones FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ===================================================================
-- INSERTAR PRODUCTOS DE EJEMPLO
-- ===================================================================

INSERT INTO public.productos (codigo, nombre, descripcion, categoria, precio, activo, destacado) VALUES
('LAM-ALV-6MM-CLEAR', 'Lámina Alveolar 6mm Transparente', 'Lámina de policarbonato alveolar de 6mm, transparente, protección UV 10 años', 'laminas-alveolares', 12500, true, true),
('LAM-ALV-10MM-BRONCE', 'Lámina Alveolar 10mm Bronce', 'Lámina de policarbonato alveolar de 10mm, color bronce, protección UV 10 años', 'laminas-alveolares', 18900, true, true),
('LAM-ALV-16MM-OPAL', 'Lámina Alveolar 16mm Opal', 'Lámina de policarbonato alveolar de 16mm, color opal, máximo aislamiento', 'laminas-alveolares', 24500, true, true),
('ROLLO-COMP-2MM', 'Rollo Compacto 2mm Transparente', 'Rollo de policarbonato compacto de 2mm, alta resistencia al impacto', 'rollos-compactos', 8500, true, false),
('ROLLO-COMP-3MM', 'Rollo Compacto 3mm Transparente', 'Rollo de policarbonato compacto de 3mm, mayor resistencia', 'rollos-compactos', 11200, true, true),
('PERFIL-H-6MM', 'Perfil H para 6mm', 'Perfil de unión H para láminas de 6mm, aluminio anodizado', 'accesorios', 2500, true, false),
('PERFIL-H-10MM', 'Perfil H para 10mm', 'Perfil de unión H para láminas de 10mm, aluminio anodizado', 'accesorios', 3200, true, false),
('TORNILLO-AUTOPERT', 'Tornillo Autoperforante c/Arandela', 'Tornillo autoperforante con arandela de goma EPDM', 'accesorios', 150, true, false),
('PERFIL-U-CIERRE', 'Perfil U de Cierre', 'Perfil U para cierre de bordes, protección contra filtraciones', 'accesorios', 1800, true, false),
('ESTRUCTURA-BASE', 'Sistema Estructural Básico', 'Sistema completo de perfiles para estructura básica', 'estructuras', 45000, true, true);

-- ===================================================================
-- DESACTIVAR RLS POR AHORA
-- ===================================================================

ALTER TABLE public.contactos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordinaciones_despacho DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.descargas_catalogos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.items_compra DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones DISABLE ROW LEVEL SECURITY;

-- ===================================================================
-- ¡TABLAS CREADAS EXITOSAMENTE!
-- ===================================================================