@echo off
echo Liberando puerto 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000"') do (
    echo Matando proceso %%a en puerto 3000
    taskkill /f /pid %%a
)
echo Puerto 3000 liberado
npm run dev