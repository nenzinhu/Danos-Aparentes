@echo off
setlocal enabledelayedexpansion

echo.
echo ==========================================
echo   Danos Aparentes - Servidor local
echo ==========================================
echo.

set "REPO=C:\Users\Nenzinhu\Documents\GitHub\Danos-Aparentes"
set "NODE_DIR=C:\Program Files\nodejs"
set "PATH=%NODE_DIR%;%PATH%"

cd /d "%REPO%"

if not exist node_modules (
  echo [1/2] node_modules ausente. Rodando npm install...
  call npm install
  if errorlevel 1 (
    echo.
    echo Falha no npm install. Corrija o erro acima e tente novamente.
    pause
    exit /b 1
  )
) else (
  echo [1/2] node_modules ok.
)

echo [2/2] Iniciando Next.js em modo desenvolvimento...
echo.
call npm run dev

endlocal
