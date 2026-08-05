@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ============================================
echo  Configurar Supabase - Vistoria+
echo ============================================
echo.

if not exist node_modules (
  echo Instalando dependencias do projeto...
  call npm install
  echo.
)

if not exist .env (
  echo VITE_SUPABASE_URL=> .env
  echo VITE_SUPABASE_ANON_KEY=>> .env
)

findstr /C:"SUPABASE_DB_URL=" .env >nul
if errorlevel 1 (
  echo Nao encontrei SUPABASE_DB_URL no .env.
  echo.
  echo Pegue a connection string em:
  echo   Supabase ^> Project Settings ^> Database ^> Connection string ^(URI^)
  echo Substitua [YOUR-PASSWORD] pela senha real do banco.
  echo.
  set /p DBURL="Cole aqui a connection string: "
  echo SUPABASE_DB_URL=!DBURL!>> .env
  echo.
)

findstr /C:"VITE_SUPABASE_URL=https://SEU-PROJETO" .env >nul
if not errorlevel 1 (
  echo.
  set /p SUPAURL="Cole aqui a Project URL (ex: https://xxxx.supabase.co): "
  set /p SUPAKEY="Cole aqui a anon public key: "
  powershell -NoProfile -Command "(Get-Content .env) -replace 'VITE_SUPABASE_URL=.*', 'VITE_SUPABASE_URL=!SUPAURL!' -replace 'VITE_SUPABASE_ANON_KEY=.*', 'VITE_SUPABASE_ANON_KEY=!SUPAKEY!' | Set-Content .env"
)

echo.
echo Aplicando schema.sql no Supabase...
call npm run db:push
if errorlevel 1 (
  echo.
  echo Falha ao aplicar o schema. Verifique a connection string no .env.
  pause
  exit /b 1
)

echo.
echo Tudo certo! Login e sincronizacao ja estao ativos.
pause
