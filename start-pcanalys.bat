@echo off
echo ========================================
echo   PcAnalys - Lancement Complet
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

REM Vérifier les dossiers nécessaires
if not exist "backend" (
    echo ERREUR: Le dossier 'backend' n'existe pas.
    pause
    exit /b 1
)

if not exist "frontend-pure" (
    echo ERREUR: Le dossier 'frontend-pure' n'existe pas.
    pause
    exit /b 1
)

REM Installer les dépendances backend si nécessaire
if not exist "backend\node_modules" (
    echo Installation des dépendances backend...
    cd backend
    npm install
    cd ..
)

REM Installer les dépendances frontend si nécessaire
if not exist "frontend-pure\node_modules" (
    echo Installation des dépendances frontend...
    cd frontend-pure
    npm install
    cd ..
)

REM Modifier la configuration frontend pour utiliser localhost
echo Configuration du frontend pour localhost...
cd frontend-pure
echo module.exports = { async rewrites() { return [{ source: '/api/:path*', destination: 'http://localhost:4000/api/:path*' }]; } }; > next.config.js
cd ..

echo.
echo ========================================
echo   Démarrage de PcAnalys
echo ========================================
echo.
echo 1. Lancement du backend sur le port 4000...
echo 2. Lancement du frontend sur le port 3000...
echo.
echo L'interface sera accessible sur: http://localhost:3000
echo.
echo Appuyez sur Ctrl+C dans chaque fenêtre pour arrêter
echo.

REM Lancer le backend en arrière-plan
start "PcAnalys Backend" cmd /k "cd backend && npm start"

REM Attendre un peu que le backend démarre
timeout /t 3 /nobreak >nul

REM Lancer le frontend
start "PcAnalys Frontend" cmd /k "cd frontend-pure && npm run dev"

echo.
echo PcAnalys est en cours de démarrage...
echo.
echo Backend: http://localhost:4000
echo Frontend: http://localhost:3000
echo.
pause 