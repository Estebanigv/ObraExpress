-- ===================================================================
-- SCHEMA COMPLETO DE BASE DE DATOS SUPABASE - POLIMAX CHILE
-- ===================================================================
-- Creado: $(date)
-- Descripción: Todas las tablas necesarias para el sitio web completo
-- ===================================================================

-- 3. TABLA DE CONTACTOS (Formulario de Contacto)
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
CREATE INDEX IF NOT EXISTS idx_contactos_tipo_consulta ON public.contactos(tipo_consulta);
CREATE INDEX IF NOT EXISTS idx_contactos_created_at ON public.contactos(created_at);

-- ===================================================================

-- 4. TABLA DE COORDINACIONES DE DESPACHO
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

-- Índices para coordinaciones de despacho
CREATE INDEX IF NOT EXISTS idx_coordinaciones_email ON public.coordinaciones_despacho(email_cliente);
CREATE INDEX IF NOT EXISTS idx_coordinaciones_fecha ON public.coordinaciones_despacho(fecha_despacho);
CREATE INDEX IF NOT EXISTS idx_coordinaciones_estado ON public.coordinaciones_despacho(estado);
CREATE INDEX IF NOT EXISTS idx_coordinaciones_user ON public.coordinaciones_despacho(user_id);

-- ===================================================================

-- 5. TABLA DE DESCARGAS DE CATÁLOGOS
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

-- Índices para descargas de catálogos
CREATE INDEX IF NOT EXISTS idx_descargas_email ON public.descargas_catalogos(email);
CREATE INDEX IF NOT EXISTS idx_descargas_created_at ON public.descargas_catalogos(created_at);
CREATE INDEX IF NOT EXISTS idx_descargas_catalogos ON public.descargas_catalogos USING GIN(catalogos_seleccionados);

-- ===================================================================

-- 6. TABLA DE COMPRAS (Checkout)
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.compras (
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
  
  -- Estado y transacción
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado')),
  transaccion_id text,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices para compras
CREATE INDEX IF NOT EXISTS idx_compras_user ON public.compras(user_id);
CREATE INDEX IF NOT EXISTS idx_compras_email ON public.compras(email_cliente);
CREATE INDEX IF NOT EXISTS idx_compras_estado ON public.compras(estado);
CREATE INDEX IF NOT EXISTS idx_compras_created_at ON public.compras(created_at);
CREATE INDEX IF NOT EXISTS idx_compras_transaccion ON public.compras(transaccion_id);

-- ===================================================================

-- 7. TABLA DE ITEMS DE COMPRA (Productos del Carrito)
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.items_compra (
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
  
  -- Para coordinaciones de despacho
  fecha_despacho date,
  region_despacho text,
  comuna_despacho text,
  
  created_at timestamp with time zone DEFAULT now()
);

-- Índices para items de compra
CREATE INDEX IF NOT EXISTS idx_items_compra ON public.items_compra(compra_id);
CREATE INDEX IF NOT EXISTS idx_items_producto ON public.items_compra(producto_id);
CREATE INDEX IF NOT EXISTS idx_items_tipo ON public.items_compra(tipo);

-- ===================================================================

-- 8. TABLA DE PRODUCTOS (Catálogo)
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
  peso numeric CHECK (peso >= 0), -- en kg
  dimensiones jsonb, -- {"largo": 200, "ancho": 100, "alto": 50}
  garantia_meses integer DEFAULT 120, -- 10 años por defecto
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON public.productos(codigo);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON public.productos(activo);
CREATE INDEX IF NOT EXISTS idx_productos_destacado ON public.productos(destacado);
CREATE INDEX IF NOT EXISTS idx_productos_precio ON public.productos(precio);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON public.productos USING GIN(to_tsvector('spanish', nombre));

-- ===================================================================

-- 9. TABLA DE COTIZACIONES
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
  
  -- Productos cotizados (JSON con estructura específica)
  productos jsonb NOT NULL,
  subtotal numeric NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  descuento_porcentaje numeric DEFAULT 0 CHECK (descuento_porcentaje >= 0 AND descuento_porcentaje <= 100),
  total numeric NOT NULL DEFAULT 0 CHECK (total >= 0),
  
  -- Estado y validez
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
CREATE INDEX IF NOT EXISTS idx_cotizaciones_user ON public.cotizaciones(user_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_email ON public.cotizaciones(email_cliente);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_estado ON public.cotizaciones(estado);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_valida ON public.cotizaciones(valida_hasta);

-- ===================================================================

-- 10. TABLA DE NOTIFICACIONES
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('compra', 'despacho', 'cotizacion', 'promocion', 'sistema')),
  titulo text NOT NULL,
  mensaje text NOT NULL,
  leida boolean DEFAULT false,
  data jsonb, -- Datos adicionales según el tipo
  created_at timestamp with time zone DEFAULT now()
);

