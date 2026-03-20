#!/bin/bash
echo ""
echo "========================================"
echo "  PCOSense AI - Quick Start (Mac/Linux)"
echo "========================================"
echo ""

# Backend
echo "[1/2] Setting up Backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt -q

if [ ! -f "ml_model/pcos_model.pkl" ]; then
    echo "Training ML model (first time only)..."
    python ml_model/train_model.py
fi

# Start backend in background
python app.py &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

cd ..

# Frontend
echo ""
echo "[2/2] Setting up Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install
fi
npm start &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"
cd ..

echo ""
echo "Both servers are running:"
echo "  Backend  → http://localhost:5000"
echo "  Frontend → http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers."
wait
