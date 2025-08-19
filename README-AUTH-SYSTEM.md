# 🔐 Sistema de Autenticación Híbrido - POLIMAX

## 📋 Resumen del Sistema

Este proyecto implementa un **sistema de autenticación híbrido** que usa diferentes métodos según el entorno de deployment:

- 🏠 **Hostinger (Sitio Estático)**: Usa **Supabase** como base de datos
- 🌐 **Vercel (Sitio Dinámico)**: Usa **localStorage** para un sistema de auth diferente  
- 💻 **Desarrollo Local**: Usa **localStorage** por defecto

## 🔧 Configuración por Entorno

### Variables de Entorno

```bash
# Modo de autenticación
NEXT_PUBLIC_AUTH_MODE=vercel      # Para Vercel
NEXT_PUBLIC_AUTH_MODE=hostinger   # Para Hostinger (forzado en export)

# Para export estático
STATIC_EXPORT=true               # Activa automáticamente Supabase
```

### Flujo de Decisión

```javascript
if (STATIC_EXPORT === 'true' || AUTH_MODE === 'hostinger') {
  // Usar Supabase (Hostinger)
} else {
  // Usar localStorage (Vercel/Local)
}
```

## 🚀 Comandos de Deployment

### Para Hostinger (Estático + Supabase)
```bash
npm run export              # Genera archivos estáticos
./deploy-hostinger.bat      # Script con interfaz
```

### Para Vercel (Dinámico + localStorage)
```bash
git push origin main        # Deploy automático
```

### Para Desarrollo Local (localStorage)
```bash
npm run dev                 # Desarrollo normal
```

## 🔑 Credenciales de Admin

### Hostinger (Supabase)
- **Usuario:** `polimax.store`
- **Contraseña:** `polimax2025$$`
- **Almacenado en:** Base de datos Supabase

### Vercel/Local (localStorage)
- **Usuario:** `polimax.store`  
- **Contraseña:** `polimax2025$$`
- **Almacenado en:** localStorage del navegador

## 🗄️ Base de Datos Supabase

### Tablas Configuradas:
- ✅ `users` - Usuarios del sistema
- ✅ `sessions` - Sesiones activas  
- ✅ `purchases` - Historial de compras
- ✅ `systems` - Configuración del sistema

### Configuración:
- ✅ RLS desactivado para permitir operaciones
- ✅ Usuario admin pre-creado
- ✅ Triggers para updated_at automático

## 📁 Archivos Principales

```
src/
├── lib/
│   ├── supabase.ts           # Cliente Supabase
│   ├── supabase-auth.ts      # Autenticación Supabase
│   ├── auth-storage.ts       # Autenticación localStorage
│   └── admin-setup.ts        # Configuración admin local
├── contexts/
│   └── AuthContext.tsx       # Context híbrido
└── components/
    └── auth-guard.tsx        # Protección de rutas

database/
├── schema.sql                # Esquema inicial
├── schema-safe.sql           # Esquema seguro
├── fix-admin-user.sql        # Arreglar usuario admin
└── disable-rls-sessions.sql  # Desactivar RLS
```

## 🔄 Flujo de Autenticación

### Hostinger (Supabase)
1. Usuario hace login → `SupabaseAuth.login()`
2. Verifica en tabla `users` de Supabase
3. Crea sesión en tabla `sessions`
4. Guarda token en localStorage
5. Usuario autenticado

### Vercel (localStorage)
1. Usuario hace login → `AuthStorage.findUser()`
2. Verifica en localStorage del navegador
3. Crea sesión local con `AuthStorage.saveSession()`
4. Usuario autenticado

## 🛠️ Mantenimiento

### Limpiar sesiones expiradas (Supabase)
```sql
DELETE FROM public.sessions WHERE expires_at < NOW();
```

### Reset sistema local
```javascript
localStorage.clear();
```

## ⚠️ Importante

- **Hostinger**: Requiere conexión a internet para Supabase
- **Vercel**: Funciona completamente offline después de cargar
- **Credenciales**: Son las mismas en ambos sistemas por simplicidad
- **RLS**: Desactivado en Supabase para simplicidad del proyecto

## 🧪 Testing

1. **Probar Hostinger**: `npm run export` → Subir `out/` a Hostinger
2. **Probar Vercel**: `git push origin main` → Deploy automático
3. **Probar Local**: `npm run dev` → http://localhost:3001

¡El sistema está listo para ambos entornos! 🎉