@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title Danos Aparentes - Buscar Funilaria / Pintura / Martelinho

echo ============================================================
echo   BUSCAR EMPRESAS - Funilaria / Pintura / Martelinho de Ouro
echo   (sem mecanica ou auto eletrica generica)
echo   Fonte: OpenStreetMap (dados abertos)
echo ============================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado. Instale em https://nodejs.org
  pause
  exit /b 1
)

set "UF=SC"
set /p UF_IN="Sigla do estado (Enter = SC): "
if not "%UF_IN%"=="" set "UF=%UF_IN%"

set "CIDADE="
set /p CIDADE="Cidade especifica (Enter = estado inteiro): "

set "ENRICH="
set /p ENR="Tentar achar e-mail nos sites das empresas? (s/N): "
if /i "%ENR%"=="s" set "ENRICH=--enrich"

echo.
echo Buscando funilarias/pinturas/martelinho... aguarde.
echo.

if "%CIDADE%"=="" (
  node scripts\email-marketing\buscar-funilaria.mjs --uf %UF% %ENRICH%
) else (
  node scripts\email-marketing\buscar-funilaria.mjs --uf %UF% --cidade "%CIDADE%" %ENRICH%
)

echo.
echo Resultado salvo em:
echo   scripts\email-marketing\funilarias-encontradas.csv
echo.
pause
