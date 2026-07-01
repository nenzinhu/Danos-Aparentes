@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title Danos Aparentes - Exportar contatos de WhatsApp

echo ============================================================
echo   EXPORTAR CONTATOS DE WHATSAPP
echo   (funilaria / pintura / martelinho com telefone)
echo ============================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado. Instale em https://nodejs.org
  pause
  exit /b 1
)

echo   1 - Usar lista de funilaria/pintura/martelinho (padrao)
echo   2 - Usar lista de TODAS as empresas
echo.
set "OP=1"
set /p OP="Escolha (Enter = 1): "

if "%OP%"=="2" (
  node scripts\email-marketing\exportar-whatsapp.mjs --fonte empresas-encontradas.csv
) else (
  node scripts\email-marketing\exportar-whatsapp.mjs
)

echo.
echo Resultado: scripts\email-marketing\whatsapp-contatos.csv
echo Abra o CSV e clique nos links wa.me para falar com cada empresa.
echo.
pause
