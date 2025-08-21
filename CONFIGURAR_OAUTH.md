# Configuración de OAuth para ObraExpress

## ❌ Problema detectado
Las variables de entorno para OAuth no están configuradas. Por eso no funciona el login con Google.

## ✅ Solución paso a paso

### 1. Configurar Supabase
1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. Ve a Settings → API y copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Configurar Google OAuth
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ 
4. Ve a "Credenciales" → "Crear credenciales" → "ID de cliente OAuth 2.0"
5. Configura:
   - **Tipo de aplicación**: Aplicación web
   - **URIs de redirección autorizados**: 
     - `http://localhost:3000/auth/callback`
     - `https://tu-dominio.com/auth/callback`
6. Copia el **Client ID** y **Client Secret**

### 3. Configurar Supabase OAuth Provider
1. En Supabase, ve a Authentication → Providers
2. Habilita Google
3. Pega tu Google Client ID y Client Secret
4. Guarda los cambios

### 4. Crear archivo .env.local
```bash
cp .env.local.example .env.local
```

Luego edita `.env.local` con tus credenciales reales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...tu-clave-publica
SUPABASE_SERVICE_ROLE_KEY=eyJ...tu-clave-servicio

GOOGLE_CLIENT_ID=123456-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-tu-client-secret

BASE_URL=http://localhost:3000
```

### 5. Reiniciar el servidor
```bash
npm run dev
```

## 🔧 Verificar configuración
Ejecuta el diagnóstico:
```bash
node oauth-debug.js
```

## 📋 URLs importantes
- **Supabase Dashboard**: https://app.supabase.com/
- **Google Cloud Console**: https://console.cloud.google.com/
- **Callback URL**: `http://localhost:3000/auth/callback`

Una vez configurado correctamente, el login con Google debería funcionar.