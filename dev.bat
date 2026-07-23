@echo off
title Avarias APARENTES - Ambiente de Desenvolvimento
echo ====================================================
echo    Avarias APARENTES PWA - Setup e Execucao
echo ====================================================
echo.

:: Verifica se o Node.js está instalado
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado. Por favor, instale o Node.js para continuar.
    echo Baixe em: https://nodejs.org/
    pause
    exit /b
)

:: Verifica se a pasta node_modules existe, se não, instala as dependências
if not exist "node_modules\" (
    echo [INFO] Instalando dependencias (isso pode levar alguns minutos na primeira vez)...
    call npm install --silent
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar dependencias. Verifique sua conexao.
        pause
        exit /b
    )
    echo [OK] Dependencias instaladas com sucesso.
)

echo.
echo [INFO] Iniciando o servidor de desenvolvimento...
echo [DICA] O app abrira no seu navegador padrao em breve.
echo [DICA] Pressione Ctrl+C para encerrar o servidor.
echo.

:: Inicia o servidor Vite e abre o navegador
call npm run dev -- --open

pause
