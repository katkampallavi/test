@echo off
echo.
echo  ========================================
echo   PCOSense AI - Quick Start (Windows)
echo  ========================================
echo.

REM --- Backend ---
echo [1/2] Starting Backend...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt -q
if not exist ml_model\pcos_model.pkl (
    echo Training ML model (first time only)...
    python ml_model/train_model.py
)
start "PCOSense Backend" cmd /k "venv\Scripts\activate && python app.py"
cd ..

REM --- Frontend ---
echo [2/2] Starting Frontend...
cd frontend
if not exist node_modules (
    echo Installing npm packages...
    npm install
)
start "PCOSense Frontend" cmd /k "npm start"
cd ..

echo.
echo  ✅ Both servers starting...
echo  Backend  → http://localhost:5000
echo  Frontend → http://localhost:3000
echo.
pause
