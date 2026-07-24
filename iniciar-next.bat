@echo off
TITLE Danos Aparentes - Next.js Dev Server
echo.
echo ======================================================
echo    INICIANDO AMBIENTE DE DESENVOLVIMENTO (NEXT.JS)
echo ======================================================
echo.

REM Verifica se a pasta node_modules existe, se nao, instala dependencias
if not exist node_modules (
    echo [INFO] node_modules nao encontrada. Instalando dependencias...
    npm install
)

echo [INFO] Iniciando servidor Next.js em http://localhost:3000...
echo [INFO] Pressione Ctrl+C para encerrar.
echo.

REM Abre o navegador automaticamente apos 3 segundos
start "" "http://localhost:3000"

REM Inicia o comando de dev do Next.js
npm run dev
