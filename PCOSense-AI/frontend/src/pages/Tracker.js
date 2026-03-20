import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import { toast } from 'react-toastify';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const SYMPTOMS = ['Cramps','Bloating','Headache','Mood Swings','Fatigue','Back Pain','Nausea','Spotting','Heavy Flow','Acne'];
const MOODS = ['😊 Happy','😐 Neutral','😢 Sad','😤 Irritable','😰 Anxious','🥱 Tired','💪 Energetic'];

export default function Tracker() {
  const [records, setRecords] = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    period_start_date: '', cycle_length: '', period_duration: '',
    symptoms: [], mood: '', weight_on_date: '', notes: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rec, st] = await Promise.all([
        api.get('/api/tracker/records'),
        api.get('/api/tracker/stats'),
      ]);
      setRecords(rec.data);
      setStats(st.data);
    } catch { toast.error('Failed to load records'); }
    finally { setLoading(false); }
  };

  const toggleSymptom = s =>
    setForm(f => ({
      ...f,
      symptoms: f.symptoms.includes(s) ? f.symptoms.filter(x => x !== s) : [...f.symptoms, s]
    }));

  const submit = async e => {
    e.preventDefault();
    try {
      await api.post('/api/tracker/log', form);
      toast.success('Cycle logged! 🌸');
      setForm({ period_start_date:'', cycle_length:'', period_duration:'', symptoms:[], mood:'', weight_on_date:'', notes:'' });
      setShowForm(false);
      fetchData();
    } catch { toast.error('Failed to save record'); }
  };

  const deleteRecord = async id => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await api.delete(`/api/tracker/records/${id}`);
      toast.success('Record deleted');
      fetchData();
    } catch { toast.error('Delete failed'); }
  };

  const cycleLabels  = records.filter(r => r.cycle_length).slice(0,10).reverse().map((_, i) => `Cycle ${i+1}`);
  const cycleLengths = records.filter(r => r.cycle_length).slice(0,10).reverse().map(r => r.cycle_length);

  const weightData   = records.filter(r => r.weight_on_date).slice(0,10).reverse();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-800">Cycle Tracker 📅</h1>
          <p className="text-gray-500 mt-1">Log and visualise your menstrual cycle health</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? '✕ Cancel' : '+ Log Cycle'}
        </button>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label:'Avg Cycle', val: stats.avg_cycle ? `${stats.avg_cycle} days` : '—', icon:'📊' },
            { label:'Total Cycles', val: stats.total_cycles, icon:'🔢' },
            { label:'Regularity', val: stats.total_cycles === 0 ? '—' : stats.irregular ? '⚠️ Irregular' : '✅ Regular', icon:'📈' },
            { label:'Normal Range', val:'21–35 days', icon:'ℹ️' },
          ].map(s => (
            <div key={s.label} className="card text-center py-4">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-bold text-lg text-gray-800">{s.val}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Log form */}
      {showForm && (
        <div className="card border-pink-200 animate-slide-up">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Log This Cycle</h2>
          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Period Start Date</label>
                <input type="date" value={form.period_start_date}
                  onChange={e => setForm(f => ({...f, period_start_date: e.target.value}))}
                  className="input-field" />
              </div>
              <div>
                <label className="label">Cycle Length (days)</label>
                <input type="number" min="10" max="90" value={form.cycle_length}
                  onChange={e => setForm(f => ({...f, cycle_length: e.target.value}))}
                  className="input-field" placeholder="e.g. 28" />
              </div>
              <div>
                <label className="label">Period Duration (days)</label>
                <input type="number" min="1" max="15" value={form.period_duration}
                  onChange={e => setForm(f => ({...f, period_duration: e.target.value}))}
                  className="input-field" placeholder="e.g. 5" />
              </div>
            </div>

            <div>
              <label className="label">Symptoms</label>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map(s => (
                  <button type="button" key={s}
                    onClick={() => toggleSymptom(s)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      form.symptoms.includes(s)
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Mood</label>
                <select value={form.mood} onChange={e => setForm(f => ({...f, mood: e.target.value}))} className="input-field">
                  <option value="">Select mood…</option>
                  {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Weight on this date (kg)</label>
                <input type="number" step="0.1" value={form.weight_on_date}
                  onChange={e => setForm(f => ({...f, weight_on_date: e.target.value}))}
                  className="input-field" placeholder="e.g. 62.5" />
              </div>
            </div>

            <div>
              <label className="label">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
                className="input-field" rows={3} placeholder="Any additional notes about this cycle…" />
            </div>

            <button type="submit" className="btn-primary w-full">Save Cycle Log 💾</button>
          </form>
        </div>
      )}

      {/* Charts */}
      {cycleLengths.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">Cycle Length Trend</h3>
            <Line
              data={{
                labels: cycleLabels,
                datasets: [{
                  label: 'Cycle Length (days)',
                  data: cycleLengths,
                  borderColor: '#ec4899',
                  backgroundColor: '#ec489922',
                  fill: true, tension: 0.4,
                  pointBackgroundColor: '#ec4899',
                }]
              }}
              options={{ responsive:true, plugins:{ legend:{ display:false } }, scales:{ y:{ min:10 } } }}
            />
          </div>

          {weightData.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-4">Weight Progress</h3>
              <Line
                data={{
                  labels: weightData.map(r => r.period_start_date || r.logged_at.slice(0,10)),
                  datasets: [{
                    label: 'Weight (kg)',
                    data: weightData.map(r => r.weight_on_date),
                    borderColor: '#a855f7',
                    backgroundColor: '#a855f722',
                    fill: true, tension: 0.4,
                    pointBackgroundColor: '#a855f7',
                  }]
                }}
                options={{ responsive:true, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:false } } }}
              />
            </div>
          )}
        </div>
      )}

      {/* Records list */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Cycle History</h2>
        {loading ? (
          <div className="text-center py-8"><div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📅</div>
            <p className="text-gray-500">No cycles logged yet. Click "+ Log Cycle" to start!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map(r => (
              <div key={r.id} className="bg-pink-50 rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-3 mb-2">
                    {r.period_start_date && <span className="text-sm font-semibold text-pink-700">📅 {r.period_start_date}</span>}
                    {r.cycle_length && <span className="text-sm text-gray-600">🔄 {r.cycle_length}-day cycle</span>}
                    {r.period_duration && <span className="text-sm text-gray-600">🩸 {r.period_duration} days</span>}
                    {r.mood && <span className="text-sm text-gray-600">{r.mood}</span>}
                    {r.weight_on_date && <span className="text-sm text-gray-600">⚖️ {r.weight_on_date} kg</span>}
                  </div>
                  {r.symptoms?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {r.symptoms.map(s => (
                        <span key={s} className="bg-pink-200 text-pink-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                  {r.notes && <p className="text-sm text-gray-500 mt-1">{r.notes}</p>}
                </div>
                <button onClick={() => deleteRecord(r.id)} className="text-red-400 hover:text-red-600 text-sm shrink-0">🗑</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
