@echo off
echo ========================================
echo   PcAnalys - Lancement Client
echo ========================================
echo.
echo Ce script va lancer PcAnalys sur ce PC
echo pour analyser sa configuration.
echo.

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Node.js n'est pas installé sur ce PC.
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Vérifier si le dossier backend existe
if not exist "backend" (
    echo ERREUR: Le dossier 'backend' n'existe pas.
    echo Assurez-vous d'être dans le bon répertoire.
    pause
    exit /b 1
)

REM Installer les dépendances si nécessaire
if not exist "backend\node_modules" (
    echo Installation des dépendances...
    cd backend
    npm install
    cd ..
)

REM Lancer le backend
echo.
echo Lancement du serveur backend...
echo Le serveur sera accessible sur http://localhost:4000
echo.
echo Appuyez sur Ctrl+C pour arrêter le serveur
echo.

cd backend
npm start 