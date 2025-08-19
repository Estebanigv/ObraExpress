# 🚀 Guía de Deployment - POLIMAX

## Flujo de Trabajo

```
Local (desarrollo) → GitHub → Vercel (preview) → Hostinger (producción)
```

## 📋 Comandos Disponibles

### Desarrollo Local
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para Vercel
npm run lint         # Verificar código
```

### Para Hostinger (Export Estático)
```bash
npm run export              # Genera archivos estáticos
npm run deploy:hostinger    # Script completo de deploy
./deploy-hostinger.bat      # Script de Windows con interfaz
```

## 🔧 Configuración por Entorno

### Local (`npm run dev`)
- URL: `http://localhost:3000`
- Build: Desarrollo normal de Next.js
- Headers: Activados

### Vercel (Deploy automático desde GitHub)
- URL: `https://polimax-chile.vercel.app`
- Build: SSR de Next.js
- Headers: Activados
- Variables: Configuradas en `vercel.json`

### Hostinger (Deploy manual)
- URL: Tu dominio personalizado
- Build: Export estático (`output: 'export'`)
- Images: No optimizadas (`unoptimized: true`)
- Headers: Desactivados

## 📁 Estructura de Deploy

```
polimax-chile/
├── out/                    # Archivos generados para Hostinger
├── .env.local             # Variables locales
├── .env.example           # Plantilla de variables
├── vercel.json            # Configuración de Vercel
├── deploy-hostinger.bat   # Script de deploy a Hostinger
└── next.config.ts         # Configuración condicional
```

## 🛠️ Proceso Paso a Paso

### 1. Desarrollo Local
```bash
npm run dev
# Trabaja en localhost:3000
```

### 2. Subir a GitHub + Vercel
```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
# Vercel hace deploy automático
```

### 3. Deploy a Hostinger
```bash
npm run export
# o ejecuta deploy-hostinger.bat
# Sube el contenido de la carpeta 'out' a Hostinger
```

## ⚠️ Consideraciones Importantes

### Para Hostinger
- Solo archivos estáticos (HTML, CSS, JS)
- Sin server-side rendering
- Sin API routes de Next.js
- Imágenes no optimizadas automáticamente

### Para Vercel
- Full SSR support
- API routes funcionan
- Optimización automática de imágenes
- Headers de seguridad activados

## 🔍 Verificación

Antes de cada deploy, verifica:
- [ ] `npm run build` exitoso
- [ ] `npm run lint` sin errores
- [ ] Tests pasando (si tienes)
- [ ] Funcionalidad probada en local