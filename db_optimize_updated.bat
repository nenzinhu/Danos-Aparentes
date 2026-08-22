@echo off
rem ------------------------------------------------------------
rem db_optimize.bat – Criação automática de índices PostgreSQL
rem ------------------------------------------------------------

rem ---------- 1. Verificar variável de conexão ----------
rem Formato esperado:  postgres://usuario:senha@host:porta/banco
if "%SUPABASE_DB_URL%"=="" (
    echo.
    echo ==============================
    echo ERRO: variável de ambiente SUPABASE_DB_URL não está definida.
    echo Defina-a antes de executar o script, por exemplo:
    echo   set SUPABASE_DB_URL=postgres://usuario:senha@host:5432/nomedb
    echo ==============================
    exit /b 1
)

rem ---------- 2. Função auxiliar para executar SQL ----------
:exec_sql
set "SQL=%~1"
psql "%SUPABASE_DB_URL%" -c "%SQL%"
if errorlevel 1 (
    echo ERRO ao executar: %SQL%
    exit /b 1
)
goto :eof

rem ------------------------------------------------------------
rem Definições dos índices (adicione ou remova conforme necessidade)
rem ------------------------------------------------------------

rem 1. Índice para buscas rápidas de inspeções por usuário
call :exec_sql "CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_user_id ON public.vehicle_inspections (user_id);"

rem 2. Índice composto para filtros frequentes na listagem de veículos
call :exec_sql "CREATE INDEX IF NOT EXISTS idx_vehicles_status_type ON public.vehicles (status, vehicle_type);"

rem 3. Índice para busca por placa
call :exec_sql "CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON public.vehicles (plate);"

rem 4. Índice para acelerar junções entre inspeções e veículos
call :exec_sql "CREATE INDEX IF NOT EXISTS idx_inspections_vehicle_id ON public.vehicle_inspections (vehicle_id);"

rem 5. Índice adicional para data de inspeção (queries por período)
call :exec_sql "CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_date ON public.vehicle_inspections (inspection_date);"

rem ------------------------------------------------------------
rem 6. Finalização
rem ------------------------------------------------------------
echo.
echo ==============================
echo  Índices criados/verificados com sucesso!
echo ==============================
pause
