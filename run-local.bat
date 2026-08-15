@echo off
REM ============================================================
REM  Danos Aparentes - Servidor local (Next.js dev)
REM  Uso: dê 2 cliques neste arquivo (ou rode no terminal).
REM  Acessar: http://localhost:3000
REM ============================================================
SETLOCAL
cd /d "%~dp0"

SET PORT=3000

REM Garante que node/npm estejam no PATH (funciona mesmo em cmd puro)
SET "NODE_BIN=C:\Program Files\nodejs"
IF EXIST "%NODE_BIN%\node.exe" (SET "PATH=%NODE_BIN%;%PATH%")

echo [Danos Aparentes] Node: 
where node 2>nul || echo   (node nao encontrado no PATH)
echo [Danos Aparentes] Pasta: %CD%
echo [Danos Aparentes] Porta: %PORT%

REM Libera a porta 3000 (se houver processo antigo) via PowerShell
powershell -NoProfile -Command "try{(Get-NetTCPConnection -LocalPort %PORT% -ErrorAction SilentlyContinue).OwningProcess | ForEach-Object{Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue}}catch{}"

REM Garante .next limpo para nao misturar cache do build de producao
if exist ".next" (
  echo [Danos Aparentes] Limpando .next...
  rmdir /s /q ".next" >nul 2>&1
)

echo [Danos Aparentes] Iniciando servidor (npm run dev)...
echo [Danos Aparentes] Aguarde "Ready" e abra http://localhost:%PORT%
echo.

call npm run dev -- -p %PORT%

ENDLOCAL
