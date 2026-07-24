@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ============================================
echo  Configurar e-mail de confirmacao - Vistoria+
echo ============================================
echo.

if not exist node_modules (
  echo Instalando dependencias do projeto...
  call npm install
  echo.
)

if not exist .env (
  echo Nenhum .env encontrado. Rode primeiro o configurar-supabase.bat.
  pause
  exit /b 1
)

findstr /C:"SUPABASE_ACCESS_TOKEN=" .env >nul
if errorlevel 1 (
  echo Nao encontrei SUPABASE_ACCESS_TOKEN no .env.
  echo.
  echo Gere um Personal Access Token em:
  echo   https://supabase.com/dashboard/account/tokens
  echo ^(NAO e a anon key, e um token pessoal da sua conta^)
  echo.
  set /p TOKEN="Cole aqui o Personal Access Token: "
  echo SUPABASE_ACCESS_TOKEN=!TOKEN!>> .env
  echo.
)

findstr /C:"SUPABASE_SITE_URL=" .env >nul
if errorlevel 1 (
  echo.
  set /p SITEURL="URL do app apos confirmar o e-mail (Enter para usar http://localhost:5173/app.html): "
  if "!SITEURL!"=="" set SITEURL=http://localhost:5173/app.html
  echo SUPABASE_SITE_URL=!SITEURL!>> .env
)

echo.
echo Aplicando template de e-mail e Site URL no Supabase...
call npm run email:config
if errorlevel 1 (
  echo.
  echo Falha ao configurar o e-mail. Verifique o SUPABASE_ACCESS_TOKEN no .env.
  pause
  exit /b 1
)

echo.
echo Configurado com sucesso!
pause
