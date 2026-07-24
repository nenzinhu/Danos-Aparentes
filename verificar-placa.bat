@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo  Vistoria+ - Verificando correcao da placa
echo ============================================
echo.

if not exist node_modules (
  echo Instalando dependencias do projeto...
  call npm install
  echo.
)

echo [1/2] Compilando o projeto (build) para checar erros...
call npm run build
if errorlevel 1 (
  echo.
  echo ============================================
  echo  FALHOU: o build encontrou erros acima.
  echo ============================================
  pause
  exit /b 1
)

echo.
echo Build OK! Nenhum erro de compilacao encontrado.
echo.
echo [2/2] Iniciando servidor de desenvolvimento para teste manual...
echo  - Abra a tela de Vistoria, digite uma placa com 7 caracteres
echo    (ex: ABC1D23) e confirme que todos os 7 aparecem no campo.
echo  - Gere um PDF de teste e confirme que a placa completa aparece
echo    no cabecalho do relatorio.
echo.

start "" "http://localhost:5173/app.html"
call npm run dev

pause
