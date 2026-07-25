@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ============================================================
echo   Danos Aparentes — Buscador de LOCADORAS
echo   Fonte: OpenStreetMap (dados abertos)
echo   Saida: scripts\email-marketing\locadoras-encontradas.csv
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
set /p CIDADE="Cidade especifica (Enter = estado inteiro; recomendado informar cidade): "

set "ENRICH="
set /p ENR="Buscar e-mail nos sites das empresas? (s/N): "
if /i "%ENR%"=="s" set "ENRICH=--enrich"

set "SOEMAIL="
set /p SOE="Exportar so linhas com e-mail? (s/N): "
if /i "%SOE%"=="s" set "SOEMAIL=--so-com-email"

echo.
echo Buscando... isso pode levar de 30s a alguns minutos.
echo.

if "%CIDADE%"=="" (
  node scripts\email-marketing\buscar-locadoras.mjs --uf %UF% %ENRICH% %SOEMAIL%
) else (
  node scripts\email-marketing\buscar-locadoras.mjs --uf %UF% --cidade "%CIDADE%" %ENRICH% %SOEMAIL%
)

echo.
echo Resultado: scripts\email-marketing\locadoras-encontradas.csv
echo.
pause
