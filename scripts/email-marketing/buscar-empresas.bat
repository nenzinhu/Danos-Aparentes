@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0..\.."

echo ============================================================
echo   Buscador de empresas - Funilaria / Martelinho
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
set /p ENR="Buscar e-mail nos sites das empresas? (s/N): "
if /i "%ENR%"=="s" set "ENRICH=--enrich"

echo.
echo Buscando... isso pode levar de 30s a alguns minutos.
echo.

if "%CIDADE%"=="" (
  node scripts\email-marketing\buscar-empresas.mjs --uf %UF% %ENRICH%
) else (
  node scripts\email-marketing\buscar-empresas.mjs --uf %UF% --cidade "%CIDADE%" %ENRICH%
)

echo.
echo Resultado salvo em: scripts\email-marketing\empresas-encontradas.csv
echo.
pause
