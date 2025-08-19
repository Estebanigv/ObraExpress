-- ===================================================================
-- TABLA ADICIONAL: CONVERSACIONES Y SOLICITUDES DEL CHATBOT
-- ===================================================================
-- Esta tabla complementa las coordinaciones_despacho para el chatbot
-- ===================================================================

-- 9. TABLA DE CONVERSACIONES DEL CHATBOT
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.conversaciones_chatbot (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL, -- ID de sesión del navegador
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Datos del cliente (si los proporciona)
  nombre_cliente text,
  email_cliente text,
  telefono_cliente text,
  
  -- Información de la conversación
  mensajes jsonb NOT NULL, -- Array de mensajes de la conversación
  estado_conversacion text DEFAULT 'activa' CHECK (estado_conversacion IN ('activa', 'finalizada', 'abandonada')),
  tipo_consulta text, -- 'producto', 'despacho', 'cotizacion', 'soporte'
  
  -- Detalles específicos de productos/despacho
  productos_solicitados jsonb, -- Productos mencionados en la conversación
  fecha_despacho_seleccionada date, -- Fecha seleccionada en el calendario
  region_despacho text,
  comuna_despacho text,
  direccion_despacho text,
  
  -- Información técnica
  ip_address text,
  user_agent text,
  referrer text,
  
  -- Seguimiento
  webhook_enviado boolean DEFAULT false,
  coordinacion_creada boolean DEFAULT false, -- Si se creó una coordinación formal
  coordinacion_id uuid REFERENCES public.coordinaciones_despacho(id) ON DELETE SET NULL,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices para conversaciones_chatbot
CREATE INDEX IF NOT EXISTS idx_chatbot_session ON public.conversaciones_chatbot(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_user ON public.conversaciones_chatbot(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_estado ON public.conversaciones_chatbot(estado_conversacion);
CREATE INDEX IF NOT EXISTS idx_chatbot_fecha_despacho ON public.conversaciones_chatbot(fecha_despacho_seleccionada);
CREATE INDEX IF NOT EXISTS idx_chatbot_created_at ON public.conversaciones_chatbot(created_at);

-- ===================================================================
-- 10. AMPLIAR TABLA COORDINACIONES_DESPACHO PARA CHATBOT
-- ===================================================================

-- Agregar campos específicos para origen del despacho
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'coordinaciones_despacho' AND column_name = 'origen') THEN
        ALTER TABLE public.coordinaciones_despacho ADD COLUMN origen text DEFAULT 'formulario' 
        CHECK (origen IN ('formulario', 'chatbot', 'whatsapp', 'telefono', 'email'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'coordinaciones_despacho' AND column_name = 'conversacion_id') THEN
        ALTER TABLE public.coordinaciones_despacho ADD COLUMN conversacion_id uuid 
        REFERENCES public.conversaciones_chatbot(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'coordinaciones_despacho' AND column_name = 'webhook_data') THEN
        ALTER TABLE public.coordinaciones_despacho ADD COLUMN webhook_data jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'coordinaciones_despacho' AND column_name = 'horario_preferido') THEN
        ALTER TABLE public.coordinaciones_despacho ADD COLUMN horario_preferido text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'coordinaciones_despacho' AND column_name = 'instrucciones_especiales') THEN
        ALTER TABLE public.coordinaciones_despacho ADD COLUMN instrucciones_especiales text;
    END IF;
END $$;

-- ===================================================================
-- 11. TABLA DE PRODUCTOS SOLICITADOS EN CHATBOT
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.productos_chatbot (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversacion_id uuid REFERENCES public.conversaciones_chatbot(id) ON DELETE CASCADE,
  
  -- Información del producto solicitado
  descripcion_cliente text NOT NULL, -- Lo que escribió el cliente
  categoria_detectada text, -- Categoría que detectamos
  producto_sugerido_id uuid REFERENCES public.productos(id) ON DELETE SET NULL,
  
  -- Especificaciones mencionadas
  medidas_solicitadas text, -- "2x1m", "200cm x 100cm", etc.
  cantidad_solicitada integer,
  color_solicitado text,
  grosor_solicitado text, -- "6mm", "10mm", etc.
  
  -- Estado del producto en la conversación
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'cotizado', 'agregado_carrito', 'rechazado')),
  precio_cotizado numeric,
  
  created_at timestamp with time zone DEFAULT now()
);

-- Índices para productos_chatbot
CREATE INDEX IF NOT EXISTS idx_productos_chatbot_conversacion ON public.productos_chatbot(conversacion_id);
CREATE INDEX IF NOT EXISTS idx_productos_chatbot_categoria ON public.productos_chatbot(categoria_detectada);
CREATE INDEX IF NOT EXISTS idx_productos_chatbot_estado ON public.productos_chatbot(estado);

