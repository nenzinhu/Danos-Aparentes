@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ============================================
echo  Atualizar e Publicar - Vistoria+ (Vercel)
echo ============================================
echo.

where vercel >nul 2>nul
if errorlevel 1 (
  echo Vercel CLI nao encontrado, instalando globalmente...
  call npm install -g vercel
  echo.
)

if not exist .vercel (
  echo.
  echo Este projeto ainda nao foi linkado ao Vercel.
  echo Rode primeiro o deploy-vercel.bat para fazer login/link/configurar variaveis.
  echo.
  pause
  exit /b 1
)

echo Instalando/atualizando dependencias...
call npm install
if errorlevel 1 (
  echo.
  echo Falha ao instalar dependencias. Verifique os erros acima.
  pause
  exit /b 1
)

echo.
echo Gerando build de producao...
call npm run build
if errorlevel 1 (
  echo.
  echo Build falhou. Corrija os erros acima antes de publicar.
  pause
  exit /b 1
)

echo.
echo Publicando atualizacao no Vercel (producao)...
call vercel --prod
if errorlevel 1 (
  echo.
  echo Falha ao publicar no Vercel. Verifique os erros acima.
  pause
  exit /b 1
)

echo.
echo ============================================
echo  Atualizacao publicada com sucesso!
echo  Confira a URL de producao acima.
echo ============================================
pause
