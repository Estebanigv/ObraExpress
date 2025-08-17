@echo off
echo Iniciando servidor de desarrollo y abriendo Chrome...
start /B npm run dev
timeout /t 3 >nul
start chrome http://localhost:3000
echo Servidor iniciado. Chrome deberia abrirse automaticamente.
echo Presiona Ctrl+C para detener el servidor.