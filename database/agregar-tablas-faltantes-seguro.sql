-- ===================================================================
-- AGREGAR SOLO TABLAS QUE NO EXISTEN - POLIMAX CHILE
-- ===================================================================
-- Script seguro que verifica existencia antes de crear
-- ===================================================================

-- Verificar qué tablas ya existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('contactos', 'coordinaciones_despacho', 'descargas_catalogos', 'purchase_items', 'productos', 'cotizaciones', 'notificaciones')
ORDER BY table_name;

-- ===================================================================
-- 1. COORDINACIONES DE DESPACHO (Solo si no existe)
-- ===================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coordinaciones_despacho') THEN
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
        
        RAISE NOTICE 'Tabla coordinaciones_despacho creada exitosamente';
    ELSE
        RAISE NOTICE 'Tabla coordinaciones_despacho ya existe, saltando...';
    END IF;
END $$;

-- ===================================================================
-- 2. DESCARGAS DE CATÁLOGOS (Solo si no existe)
-- ===================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'descargas_catalogos') THEN
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
        
        RAISE NOTICE 'Tabla descargas_catalogos creada exitosamente';
    ELSE
        RAISE NOTICE 'Tabla descargas_catalogos ya existe, saltando...';
    END IF;
END $$;

-- ===================================================================
-- 3. PURCHASE ITEMS (Solo si no existe)
-- ===================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'purchase_items') THEN
        CREATE TABLE public.purchase_items (
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
        
        CREATE INDEX idx_purchase_items_purchase ON public.purchase_items(purchase_id);
        CREATE INDEX idx_purchase_items_producto ON public.purchase_items(producto_id);
        
        RAISE NOTICE 'Tabla purchase_items creada exitosamente';
    ELSE
        RAISE NOTICE 'Tabla purchase_items ya existe, saltando...';
    END IF;
END $$;

-- ===================================================================
-- 4. PRODUCTOS (Solo si no existe)
-- ===================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'productos') THEN
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
        
        RAISE NOTICE 'Tabla productos creada exitosamente';
    ELSE
        RAISE NOTICE 'Tabla productos ya existe, saltando...';
    END IF;
END $$;

-- ===================================================================
-- 5. COTIZACIONES (Solo si no existe)
-- ===================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cotizaciones') THEN
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
        
        RAISE NOTICE 'Tabla cotizaciones creada exitosamente';
    ELSE
        RAISE NOTICE 'Tabla cotizaciones ya existe, saltando...';
    END IF;
END $$;

-- ===================================================================
-- 6. NOTIFICACIONES (Solo si no existe)
-- ===================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notificaciones') THEN
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
        
        RAISE NOTICE 'Tabla notificaciones creada exitosamente';
    ELSE
        RAISE NOTICE 'Tabla notificaciones ya existe, saltando...';
    END IF;
END $$;

-- ===================================================================
-- 7. EXPANDIR TABLA PURCHASES (Agregar campos faltantes)
-- ===================================================================
DO $$
BEGIN
    -- Verificar y agregar campos a purchases si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchases' AND column_name = 'nombre_cliente') THEN
        ALTER TABLE public.purchases ADD COLUMN nombre_cliente text;
        RAISE NOTICE 'Campo nombre_cliente agregado a purchases';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchases' AND column_name = 'telefono_cliente') THEN
        ALTER TABLE public.purchases ADD COLUMN telefono_cliente text;
        RAISE NOTICE 'Campo telefono_cliente agregado a purchases';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchases' AND column_name = 'email_cliente') THEN
        ALTER TABLE public.purchases ADD COLUMN email_cliente text;
        RAISE NOTICE 'Campo email_cliente agregado a purchases';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchases' AND column_name = 'region') THEN
        ALTER TABLE public.purchases ADD COLUMN region text;
        RAISE NOTICE 'Campo region agregado a purchases';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchases' AND column_name = 'comuna') THEN
        ALTER TABLE public.purchases ADD COLUMN comuna text;
        RAISE NOTICE 'Campo comuna agregado a purchases';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchases' AND column_name = 'direccion') THEN
        ALTER TABLE public.purchases ADD COLUMN direccion text;
        RAISE NOTICE 'Campo direccion agregado a purchases';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchases' AND column_name = 'metodo_pago') THEN
        ALTER TABLE public.purchases ADD COLUMN metodo_pago text;
        RAISE NOTICE 'Campo metodo_pago agregado a purchases';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchases' AND column_name = 'estado') THEN
        ALTER TABLE public.purchases ADD COLUMN estado text DEFAULT 'pendiente';
        RAISE NOTICE 'Campo estado agregado a purchases';
    END IF;
