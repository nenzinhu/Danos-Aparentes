@echo off
cd /d "%~dp0"
set BACKUP_DIR=%~dp0..\BACKUP_AvariasAPARENTES_%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%
echo Criando backup em: %BACKUP_DIR%
robocopy "%~dp0" "%BACKUP_DIR%" /E /XD node_modules dist .git /XF *.log
echo.
echo Backup concluido!
echo Local: %BACKUP_DIR%
pause
