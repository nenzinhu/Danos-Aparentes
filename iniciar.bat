@echo off
TITLE Danos Aparentes - Iniciar Projeto
echo.
echo ======================================================
echo    INICIANDO PROJETO (DANOS APARENTES)
echo ======================================================
echo.

REM Verifica se a pasta node_modules existe na raiz
if not exist node_modules (
    echo [INFO] node_modules nao encontrada. Instalando dependencias...
    npm install
)

echo [INFO] Iniciando servidor Next.js...
start "" "http://localhost:3000"
npm run dev