END $$;

-- ===================================================================
-- 8. TRIGGERS PARA UPDATED_AT
-- ===================================================================

-- Crear función si no existe
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers solo si las tablas existen
DO $$
BEGIN
    -- Trigger para coordinaciones_despacho
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coordinaciones_despacho') THEN
        DROP TRIGGER IF EXISTS update_coordinaciones_updated_at ON public.coordinaciones_despacho;
        CREATE TRIGGER update_coordinaciones_updated_at 
            BEFORE UPDATE ON public.coordinaciones_despacho 
            FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
    END IF;
    
    -- Trigger para productos
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'productos') THEN
        DROP TRIGGER IF EXISTS update_productos_updated_at ON public.productos;
        CREATE TRIGGER update_productos_updated_at 
            BEFORE UPDATE ON public.productos 
            FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
    END IF;
    
    -- Trigger para cotizaciones
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cotizaciones') THEN
        DROP TRIGGER IF EXISTS update_cotizaciones_updated_at ON public.cotizaciones;
        CREATE TRIGGER update_cotizaciones_updated_at 
            BEFORE UPDATE ON public.cotizaciones 
            FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
    END IF;
END $$;

-- ===================================================================
-- 9. DESACTIVAR RLS EN TODAS LAS TABLAS
-- ===================================================================

-- Tablas existentes
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.systems DISABLE ROW LEVEL SECURITY;

-- Tablas nuevas (solo si existen)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contactos') THEN
        ALTER TABLE public.contactos DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coordinaciones_despacho') THEN
        ALTER TABLE public.coordinaciones_despacho DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'descargas_catalogos') THEN
        ALTER TABLE public.descargas_catalogos DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'purchase_items') THEN
        ALTER TABLE public.purchase_items DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'productos') THEN
        ALTER TABLE public.productos DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cotizaciones') THEN
        ALTER TABLE public.cotizaciones DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notificaciones') THEN
        ALTER TABLE public.notificaciones DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ===================================================================
-- 10. INSERTAR PRODUCTOS DE EJEMPLO (Solo si la tabla productos existe y está vacía)
-- ===================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'productos') THEN
        IF NOT EXISTS (SELECT 1 FROM public.productos LIMIT 1) THEN
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
            ('ESTRUCTURA-BASE', 'Sistema Estructural Básico', 'Sistema completo de perfiles para estructura básica', 'estructuras', 45000, true, true, 25);
            
            RAISE NOTICE 'Productos de ejemplo insertados exitosamente';
        ELSE
            RAISE NOTICE 'La tabla productos ya tiene datos, saltando inserción...';
        END IF;
    END IF;
END $$;

-- ===================================================================
-- 11. VERIFICAR ESTADO FINAL
-- ===================================================================

-- Mostrar todas las tablas y su estado
SELECT table_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE information_schema.tables.table_name = pt.table_name) 
            THEN '✅ EXISTE' 
            ELSE '❌ NO EXISTE' 
       END as estado
FROM (VALUES 
    ('users'), ('sessions'), ('purchases'), ('systems'),
    ('contactos'), ('coordinaciones_despacho'), ('descargas_catalogos'), 
    ('purchase_items'), ('productos'), ('cotizaciones'), ('notificaciones')
) AS pt(table_name)
ORDER BY table_name;

-- Contar productos si existe la tabla
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'productos') THEN
        RAISE NOTICE 'Total productos: %', (SELECT COUNT(*) FROM public.productos);
    END IF;
END $$;

-- ===================================================================
-- ¡SCRIPT SEGURO COMPLETADO!
-- ===================================================================