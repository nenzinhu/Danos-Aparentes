@echo off
setlocal enabledelayedexpansion

rem ------------------------------------------------------------
rem db_optimize.bat - Automated PostgreSQL index creation
rem ------------------------------------------------------------

echo Checking environment...

rem 1. Check if psql is installed
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: 'psql' command not found. 
    echo Please install PostgreSQL client tools or ensure they are in your PATH.
    echo Tip: You can install it via 'winget install PostgreSQL.PostgreSQL'
    goto :error_exit
)

rem 2. Ensure SUPABASE_DB_URL is set
if "%SUPABASE_DB_URL%"=="" (
    echo ERROR: SUPABASE_DB_URL environment variable not set.
    echo.
    echo Please set it before running:
    echo   set SUPABASE_DB_URL=postgresql://user:password@host:port/database
    goto :error_exit
)

rem 3. Check for placeholder password
echo %SUPABASE_DB_URL% | findstr /C:"[YOUR-PASSWORD]" >nul
if %errorlevel% eq 0 (
    echo ERROR: Your SUPABASE_DB_URL still contains "[YOUR-PASSWORD]".
    echo Please replace it with your actual database password.
    goto :error_exit
)

echo Starting optimization...

rem -- Helper to execute a SQL statement via psql
call :exec_sql "CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_user_id ON public.vehicle_inspections (user_id);"
call :exec_sql "CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_type_city ON public.vehicle_inspections (vehicle_type, city);"
call :exec_sql "CREATE INDEX IF NOT EXISTS idx_damages_inspection_id ON public.damages (inspection_id);"
call :exec_sql "CREATE INDEX IF NOT EXISTS idx_damages_vehicle ON public.damages (vehicle);"
call :exec_sql "CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions (user_id);"
call :exec_sql "CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions (status);"
call :exec_sql "CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_created_at ON public.vehicle_inspections (created_at DESC);"
call :exec_sql "CREATE INDEX IF NOT EXISTS idx_damages_created_at ON public.damages (created_at DESC);"
call :exec_sql "CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON public.subscriptions (created_at DESC);"
call :exec_sql "CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_plate ON public.vehicle_inspections (plate);"
call :exec_sql "DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='damages' AND column_name='part_id') THEN EXECUTE 'CREATE INDEX IF NOT EXISTS idx_damages_part_id ON public.damages (part_id)'; END IF; END $$;"

echo.
echo All indexes have been processed successfully.
pause
exit /b 0

:exec_sql
set "SQL=%~1"
psql "%SUPABASE_DB_URL%" -c "%SQL%"
if %errorlevel% neq 0 (
    echo.
    echo ERROR executing: %SQL%
    goto :error_exit
)
goto :eof

:error_exit
echo.
echo Optimization failed.
pause
exit /b 1
