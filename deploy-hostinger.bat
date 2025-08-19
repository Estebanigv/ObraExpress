@echo off
echo ================================
echo   DEPLOY A HOSTINGER - POLIMAX
echo ================================
echo.

echo 1. Generando build estatico...
set STATIC_EXPORT=true
call npm run build

if %errorlevel% neq 0 (
    echo ERROR: Build fallido
    pause
    exit /b 1
)

echo.
echo 2. Build completado exitosamente!
echo.
echo 3. Archivos listos en la carpeta 'out'
echo.
echo SIGUIENTE PASO:
echo - Sube todo el contenido de la carpeta 'out' a tu hosting en Hostinger
echo - Asegurate de subir los archivos al directorio raiz de tu dominio
echo.
pause