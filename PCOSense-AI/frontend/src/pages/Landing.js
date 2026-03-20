import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  { icon: '🔬', title: 'AI PCOS Risk Detection', desc: 'Machine learning model analyses your health profile and predicts PCOS risk with confidence scores.' },
  { icon: '📅', title: 'Cycle Tracker', desc: 'Log periods, symptoms, mood, and weight. Visualise patterns with interactive charts.' },
  { icon: '🥗', title: 'Personalised Diet Plans', desc: 'Get BMI-based meal plans designed specifically for PCOS hormone balance.' },
  { icon: '🏃‍♀️', title: 'Exercise Recommendations', desc: 'PCOS-friendly workout routines from beginner yoga to advanced HIIT.' },
  { icon: '💬', title: 'AI Health Chatbot', desc: 'Ask any PCOS question and get instant, medically-informed answers 24/7.' },
  { icon: '📊', title: 'Health Dashboard', desc: 'All your health data in one beautiful, easy-to-read dashboard.' },
];

const stats = [
  { value: '1 in 10', label: 'Women affected by PCOS' },
  { value: '70%', label: 'Go undiagnosed for years' },
  { value: '5–10%', label: 'Weight loss can restore cycles' },
  { value: '90%+', label: 'PCOS managed with lifestyle changes' },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-200 rounded-full opacity-20 blur-3xl -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl translate-y-20 -translate-x-20" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-6 animate-fade-in">
            <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
            AI-Powered Women's Health Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold text-gray-800 mb-6 leading-tight animate-slide-up">
            Take Control of<br />
            <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 bg-clip-text text-transparent">
              Your PCOS Journey
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
            PCOSense AI helps you detect PCOS risk early, track your menstrual health,
            and get personalised lifestyle recommendations — all powered by machine learning.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link to="/register" className="btn-primary text-lg px-8 py-3.5 rounded-2xl">
              Get Started Free 🌸
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-3.5 rounded-2xl">
              Sign In
            </Link>
          </div>

          <p className="text-sm text-gray-400 mt-4">No credit card • Free forever • For educational use</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="text-3xl font-display font-bold">{s.value}</div>
              <div className="text-pink-100 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold text-gray-800 mb-4">Everything You Need</h2>
          <p className="text-gray-500 text-lg">A complete PCOS health companion in one platform</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="card hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 py-20 text-center">
        <h2 className="text-4xl font-display font-bold text-gray-800 mb-4">Ready to Start?</h2>
        <p className="text-gray-500 mb-8 text-lg">Join thousands of women taking charge of their hormonal health.</p>
        <Link to="/register" className="btn-primary text-lg px-10 py-4 rounded-2xl">
          Start Your Health Journey 💜
        </Link>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-pink-100 py-8 text-center text-gray-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">🌸</span>
          <span className="font-display font-bold text-gray-700">PCOSense AI</span>
        </div>
        <p>⚕️ For educational purposes only. Not a substitute for professional medical advice.</p>
        <p className="mt-1">© 2024 PCOSense AI</p>
      </footer>
    </div>
  );
}
