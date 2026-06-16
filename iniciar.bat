@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo  Vistoria+ - Iniciando
echo ============================================
echo.

if not exist node_modules (
  echo Instalando dependencias do projeto...
  call npm install
  echo.
)

echo Iniciando servidor de desenvolvimento...
echo (deixe esta janela aberta enquanto usa o app)
echo.

start "" "http://localhost:5173/app.html"
call npm run dev
pause
