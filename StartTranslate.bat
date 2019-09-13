@echo off
SET mypath=%~dp0
SET GOOGLE_APPLICATION_CREDENTIALS=%mypath:~0,-1%\translateapi-file-fromGoogleCloud.json
echo Setuped Google credentials to: "%GOOGLE_APPLICATION_CREDENTIALS%"
echo Starting Node Translator by TheMaoci
node index.js
pause