-- ===================================================================
-- 12. TABLA DE RESPUESTAS AUTOMÁTICAS DEL CHATBOT
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.respuestas_chatbot (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Configuración de la respuesta
  palabra_clave text NOT NULL,
  palabras_clave_adicionales text[], -- Array de sinónimos
  categoria text NOT NULL, -- 'productos', 'despacho', 'precios', 'general'
  
  -- Respuesta
  respuesta_texto text NOT NULL,
  respuesta_tipo text DEFAULT 'texto' CHECK (respuesta_tipo IN ('texto', 'boton', 'calendario', 'producto')),
  
  -- Configuración
  activa boolean DEFAULT true,
  prioridad integer DEFAULT 1, -- Para ordenar respuestas
  
  -- Acciones adicionales
  accion_webhook boolean DEFAULT false,
  accion_datos jsonb, -- Datos adicionales para la acción
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices para respuestas_chatbot
CREATE INDEX IF NOT EXISTS idx_respuestas_palabra_clave ON public.respuestas_chatbot(palabra_clave);
CREATE INDEX IF NOT EXISTS idx_respuestas_categoria ON public.respuestas_chatbot(categoria);
CREATE INDEX IF NOT EXISTS idx_respuestas_activa ON public.respuestas_chatbot(activa);

-- ===================================================================
-- TRIGGERS PARA LAS NUEVAS TABLAS
-- ===================================================================

CREATE TRIGGER IF NOT EXISTS update_conversaciones_updated_at 
    BEFORE UPDATE ON public.conversaciones_chatbot 
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_respuestas_updated_at 
    BEFORE UPDATE ON public.respuestas_chatbot 
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ===================================================================
-- DESACTIVAR RLS EN NUEVAS TABLAS
-- ===================================================================

ALTER TABLE public.conversaciones_chatbot DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos_chatbot DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas_chatbot DISABLE ROW LEVEL SECURITY;

-- ===================================================================
-- INSERTAR RESPUESTAS AUTOMÁTICAS BÁSICAS
-- ===================================================================

INSERT INTO public.respuestas_chatbot (palabra_clave, palabras_clave_adicionales, categoria, respuesta_texto, respuesta_tipo) VALUES
-- Despachos
('despacho', ARRAY['envio', 'entrega', 'delivery'], 'despacho', 
 '📦 INFORMACIÓN DE DESPACHOS POLIMAX:
 
 ✅ Despachos GRATUITOS solo los JUEVES
 ✅ Cobertura: Región Metropolitana
 ✅ Horario: Todo el día jueves
 ⚠️ Pedidos del miércoles van para el jueves siguiente
 
 📅 ¿Te gustaría ver las fechas disponibles?', 'calendario'),

-- Productos
('lamina', ARRAY['lámina', 'laminas', 'láminas', 'policarbonato'], 'productos',
 '🏗️ LÁMINAS DE POLICARBONATO POLIMAX:
 
 📏 Disponibles en: 6mm, 10mm, 16mm
 🎨 Colores: Transparente, Bronce, Opal, Azul
 📐 Medidas estándar: 2.10m x 5.80m
 🛡️ Garantía UV: 10 años
 
 ¿Qué medidas y grosor necesitas?', 'texto'),

-- Precios
('precio', ARRAY['costo', 'valor', 'cotización', 'cotizacion'], 'precios',
 '💰 PRECIOS POLIMAX (por m²):
 
 • Lámina 6mm: desde $12.500
 • Lámina 10mm: desde $18.900  
 • Lámina 16mm: desde $24.500
 • Rollos 2mm: desde $8.500
 • Accesorios: desde $150
 
 📊 ¿Te gustaría una cotización personalizada?', 'texto'),

-- Instalación
('instalacion', ARRAY['instalar', 'montaje', 'colocacion'], 'general',
 '🔧 INSTALACIÓN POLIMAX:
 
 ✅ Incluimos perfiles y tornillería
 ✅ Instrucciones detalladas
 ✅ Soporte técnico por WhatsApp
 📞 Asesoría: +56 9 6334 8909
 
 ¿Necesitas ayuda con las especificaciones técnicas?', 'texto')

ON CONFLICT (palabra_clave) DO NOTHING;

-- ===================================================================
-- FUNCIÓN PARA LIMPIAR CONVERSACIONES ANTIGUAS
-- ===================================================================

CREATE OR REPLACE FUNCTION public.limpiar_conversaciones_antiguas()
RETURNS void AS $$
BEGIN
    -- Marcar como abandonadas las conversaciones inactivas de más de 24 horas
    UPDATE public.conversaciones_chatbot 
    SET estado_conversacion = 'abandonada'
    WHERE estado_conversacion = 'activa' 
    AND updated_at < NOW() - INTERVAL '24 hours';
    
    -- Opcional: Eliminar conversaciones muy antiguas (más de 6 meses)
    -- DELETE FROM public.conversaciones_chatbot 
    -- WHERE created_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- VERIFICAR ESTADO FINAL
-- ===================================================================

-- Mostrar todas las tablas nuevas
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('conversaciones_chatbot', 'productos_chatbot', 'respuestas_chatbot')
ORDER BY table_name, ordinal_position;

-- Contar respuestas automáticas
SELECT COUNT(*) as total_respuestas_automaticas FROM public.respuestas_chatbot;

-- ===================================================================
-- ¡CHATBOT Y DESPACHOS COMPLETAMENTE INTEGRADOS!
-- ===================================================================
-- Nuevas tablas para chatbot:
-- ✅ conversaciones_chatbot (historial completo de conversaciones)
-- ✅ productos_chatbot (productos solicitados en chat)
-- ✅ respuestas_chatbot (respuestas automáticas configurables)
-- ✅ coordinaciones_despacho (expandida con campos de chatbot)
-- ===================================================================