@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Danos Aparentes - Marketing por E-mail

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado. Instale em https://nodejs.org
  pause
  exit /b 1
)

:MENU
cls
echo ============================================================
echo    DANOS APARENTES - MARKETING POR E-MAIL
echo ============================================================
echo.
echo   Remetente: suporte@danosaparentes.com.br
echo.
echo   1 - Buscar empresas (funilaria / martelinho)
echo   2 - Buscar empresas + e-mails nos sites (enrich)
echo   3 - Enviar campanha - MODO TESTE (nao envia nada)
echo   4 - Enviar campanha - ENVIO REAL
echo   5 - Abrir pasta com os arquivos (CSV / modelos)
echo   0 - Sair
echo.
set "OP="
set /p OP="Escolha uma opcao: "

if "%OP%"=="1" goto BUSCAR
if "%OP%"=="2" goto BUSCAR_ENRICH
if "%OP%"=="3" goto TESTE
if "%OP%"=="4" goto ENVIAR
if "%OP%"=="5" goto PASTA
if "%OP%"=="0" exit /b 0
goto MENU

:BUSCAR
cls
set "UF=SC"
set /p UF_IN="Sigla do estado (Enter = SC): "
if not "%UF_IN%"=="" set "UF=%UF_IN%"
set "CIDADE="
set /p CIDADE="Cidade especifica (Enter = estado inteiro): "
echo.
if "%CIDADE%"=="" (
  node scripts\email-marketing\buscar-empresas.mjs --uf %UF%
) else (
  node scripts\email-marketing\buscar-empresas.mjs --uf %UF% --cidade "%CIDADE%"
)
echo.
pause
goto MENU

:BUSCAR_ENRICH
cls
set "UF=SC"
set /p UF_IN="Sigla do estado (Enter = SC): "
if not "%UF_IN%"=="" set "UF=%UF_IN%"
set "CIDADE="
set /p CIDADE="Cidade especifica (Enter = estado inteiro): "
echo.
echo Buscando e-mails nos sites... pode demorar alguns minutos.
echo.
if "%CIDADE%"=="" (
  node scripts\email-marketing\buscar-empresas.mjs --uf %UF% --enrich
) else (
  node scripts\email-marketing\buscar-empresas.mjs --uf %UF% --cidade "%CIDADE%" --enrich
)
echo.
pause
goto MENU

:TESTE
cls
echo MODO TESTE - nenhum e-mail sera enviado.
echo Gera um preview do primeiro e-mail da lista.
echo.
node scripts\email-marketing\enviar-campanha.mjs --dry-run
echo.
pause
goto MENU

:ENVIAR
cls
echo ************************************************************
echo   ATENCAO: este modo ENVIA e-mails de verdade.
echo   Confira o destinatarios.csv antes de continuar.
echo ************************************************************
echo.
set "CONF="
set /p CONF="Digite ENVIAR para confirmar (ou Enter para cancelar): "
if /i not "%CONF%"=="ENVIAR" (
  echo Cancelado.
  pause
  goto MENU
)
echo.
node scripts\email-marketing\enviar-campanha.mjs
echo.
pause
goto MENU

:PASTA
start "" "%~dp0scripts\email-marketing"
goto MENU
