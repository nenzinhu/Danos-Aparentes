@echo off
TITLE Danos Aparentes - Abrir Aplicativo
mode con: cols=75 lines=20
color 0B

echo ===========================================================================
echo             DANOS APARENTES - SISTEMA DE VISTORIA DIGITAL
echo ===========================================================================
echo.
echo  [1/3] Verificando ambiente do sistema...
echo.

:: Verifica se o Node.js está instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO] Node.js nao encontrado no computador.
    echo Por favor, faca o download e instalacao em: https://nodejs.org/
    echo.
    pause
    exit /b
)

:: Libera a porta 3000 se houver processo travado
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo [INFO] Fechando processo antigo que ocupava a porta 3000 (PID %%a)...
    taskkill /F /PID %%a >nul 2>&1
)


:: Se node_modules não existir, instala automaticamente
if not exist node_modules (
    color 0E
    echo [AVISO] Dependencias nao encontradas. Instalando (aguarde um momento)...
    echo.
    call npm install
    color 0B
)

echo  [2/3] Iniciando o servidor de desenvolvimento...
echo  [3/3] Abrindo o aplicativo no seu navegador padrao...
echo.
echo ===========================================================================
echo  O aplicativo estara disponivel em: http://localhost:3000
echo  Para encerrar o aplicativo, basta fechar esta janela ou pressionar Ctrl+C.
echo ===========================================================================
echo.

:: Abre o navegador padrão na porta 3000
start "" "http://localhost:3000"

:: Executa o dev server
npm run dev

pause
