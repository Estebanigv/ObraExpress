# 🔐 Configuración OAuth para POLIMAX

Esta guía te explica cómo configurar la autenticación OAuth real para Google, Microsoft, Facebook y Apple.

## 📋 Prerequisitos

1. Tener cuentas de desarrollador en los proveedores que quieras usar
2. Dominios verificados para producción
3. URLs de callback configuradas

## 🎯 URLs de Callback

Las siguientes URLs deben estar configuradas en cada proveedor:

- **Desarrollo**: `http://localhost:3003/auth/callback/{provider}`
- **Producción**: `https://tudominio.com/auth/callback/{provider}`

Donde `{provider}` puede ser: `google`, `microsoft`, `facebook`, `apple`

## 🚀 Configuración por Proveedor

### 1. Google OAuth

#### Paso 1: Crear proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la "Google+ API" y "Google Identity"

#### Paso 2: Configurar OAuth 2.0
1. Ve a "Credenciales" > "Crear credenciales" > "ID de cliente OAuth 2.0"
2. Tipo de aplicación: "Aplicación web"
3. **URIs de redirección autorizados**:
   - `http://localhost:3003/auth/callback/google` (desarrollo)
   - `https://tudominio.com/auth/callback/google` (producción)

#### Paso 3: Variables de entorno
```env
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
```

### 2. Microsoft OAuth

#### Paso 1: Registrar aplicación en Azure
1. Ve a [Azure Portal](https://portal.azure.com/)
2. "Azure Active Directory" > "Registros de aplicaciones" > "Nuevo registro"
3. Nombre: "POLIMAX App"
4. **URI de redirección**: 
   - Tipo: Web
   - URL: `http://localhost:3003/auth/callback/microsoft`

#### Paso 2: Configurar API permissions
1. "Permisos de API" > "Agregar permiso" > "Microsoft Graph"
2. Permisos delegados: `User.Read`, `email`, `openid`, `profile`

#### Paso 3: Variables de entorno
```env
MICROSOFT_CLIENT_ID=tu-application-id
MICROSOFT_CLIENT_SECRET=tu-client-secret
```

### 3. Facebook OAuth

#### Paso 1: Crear app en Facebook Developers
1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. "Mis aplicaciones" > "Crear aplicación" > "Consumidor"
3. Agrega el producto "Inicio de sesión de Facebook"

#### Paso 2: Configurar Valid OAuth Redirect URIs
1. "Inicio de sesión de Facebook" > "Configuración"
2. **URI de redirección OAuth válidos**:
   - `http://localhost:3003/auth/callback/facebook`
   - `https://tudominio.com/auth/callback/facebook`

#### Paso 3: Variables de entorno
```env
FACEBOOK_APP_ID=tu-app-id
FACEBOOK_APP_SECRET=tu-app-secret
```

### 4. Apple OAuth

#### Paso 1: Configurar en Apple Developer
1. Ve a [Apple Developer](https://developer.apple.com/)
2. "Certificates, Identifiers & Profiles" > "Identifiers" > "+"
3. Selecciona "Services IDs"

#### Paso 2: Configurar Service ID
1. Crea un Service ID (ej: `com.tudominio.polimax`)
2. Habilita "Sign In with Apple"
3. **Return URLs**:
   - `http://localhost:3003/auth/callback/apple`
   - `https://tudominio.com/auth/callback/apple`

#### Paso 3: Crear Key
1. "Keys" > "+" > "Sign In with Apple"
2. Descarga el archivo `.p8`

#### Paso 4: Variables de entorno
```env
APPLE_CLIENT_ID=com.tudominio.polimax
APPLE_TEAM_ID=tu-team-id
APPLE_KEY_ID=tu-key-id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu-private-key\n-----END PRIVATE KEY-----"
```

## ⚙️ Configuración del Proyecto

### 1. Crear archivo .env.local
```bash
cp .env.local.example .env.local
```

### 2. Completar variables de entorno
Edita `.env.local` con tus credenciales reales:

```env
# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID=tu-microsoft-client-id
MICROSOFT_CLIENT_SECRET=tu-microsoft-client-secret

# Facebook OAuth
FACEBOOK_APP_ID=tu-facebook-app-id
FACEBOOK_APP_SECRET=tu-facebook-app-secret

# Apple OAuth
APPLE_CLIENT_ID=com.tudominio.polimax
APPLE_TEAM_ID=tu-apple-team-id
APPLE_KEY_ID=tu-apple-key-id
APPLE_PRIVATE_KEY="tu-apple-private-key"

# Configuración general
BASE_URL=http://localhost:3003
NEXTAUTH_SECRET=tu-secret-super-seguro-de-32-caracteres
```

### 3. Reiniciar servidor de desarrollo
```bash
npm run dev
```

## 🧪 Probar OAuth

1. Ve a `http://localhost:3003/login`
2. Haz clic en cualquier botón de proveedor social
3. Si está configurado: te redirigirá al proveedor
4. Si no está configurado: simulará el proceso

## 🔒 Seguridad

### Variables de entorno en producción
- **Nunca** commits archivos `.env.local` al repositorio
- Usa variables de entorno seguras en tu plataforma de hosting
- Regenera secrets regularmente

### URLs de callback
- Siempre usa HTTPS en producción
- Verifica que las URLs coincidan exactamente
- No uses wildcards en producción

## 🚨 Troubleshooting

### Error: "redirect_uri_mismatch"
- Verifica que la URL de callback coincida exactamente
- Asegúrate de incluir el protocolo (http:// o https://)
- Revisa que no haya espacios extra

### Error: "invalid_client"
- Verifica que el Client ID esté correcto
- Confirma que el Client Secret sea válido
- Revisa que el proveedor esté habilitado

### Error: "access_denied"
- El usuario canceló la autorización
- Verifica que los permisos solicitados sean apropiados

## 📞 Soporte

Si tienes problemas con la configuración OAuth:

1. Revisa los logs del servidor de desarrollo
2. Verifica la configuración en cada proveedor
3. Consulta la documentación oficial de cada proveedor
4. Verifica que las URLs de callback sean exactas

## 📚 Documentación Oficial

- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Microsoft OAuth 2.0](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
- [Facebook Login](https://developers.facebook.com/docs/facebook-login/)
- [Apple Sign In](https://developer.apple.com/documentation/sign_in_with_apple)