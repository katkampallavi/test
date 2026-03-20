import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

function MealCard({ time, emoji, items }) {
  return (
    <div className="bg-white rounded-xl border border-pink-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{emoji}</span>
        <span className="font-bold text-gray-800">{time}</span>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
            <span className="text-pink-400 mt-0.5 shrink-0">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExerciseCard({ ex }) {
  return (
    <div className="card hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="flex items-start gap-4">
        <div className="text-4xl">{ex.icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
            <h3 className="font-bold text-gray-800">{ex.name}</h3>
            <span className="bg-pink-100 text-pink-700 text-xs font-semibold px-2 py-1 rounded-full">{ex.frequency}</span>
          </div>
          <p className="text-sm text-gray-500 mb-2">{ex.benefit}</p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>⏱ {ex.duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DietExercise() {
  const [data, setData]   = useState(null);
  const [tab, setTab]     = useState('diet');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/recommendations/')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load recommendations'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { diet, exercise, bmi } = data || {};

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-display font-bold text-gray-800 mb-2">Diet & Exercise 🥗</h1>
        <p className="text-gray-500">Personalised recommendations based on your BMI ({bmi || '—'})</p>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-pink-100 rounded-2xl p-1 max-w-sm mx-auto">
        {[['diet','🥗 Diet Plan'], ['exercise','🏃‍♀️ Workouts']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === key ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-600 hover:text-pink-600'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'diet' && diet && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-5 border border-pink-100">
            <h2 className="font-display text-xl font-bold text-gray-800 mb-1">📋 {diet.label}</h2>
            <p className="text-pink-700 font-semibold text-sm">🎯 Goal: {diet.goal}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MealCard time="Breakfast" emoji="🌅" items={diet.breakfast} />
            <MealCard time="Lunch" emoji="☀️" items={diet.lunch} />
            <MealCard time="Dinner" emoji="🌙" items={diet.dinner} />
            <MealCard time="Snacks" emoji="🍎" items={diet.snacks} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-xl border border-red-100 p-4">
              <h3 className="font-bold text-red-700 mb-3">❌ Foods to Avoid</h3>
              <ul className="space-y-1.5">
                {diet.avoid.map((item, i) => (
                  <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                    <span className="shrink-0">✕</span>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
              <h3 className="font-bold text-blue-700 mb-3">💊 Evidence-Based Supplements</h3>
              <ul className="space-y-1.5">
                {diet.supplements.map((s, i) => (
                  <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                    <span className="shrink-0">✦</span>{s}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-400 mt-3">⚕️ Consult your doctor before starting supplements</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'exercise' && exercise && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-5 border border-orange-100">
            <h2 className="font-display text-xl font-bold text-gray-800 mb-1">🏋️‍♀️ {exercise.label}</h2>
            <p className="text-orange-700 font-semibold text-sm">🎯 Weekly Goal: {exercise.weekly_goal}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exercise.exercises.map((ex, i) => <ExerciseCard key={i} ex={ex} />)}
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
            <h3 className="font-bold text-purple-700 mb-3">🧘‍♀️ All Exercise Levels</h3>
            {data.all_exercises.map((level, i) => (
              <details key={i} className="mb-2">
                <summary className="cursor-pointer font-semibold text-gray-700 py-2 px-3 bg-white rounded-lg hover:bg-pink-50 transition-colors">
                  {level.label} — {level.weekly_goal}
                </summary>
                <div className="mt-2 pl-4 space-y-1">
                  {level.exercises.map((ex, j) => (
                    <div key={j} className="text-sm text-gray-600 flex gap-2 py-1">
                      <span>{ex.icon}</span>
                      <span><strong>{ex.name}</strong> — {ex.duration} — {ex.benefit}</span>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
