import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const quickLinks = [
  { to:'/prediction', icon:'🔬', label:'Run PCOS Check', color:'from-pink-400 to-rose-500' },
  { to:'/tracker',    icon:'📅', label:'Log Cycle',       color:'from-purple-400 to-pink-500' },
  { to:'/diet',       icon:'🥗', label:'View Diet Plan',  color:'from-orange-400 to-pink-500' },
  { to:'/chatbot',    icon:'💬', label:'Ask AI',          color:'from-teal-400 to-cyan-500'   },
];

function RiskBadge({ level }) {
  if (!level) return null;
  const styles = { High:'badge-high', Medium:'badge-medium', Low:'badge-low' };
  const icons  = { High:'🔴', Medium:'🟡', Low:'🟢' };
  return <span className={styles[level]}>{icons[level]} {level} Risk</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [latest, setLatest] = useState(null);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/prediction/latest').catch(() => ({ data: null })),
      api.get('/api/tracker/stats').catch(() => ({ data: null })),
    ]).then(([pred, stat]) => {
      setLatest(pred.data);
      setStats(stat.data);
    }).finally(() => setLoading(false));
  }, []);

  const weightData = stats?.weight_history?.slice(-8) || [];
  const cycleData  = stats?.cycle_lengths?.slice(-8) || [];

  const lineChartData = (labels, data, label, color) => ({
    labels,
    datasets: [{
      label,
      data,
      borderColor: color,
      backgroundColor: color + '22',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: color,
      pointRadius: 4,
    }]
  });

  const doughnutData = latest ? {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [{
      data: [latest.probabilities?.Low||0, latest.probabilities?.Medium||0, latest.probabilities?.High||0],
      backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
      borderWidth: 0,
    }]
  } : null;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold mb-1">Hello, {user?.name?.split(' ')[0]} 🌸</h1>
            <p className="text-pink-100">Here's your health overview for today.</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
            <div className="text-3xl font-bold">{user?.bmi || '—'}</div>
            <div className="text-pink-100 text-sm">BMI</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          {[
            { label:'Age', val: user?.age ? `${user.age} yrs` : '—' },
            { label:'Weight', val: user?.weight ? `${user.weight} kg` : '—' },
            { label:'Height', val: user?.height ? `${user.height} cm` : '—' },
          ].map(s => (
            <div key={s.label} className="bg-white/15 rounded-xl p-3">
              <div className="font-bold text-lg">{s.val}</div>
              <div className="text-pink-100 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map(q => (
          <Link key={q.to} to={q.to}
            className={`bg-gradient-to-br ${q.color} rounded-2xl p-5 text-white text-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all`}>
            <div className="text-3xl mb-2">{q.icon}</div>
            <div className="font-semibold text-sm">{q.label}</div>
          </Link>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest prediction */}
        <div className="card lg:col-span-1">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Latest PCOS Check</h2>
          {latest ? (
            <div className="text-center">
              {doughnutData && (
                <div className="w-48 mx-auto mb-4">
                  <Doughnut data={doughnutData} options={{ plugins:{ legend:{ display:false } }, cutout:'70%' }} />
                </div>
              )}
              <RiskBadge level={latest.risk_level} />
              <p className="text-2xl font-bold text-gray-800 mt-2">{latest.confidence}% confident</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(latest.predicted_at).toLocaleDateString()}</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">🔬</div>
              <p className="text-gray-500 text-sm mb-4">No PCOS check done yet</p>
              <Link to="/prediction" className="btn-primary text-sm px-4 py-2">Run Check</Link>
            </div>
          )}
        </div>

        {/* Cycle stats */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Cycle Insights</h2>
          {cycleData.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label:'Avg Cycle', val:`${stats.avg_cycle} days` },
                  { label:'Total Cycles', val:stats.total_cycles },
                  { label:'Status', val: stats.irregular ? '⚠️ Irregular' : '✅ Regular' },
                ].map(s => (
                  <div key={s.label} className="bg-pink-50 rounded-xl p-3 text-center">
                    <div className="font-bold text-gray-800">{s.val}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
              <Line
                data={lineChartData(
                  cycleData.map((_, i) => `Cycle ${i+1}`),
                  cycleData,
                  'Cycle Length (days)',
                  '#ec4899'
                )}
                options={{ responsive:true, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:false, min:15 } } }}
              />
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">📅</div>
              <p className="text-gray-500 text-sm mb-4">No cycle data yet</p>
              <Link to="/tracker" className="btn-primary text-sm px-4 py-2">Log Your Cycle</Link>
            </div>
          )}
        </div>
      </div>

      {/* Weight chart */}
      {weightData.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Weight Progress</h2>
          <Line
            data={lineChartData(
              weightData.map(w => w.date),
              weightData.map(w => w.weight),
              'Weight (kg)',
              '#a855f7'
            )}
            options={{ responsive:true, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:false } } }}
          />
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-pink-100 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">💡 Daily Health Tips</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>🌿 Start your day with warm lemon water to reduce inflammation</li>
          <li>🥗 Choose low-GI foods — they help control insulin and androgen levels</li>
          <li>🏃‍♀️ Even 30 minutes of walking daily can improve PCOS symptoms significantly</li>
          <li>😴 Aim for 7–9 hours of sleep — poor sleep worsens cortisol and insulin</li>
          <li>🧘‍♀️ Practice 10 minutes of mindfulness to lower stress hormones</li>
        </ul>
      </div>
    </div>
  );
}
