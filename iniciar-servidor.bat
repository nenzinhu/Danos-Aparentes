@echo off
setlocal enabledelayedexpansion
title Danos Aparentes - Servidor Next.js

echo ============================================
echo   DANOS APARENTES - Iniciar Projeto
echo ============================================
echo.

cd /d "%~dp0"

echo [1/3] Verificando node_modules...
if not exist node_modules (
    echo Instalando dependencias (primeira execucao)...
    call npm install
    if errorlevel 1 (
        echo ERRO ao instalar dependencias.
        pause
        exit /b 1
    )
) else (
    echo Dependencias OK.
)

echo.
echo [2/3] Iniciando servidor Next.js...
echo URL: http://localhost:3000
echo Pressione Ctrl+C para parar.
echo.

start "" http://localhost:3000

npx next dev --port 3000

echo.
echo [3/3] Servidor encerrado.
echo.
pause
