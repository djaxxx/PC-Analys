@echo off
echo ========================================
echo   Construction de l'Agent PcAnalys
echo ========================================
echo.

REM Vérifier Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Node.js n'est pas installé.
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js détecté
echo.

REM Aller dans le dossier agent
cd agent

REM Installer les dépendances
echo Installation des dépendances...
npm install
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'installation des dépendances
    pause
    exit /b 1
)

REM Installer pkg globalement si nécessaire
echo.
echo Vérification de pkg...
pkg --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installation de pkg...
    npm install -g pkg
)

REM Construire l'exécutable
echo.
echo Construction de l'exécutable...
npm run build

REM Vérifier si la construction a réussi
if exist "pcanalys-agent.exe" (
    echo.
    echo ✅ Agent construit avec succès !
    echo 📁 Fichier: agent\pcanalys-agent.exe
    echo 📏 Taille: 
    dir pcanalys-agent.exe | findstr "pcanalys-agent.exe"
    echo.
    echo Pour tester l'agent:
    echo 1. Assurez-vous que le serveur backend est lancé
    echo 2. Exécutez: pcanalys-agent.exe
    echo.
) else (
    echo.
    echo ❌ Erreur lors de la construction
    echo Vérifiez les logs ci-dessus
    echo.
)

pause 