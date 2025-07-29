@echo off
echo ========================================
echo   PcAnalys - Lancement Complet
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

REM Installer les dépendances backend
echo Installation des dépendances backend...
cd backend
npm install
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'installation des dépendances backend
    pause
    exit /b 1
)

REM Installer les dépendances frontend
echo.
echo Installation des dépendances frontend...
cd ..\frontend-pure
npm install
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'installation des dépendances frontend
    pause
    exit /b 1
)

REM Lancer le backend
echo.
echo 🚀 Lancement du backend...
cd ..\backend
start "PcAnalys Backend" cmd /k "npm run dev"

REM Attendre que le backend démarre
timeout /t 3 /nobreak >nul

REM Lancer le frontend
echo.
echo 🌐 Lancement du frontend...
cd ..\frontend-pure
start "PcAnalys Frontend" cmd /k "npm run dev"

echo.
echo ✅ PcAnalys lancé avec succès !
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:4000
echo.
echo Pour construire l'agent:
echo cd agent && npm install && npm run build
echo.
pause 