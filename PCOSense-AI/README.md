# 🌸 PCOSense AI — Smart PCOS Detection & Lifestyle Management Platform

A full-stack AI-powered web application to help women detect PCOS risk early, track menstrual cycles, and receive personalised lifestyle recommendations.

---

## 🚀 Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | React.js, TailwindCSS, Chart.js          |
| Backend     | Python Flask, Flask-JWT-Extended         |
| Database    | SQLite (via SQLAlchemy)                 |
| ML Model    | Scikit-learn (Random Forest Classifier) |
| Charts      | Chart.js + react-chartjs-2              |

---

## ✨ Features

- 🔬 **PCOS Risk Prediction** — AI model predicts Low / Medium / High risk with confidence
- 📅 **Cycle Tracker** — Log periods, symptoms, mood & weight with visual charts
- 🥗 **Diet Recommendations** — BMI-personalised PCOS meal plans
- 🏃‍♀️ **Exercise Plans** — PCOS-friendly workouts from beginner to advanced
- 💬 **AI Chatbot** — Answers 100+ PCOS questions with medical knowledge
- 📊 **Dashboard** — All health data in one view with charts
- 🔐 **Authentication** — Secure JWT-based login/register

---

## 📁 Project Structure

```
PCOSense-AI/
├── backend/
│   ├── app.py                  # Flask app entry point
│   ├── config.py               # App configuration
│   ├── models.py               # SQLAlchemy database models
│   ├── requirements.txt        # Python dependencies
│   ├── routes/
│   │   ├── auth.py             # Login, register, profile APIs
│   │   ├── prediction.py       # ML prediction API
│   │   ├── tracker.py          # Cycle tracking API
│   │   ├── recommendations.py  # Diet & exercise API
│   │   └── chatbot.py          # AI chatbot API
│   └── ml_model/
│       ├── train_model.py      # Train and save ML model
│       └── predict.py          # Load model and predict
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js              # Router + auth wrapper
│   │   ├── index.js
│   │   ├── index.css           # Tailwind + global styles
│   │   ├── context/
│   │   │   └── AuthContext.js  # Global auth state
│   │   ├── utils/
│   │   │   └── api.js          # Axios with JWT interceptors
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   └── pages/
│   │       ├── Landing.js
│   │       ├── Login.js
│   │       ├── Register.js
│   │       ├── Dashboard.js
│   │       ├── Prediction.js
│   │       ├── Tracker.js
│   │       ├── DietExercise.js
│   │       ├── Chatbot.js
│   │       └── Profile.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── database/
│   └── pcosense.db             # Auto-created on first run
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **Python 3.8+** → https://python.org
- **Node.js 18+** → https://nodejs.org
- **VS Code** → https://code.visualstudio.com

---

### Step 1 — Clone / Open the Project

Open the `PCOSense-AI` folder in VS Code.

---

### Step 2 — Set Up the Backend

Open a terminal in VS Code (`Ctrl + `` ` ``):

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train the ML model (IMPORTANT — do this first!)
python ml_model/train_model.py

# Start the backend server
python app.py
```

✅ Backend will run at: **http://localhost:5000**

---

### Step 3 — Set Up the Frontend

Open a **second terminal** in VS Code:

```bash
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Start the React app
npm start
```

✅ Frontend will open at: **http://localhost:3000**

---

## 🔑 First-Time Use

1. Visit http://localhost:3000
2. Click **"Get Started Free"**
3. Register with your name, email and password
4. Go to **PCOS Check** → fill in your details → run the assessment
5. Log your first cycle in **Cycle Tracker**
6. View your **Diet Plan** based on your BMI
7. Chat with the **AI Assistant** about any PCOS question

---

## 🧠 Machine Learning Details

- **Algorithm:** Random Forest Classifier (200 trees)
- **Features:** Age, BMI, Cycle Length, Weight Gain, Acne, Hair Growth, Skin Darkening
- **Output:** Risk level (Low / Medium / High) + confidence percentage
- **Training:** Synthetic dataset of 3,000 samples based on real-world PCOS medical correlations
- **Accuracy:** ~85% on test set

To retrain the model:
```bash
cd backend
python ml_model/train_model.py
```

---

## 🌐 API Endpoints

| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | `/api/auth/register`              | Register new user        |
| POST   | `/api/auth/login`                 | Login                    |
| GET    | `/api/auth/profile`               | Get profile              |
| PUT    | `/api/auth/profile`               | Update profile           |
| POST   | `/api/prediction/predict`         | Run PCOS risk prediction |
| GET    | `/api/prediction/latest`          | Latest prediction        |
| GET    | `/api/prediction/history`         | Prediction history       |
| POST   | `/api/tracker/log`                | Log cycle record         |
| GET    | `/api/tracker/records`            | Get all records          |
| GET    | `/api/tracker/stats`              | Cycle statistics         |
| DELETE | `/api/tracker/records/<id>`       | Delete a record          |
| GET    | `/api/recommendations/`           | Diet & exercise plans    |
| POST   | `/api/chatbot/message`            | Chat with AI             |

---

## ⚕️ Disclaimer

> PCOSense AI is for **educational and informational purposes only**.  
> It is **not a substitute** for professional medical advice, diagnosis, or treatment.  
> Always consult a qualified healthcare professional for PCOS concerns.

---

## 👩‍💻 Built With ❤️ for Women's Health
