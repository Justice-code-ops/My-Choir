@echo off
cd /d "c:\Users\HomePC\Documents\VOICE OF LIGHT\server"
echo Testing backend setup...
echo.
echo Checking Node.js:
node -v
echo.
echo Checking npm (using direct node.exe call):
node.exe "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" -v
echo.
echo Backend environment ready!
