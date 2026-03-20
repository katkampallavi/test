import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const boolField = (label, name, val, onChange, icon, desc) => (
  <div className="bg-pink-50 rounded-xl p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="font-semibold text-gray-700 text-sm">{label}</div>
          {desc && <div className="text-xs text-gray-400">{desc}</div>}
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={val === 1}
          onChange={e => onChange(name, e.target.checked ? 1 : 0)} />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-300 rounded-full peer peer-checked:bg-pink-500 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
      </label>
    </div>
  </div>
);

export default function Prediction() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    age: user?.age || '',
    bmi: user?.bmi || '',
    cycle_length: '',
    weight_gain: 0,
    acne: 0,
    hair_growth: 0,
    skin_darkening: 0,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const setVal   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setBool  = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async e => {
    e.preventDefault();
    if (!form.age || !form.bmi || !form.cycle_length) {
      toast.error('Please fill age, BMI, and cycle length');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/prediction/predict', {
        age: Number(form.age),
        bmi: Number(form.bmi),
        cycle_length: Number(form.cycle_length),
        weight_gain: form.weight_gain,
        acne: form.acne,
        hair_growth: form.hair_growth,
        skin_darkening: form.skin_darkening,
      });
      setResult(res.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Prediction failed. Make sure the backend ML model is trained.');
    } finally {
      setLoading(false);
    }
  };

  const riskColors = { Low:'#22c55e', Medium:'#f59e0b', High:'#ef4444' };
  const riskBg     = { Low:'bg-green-50 border-green-200', Medium:'bg-yellow-50 border-yellow-200', High:'bg-red-50 border-red-200' };
  const riskText   = { Low:'text-green-700', Medium:'text-yellow-700', High:'text-red-700' };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-display font-bold text-gray-800 mb-2">PCOS Risk Assessment 🔬</h1>
        <p className="text-gray-500">Answer a few questions and our AI will evaluate your PCOS risk profile</p>
      </div>

      {/* Result */}
      {result && (
        <div className={`card border-2 ${riskBg[result.risk_level]} animate-slide-up`}>
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">
              {result.risk_level === 'Low' ? '🟢' : result.risk_level === 'Medium' ? '🟡' : '🔴'}
            </div>
            <h2 className="text-3xl font-display font-bold" style={{ color: riskColors[result.risk_level] }}>
              {result.risk_level} Risk
            </h2>
            <p className="text-2xl font-bold text-gray-700 mt-1">{result.confidence}% Confidence</p>
            <p className={`text-sm mt-3 ${riskText[result.risk_level]}`}>{result.description}</p>
          </div>

          {/* Probability bar chart */}
          <div className="mb-6">
            <Bar
              data={{
                labels: ['Low Risk', 'Medium Risk', 'High Risk'],
                datasets: [{
                  data: [result.probabilities.Low, result.probabilities.Medium, result.probabilities.High],
                  backgroundColor: ['#22c55e80', '#f59e0b80', '#ef444480'],
                  borderColor: ['#22c55e', '#f59e0b', '#ef4444'],
                  borderWidth: 2,
                  borderRadius: 8,
                }]
              }}
              options={{ responsive:true, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, max:100, ticks:{ callback: v => `${v}%` } } } }}
            />
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-3">Personalised Recommendations:</h3>
            <ul className="space-y-2">
              {result.advice.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-pink-500 mt-0.5 shrink-0">✦</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-gray-400 mt-4 text-center">
            ⚕️ This is an AI-based risk estimate only — not a medical diagnosis. Please consult a healthcare professional.
          </p>
        </div>
      )}

      {/* Form */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Your Health Profile</h2>
        <form onSubmit={submit} className="space-y-6">

          {/* Numeric inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Age (years) *</label>
              <input type="number" min="10" max="80" required value={form.age}
                onChange={e => setVal('age', e.target.value)} className="input-field" placeholder="e.g. 25" />
            </div>
            <div>
              <label className="label">BMI *
                <span className="text-xs font-normal text-gray-400 ml-1">
                  {user?.bmi ? `(yours: ${user.bmi})` : '(weight÷height²)'}
                </span>
              </label>
              <input type="number" step="0.1" min="10" max="60" required value={form.bmi}
                onChange={e => setVal('bmi', e.target.value)} className="input-field" placeholder="e.g. 24.5" />
            </div>
            <div>
              <label className="label">Cycle Length (days) *</label>
              <input type="number" min="10" max="90" required value={form.cycle_length}
                onChange={e => setVal('cycle_length', e.target.value)} className="input-field" placeholder="e.g. 28" />
              <p className="text-xs text-gray-400 mt-1">Normal: 21–35 days</p>
            </div>
          </div>

          {/* Symptom toggles */}
          <div>
            <h3 className="font-bold text-gray-700 mb-3">Symptoms (toggle if present)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {boolField('Unexplained Weight Gain', 'weight_gain', form.weight_gain, setBool, '⚖️', 'Gained weight without significant diet change')}
              {boolField('Acne / Oily Skin', 'acne', form.acne, setBool, '🫧', 'Persistent acne, especially on jawline or chin')}
              {boolField('Excess Hair Growth', 'hair_growth', form.hair_growth, setBool, '🪒', 'Unusual facial/body hair (hirsutism)')}
              {boolField('Skin Darkening', 'skin_darkening', form.skin_darkening, setBool, '🫁', 'Dark patches on neck, armpits or groin')}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full text-lg py-3.5">
            {loading ? '⏳ Analysing…' : '🔬 Analyse My Risk'}
          </button>
        </form>
      </div>

      <div className="text-center text-xs text-gray-400">
        ⚕️ For educational purposes only. Always consult a licensed medical professional for diagnosis.
      </div>
    </div>
  );
}
