@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ============================================
echo  Deploy para Vercel - Vistoria+
echo ============================================
echo.

where vercel >nul 2>nul
if errorlevel 1 (
  echo Vercel CLI nao encontrado, instalando globalmente...
  call npm install -g vercel
  echo.
)

if not exist .env (
  echo Arquivo .env nao encontrado. Rode configurar-supabase.bat primeiro.
  pause
  exit /b 1
)

set SUPA_URL=
set SUPA_KEY=
for /f "tokens=1,* delims==" %%A in ('findstr /B "VITE_SUPABASE_URL=" .env') do set SUPA_URL=%%B
for /f "tokens=1,* delims==" %%A in ('findstr /B "VITE_SUPABASE_ANON_KEY=" .env') do set SUPA_KEY=%%B

echo Login no Vercel (abre o navegador na primeira vez)...
call vercel login
echo.

echo Linkando o projeto a sua conta Vercel...
call vercel link --yes
echo.

if not "!SUPA_URL!"=="" (
  echo Configurando VITE_SUPABASE_URL no Vercel...
  call vercel env rm VITE_SUPABASE_URL production --yes >nul 2>nul
  echo !SUPA_URL!| vercel env add VITE_SUPABASE_URL production
)

if not "!SUPA_KEY!"=="" (
  echo Configurando VITE_SUPABASE_ANON_KEY no Vercel...
  call vercel env rm VITE_SUPABASE_ANON_KEY production --yes >nul 2>nul
  echo !SUPA_KEY!| vercel env add VITE_SUPABASE_ANON_KEY production
)

echo.
echo Fazendo deploy de producao...
call vercel --prod

echo.
echo ============================================
echo  Deploy concluido! Confira a URL acima.
echo ============================================
pause
