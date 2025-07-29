@echo off
echo ========================================
echo   PcAnalys - Lancement Frontend
echo ========================================
echo.
echo Ce script va lancer l'interface web PcAnalys
echo connectée au backend local.
echo.

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Node.js n'est pas installé sur ce PC.
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Vérifier si le dossier frontend-pure existe
if not exist "frontend-pure" (
    echo ERREUR: Le dossier 'frontend-pure' n'existe pas.
    echo Assurez-vous d'être dans le bon répertoire.
    pause
    exit /b 1
)

REM Installer les dépendances si nécessaire
if not exist "frontend-pure\node_modules" (
    echo Installation des dépendances...
    cd frontend-pure
    npm install
    cd ..
)

REM Modifier temporairement la configuration pour utiliser localhost
echo Modification de la configuration pour localhost...
cd frontend-pure
echo module.exports = { async rewrites() { return [{ source: '/api/:path*', destination: 'http://localhost:4000/api/:path*' }]; } }; > next.config.js

REM Lancer le frontend
echo.
echo Lancement de l'interface web...
echo L'interface sera accessible sur http://localhost:3000
echo.
echo Assurez-vous que le backend est lancé sur le port 4000
echo Appuyez sur Ctrl+C pour arrêter le serveur
echo.

npm run dev 