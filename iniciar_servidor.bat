@echo off
title Servidor de Vistoria Veicular - DEV + ABRIR
echo =====================================================================
echo    Servidor de Desenvolvimento VITE - Vistoria Veicular
echo =====================================================================
echo.
echo Iniciando o servidor React/TypeScript (Vite) e abrindo no navegador...
echo.
echo DICA: Se for o primeiro acesso, certifique-se de que rodou 'npm install'
echo.
echo =====================================================================
echo O servidor vai rodar em: http://127.0.0.1:5173
echo Se a porta estiver ocupada, finalize o processo e tente novamente.
echo =====================================================================
echo.
start "Vite Dev Server" cmd /k npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:5173/"
pause
