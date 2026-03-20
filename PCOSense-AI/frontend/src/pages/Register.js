import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', age:'', weight:'', height:'' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register({
        name: form.name, email: form.email, password: form.password,
        age: form.age ? Number(form.age) : null,
        weight: form.weight ? Number(form.weight) : null,
        height: form.height ? Number(form.height) : null,
      });
      toast.success('Account created! Welcome 🌸');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl">🌸</span>
            <span className="font-display text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent">PCOSense AI</span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-gray-800">Create your account</h1>
          <p className="text-gray-500 mt-2">Start your personalised PCOS health journey</p>
        </div>

        <div className="card shadow-lg">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Full Name *</label>
                <input name="name" required value={form.name} onChange={handle} className="input-field" placeholder="Your name" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Email *</label>
                <input name="email" type="email" required value={form.email} onChange={handle} className="input-field" placeholder="you@example.com" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Password *</label>
                <input name="password" type="password" required value={form.password} onChange={handle} className="input-field" placeholder="Min. 6 characters" />
              </div>

              <div>
                <label className="label">Age</label>
                <input name="age" type="number" min="10" max="80" value={form.age} onChange={handle} className="input-field" placeholder="e.g. 25" />
              </div>
              <div>
                <label className="label">Weight (kg)</label>
                <input name="weight" type="number" step="0.1" value={form.weight} onChange={handle} className="input-field" placeholder="e.g. 60" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Height (cm)</label>
                <input name="height" type="number" step="0.1" value={form.height} onChange={handle} className="input-field" placeholder="e.g. 165" />
              </div>
            </div>

            <p className="text-xs text-gray-400">Age, weight and height help calculate your BMI for better recommendations. You can skip these now.</p>

            <button type="submit" disabled={loading} className="btn-primary w-full text-center mt-2">
              {loading ? 'Creating account…' : 'Create Account 🌸'}
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-pink-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
