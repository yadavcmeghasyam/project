import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  BarChart3,
  TrendingUp,
  Clock,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Database
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import StatCard from '../components/StatCard';
import ScoreBadge from '../components/ScoreBadge';
import { api } from '../services/api';

export default function Dashboard({ setActiveTab, setSelectedEvalId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const scoreColors = ['#f43f5e', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner required by project specs */}
      <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-blue-200">System Capability Notice: </span>
          TrustLens AI is an automated auditor that detects inconsistencies, unsupported claims, and prompt injection patterns against provided reference documents. It provides groundedness estimations and does not claim to detect every conceivable hallucination or guarantee absolute truth.
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Evaluated"
          value={stats ? stats.total_evaluations : '--'}
          icon={BarChart3}
          color="blue"
          subtitle="All historical audits"
        />
        <StatCard
          title="Reliable Answers"
          value={stats ? stats.reliable_count : '--'}
          icon={ShieldCheck}
          color="emerald"
          subtitle="Score ≥ 75, grounded"
        />
        <StatCard
          title="Warnings"
          value={stats ? stats.warning_count : '--'}
          icon={AlertTriangle}
          color="amber"
          subtitle="Score 50-74, partial"
        />
        <StatCard
          title="High-Risk Answers"
          value={stats ? stats.high_risk_count : '--'}
          icon={AlertOctagon}
          color="rose"
          subtitle="Score < 50 or contradicted"
        />
        <StatCard
          title="Average Score"
          value={stats ? `${stats.avg_reliability_score}%` : '--'}
          icon={TrendingUp}
          color="purple"
          subtitle="Overall reliability index"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Distribution Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Score Distribution</h3>
              <p className="text-xs text-slate-400">Frequency of answers by reliability tier</p>
            </div>
            <button
              onClick={fetchStats}
              title="Refresh Stats"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="h-64 w-full">
            {stats && stats.score_distribution ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.score_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {stats.score_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={scoreColors[index % scoreColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Loading score distribution...
              </div>
            )}
          </div>
        </div>

        {/* Quick Audit Action Box */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-slate-900 to-blue-950/40 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Evaluate New AI Answer</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Verify any LLM output against your reference document. Decompose assertions, detect contradictions, and review transparent scoring.
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => setActiveTab('reliability')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition-all"
            >
              <span>Launch Reliability Checker</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('injection')}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-all"
            >
              <span>Test Prompt Injection</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Evaluations Table */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Evaluation History</h3>
            <p className="text-xs text-slate-400">Past audits stored in {stats?.database_type || 'Database'}</p>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats && stats.recent_evaluations && stats.recent_evaluations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Evaluation Prompt</th>
                  <th className="py-2.5 px-3">Model</th>
                  <th className="py-2.5 px-3">Reliability Score</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {stats.recent_evaluations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-200 max-w-xs truncate">
                      {item.prompt}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {item.model_name || 'gemini-1.5-flash'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-semibold text-white">
                        {item.score}/100
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <ScoreBadge score={item.score} riskLevel={item.risk_level} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          if (setSelectedEvalId) setSelectedEvalId(item.id);
                          setActiveTab('history');
                        }}
                        className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            No evaluations recorded yet. Run your first audit using the Reliability Checker!
          </div>
        )}
      </div>
    </div>
  );
}