-- Índices para notificaciones
CREATE INDEX IF NOT EXISTS idx_notificaciones_user ON public.notificaciones(user_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo ON public.notificaciones(tipo);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON public.notificaciones(leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_created_at ON public.notificaciones(created_at);

-- ===================================================================

-- 11. TABLA DE CONFIGURACIÓN DEL SISTEMA
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.configuracion (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clave text UNIQUE NOT NULL,
  valor text NOT NULL,
  descripcion text,
  tipo text DEFAULT 'string' CHECK (tipo IN ('string', 'number', 'boolean', 'json')),
  categoria text DEFAULT 'general',
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices para configuración
CREATE INDEX IF NOT EXISTS idx_configuracion_clave ON public.configuracion(clave);
CREATE INDEX IF NOT EXISTS idx_configuracion_categoria ON public.configuracion(categoria);

-- ===================================================================

-- TRIGGERS PARA UPDATED_AT
-- ===================================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas que tienen updated_at
CREATE TRIGGER update_contactos_updated_at BEFORE UPDATE ON public.contactos FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_coordinaciones_updated_at BEFORE UPDATE ON public.coordinaciones_despacho FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_compras_updated_at BEFORE UPDATE ON public.compras FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON public.productos FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_cotizaciones_updated_at BEFORE UPDATE ON public.cotizaciones FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_configuracion_updated_at BEFORE UPDATE ON public.configuracion FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ===================================================================

-- INSERTAR DATOS INICIALES
-- ===================================================================

-- Configuraciones iniciales del sistema
INSERT INTO public.configuracion (clave, valor, descripcion, categoria) VALUES
('sitio_nombre', 'POLIMAX Chile', 'Nombre del sitio web', 'general'),
('sitio_email', 'contacto@polimax.cl', 'Email principal de contacto', 'general'),
('sitio_telefono', '+56963348909', 'Teléfono principal', 'general'),
('descuento_registro', '5', 'Porcentaje de descuento por registro (%)', 'promociones'),
('descuento_primera_compra', '3', 'Porcentaje de descuento primera compra (%)', 'promociones'),
('envio_gratis_minimo', '50000', 'Monto mínimo para envío gratis (CLP)', 'envios'),
('cotizacion_validez_dias', '30', 'Días de validez de cotizaciones', 'cotizaciones'),
('stock_minimo_alerta', '10', 'Stock mínimo para alerta', 'inventario')
ON CONFLICT (clave) DO NOTHING;

-- Productos iniciales (algunos ejemplos)
INSERT INTO public.productos (codigo, nombre, descripcion, categoria, precio, activo, destacado) VALUES
('LAM-ALV-6MM-CLEAR', 'Lámina Alveolar 6mm Transparente', 'Lámina de policarbonato alveolar de 6mm, transparente, protección UV', 'laminas-alveolares', 12500, true, true),
('LAM-ALV-10MM-BRONCE', 'Lámina Alveolar 10mm Bronce', 'Lámina de policarbonato alveolar de 10mm, color bronce, protección UV', 'laminas-alveolares', 18900, true, true),
('ROLLO-COMP-2MM', 'Rollo Compacto 2mm', 'Rollo de policarbonato compacto de 2mm, alta resistencia', 'rollos-compactos', 8500, true, false),
('PERFIL-H-6MM', 'Perfil H para 6mm', 'Perfil de unión H para láminas de 6mm', 'accesorios', 2500, true, false),
('TORNILLO-AUTOPERT', 'Tornillo Autoperforante', 'Tornillo autoperforante con arandela de goma', 'accesorios', 150, true, false)
ON CONFLICT (codigo) DO NOTHING;

-- ===================================================================

-- POLÍTICAS DE SEGURIDAD (RLS)
-- ===================================================================

-- Habilitar RLS en tablas sensibles (opcional - por ahora deshabilitado)
-- ALTER TABLE public.contactos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.coordinaciones_despacho ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- ===================================================================

-- COMENTARIOS EN TABLAS
-- ===================================================================

COMMENT ON TABLE public.contactos IS 'Formularios de contacto del sitio web';
COMMENT ON TABLE public.coordinaciones_despacho IS 'Coordinaciones de despacho programadas';
COMMENT ON TABLE public.descargas_catalogos IS 'Registro de descargas de catálogos';
COMMENT ON TABLE public.compras IS 'Compras realizadas en el sitio';
COMMENT ON TABLE public.items_compra IS 'Productos incluidos en cada compra';
COMMENT ON TABLE public.productos IS 'Catálogo de productos disponibles';
COMMENT ON TABLE public.cotizaciones IS 'Cotizaciones generadas para clientes';
COMMENT ON TABLE public.notificaciones IS 'Sistema de notificaciones para usuarios';
COMMENT ON TABLE public.configuracion IS 'Configuraciones del sistema';

-- ===================================================================
-- FIN DEL SCHEMA COMPLETO
-- ===================================================================