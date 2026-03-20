import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    age: user?.age || '',
    weight: user?.weight || '',
    height: user?.height || '',
  });
  const [loading, setLoading] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/api/auth/profile', {
        name: form.name,
        age: form.age ? Number(form.age) : null,
        weight: form.weight ? Number(form.weight) : null,
        height: form.height ? Number(form.height) : null,
      });
      updateUser(res.data);
      toast.success('Profile updated! 🌸');
    } catch {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const bmiCategory = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label:'Underweight', color:'text-blue-600' };
    if (bmi < 25)   return { label:'Normal',      color:'text-green-600' };
    if (bmi < 30)   return { label:'Overweight',  color:'text-yellow-600' };
    return                  { label:'Obese',       color:'text-red-600' };
  };

  const cat = bmiCategory(user?.bmi);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-display font-bold text-gray-800 mb-2">My Profile 👤</h1>
        <p className="text-gray-500">Manage your health profile information</p>
      </div>

      {/* Avatar card */}
      <div className="card text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-4xl font-bold text-white mx-auto mb-4 shadow-lg">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <h2 className="text-2xl font-display font-bold text-gray-800">{user?.name}</h2>
        <p className="text-gray-500">{user?.email}</p>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:'Age', val: user?.age ? `${user.age} yrs` : '—' },
            { label:'Weight', val: user?.weight ? `${user.weight} kg` : '—' },
            { label:'Height', val: user?.height ? `${user.height} cm` : '—' },
            { label:'BMI', val: user?.bmi || '—', extra: cat },
          ].map(s => (
            <div key={s.label} className="bg-pink-50 rounded-xl p-3">
              <div className="font-bold text-gray-800">{s.val}</div>
              {s.extra && <div className={`text-xs font-semibold ${s.extra.color}`}>{s.extra.label}</div>}
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit form */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-5">Update Profile</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input name="name" value={form.name} onChange={handle} className="input-field" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Age</label>
              <input name="age" type="number" min="10" max="80" value={form.age} onChange={handle} className="input-field" placeholder="e.g. 25" />
            </div>
            <div>
              <label className="label">Weight (kg)</label>
              <input name="weight" type="number" step="0.1" value={form.weight} onChange={handle} className="input-field" placeholder="e.g. 60" />
            </div>
            <div>
              <label className="label">Height (cm)</label>
              <input name="height" type="number" step="0.1" value={form.height} onChange={handle} className="input-field" placeholder="e.g. 165" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* BMI Guide */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-800 mb-3">BMI Reference Guide</h2>
        <div className="space-y-2">
          {[
            { range:'Below 18.5', cat:'Underweight', color:'bg-blue-100 text-blue-700' },
            { range:'18.5 – 24.9', cat:'Normal',     color:'bg-green-100 text-green-700' },
            { range:'25.0 – 29.9', cat:'Overweight', color:'bg-yellow-100 text-yellow-700' },
            { range:'30.0 +',     cat:'Obese',       color:'bg-red-100 text-red-700' },
          ].map(b => (
            <div key={b.cat} className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${b.color}`}>
              <span className="font-semibold">{b.cat}</span>
              <span className="text-sm">{b.range}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">BMI is calculated as: weight(kg) ÷ height(m)²</p>
      </div>
    </div>
  );
}
