import React, { useState } from 'react';
import {
  GitCompare,
  Play,
  Trophy,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  TrendingUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import ScoreBadge from '../components/ScoreBadge';
import { api } from '../services/api';

const COMPARISON_PRESET = {
  prompt: 'What are the specifications of the Kepler Space Telescope mission?',
  reference_text: 'NASA launched the Kepler space telescope in March 2009. Designed to survey a portion of our region of the Milky Way to discover Earth-size exoplanets in or near habitable zones, Kepler operated for over 9 years, observing 530,506 stars and confirming 2,662 planets before retirement in October 2018.',
  model_a_name: 'Model A (Grounded Expert)',
  model_a_answer: 'NASA launched the Kepler space telescope in March 2009. It was designed to discover Earth-size exoplanets in habitable zones. During its 9-year mission, Kepler observed over 530,000 stars and confirmed 2,662 planets before retiring in October 2018.',
  model_b_name: 'Model B (Prone to Hallucination)',
  model_b_answer: 'The Kepler telescope was launched by NASA in 1995. It was placed in low Earth orbit to photograph Mars with optical cameras. Kepler discovered over 50,000 Earth-like civilizations before crashing into Jupiter in 2012.'
};

export default function ModelComparison() {
  const [prompt, setPrompt] = useState(COMPARISON_PRESET.prompt);
  const [referenceText, setReferenceText] = useState(COMPARISON_PRESET.reference_text);
  const [modelAName, setModelAName] = useState(COMPARISON_PRESET.model_a_name);
  const [modelAAnswer, setModelAAnswer] = useState(COMPARISON_PRESET.model_a_answer);
  const [modelBName, setModelBName] = useState(COMPARISON_PRESET.model_b_name);
  const [modelBAnswer, setModelBAnswer] = useState(COMPARISON_PRESET.model_b_answer);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || !referenceText.trim() || !modelAAnswer.trim() || !modelBAnswer.trim()) {
      setError('Please provide the prompt, reference text, and answers for both models.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.compareModels({
        prompt: prompt.trim(),
        reference_text: referenceText.trim(),
        model_a_name: modelAName.trim(),
        model_a_answer: modelAAnswer.trim(),
        model_b_name: modelBName.trim(),
        model_b_answer: modelBAnswer.trim()
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Model comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result
    ? [
        {
          metric: 'Reliability Score',
          [result.model_a_name]: result.model_a_eval.reliability_score,
          [result.model_b_name]: result.model_b_eval.reliability_score
        },
        {
          metric: 'Supported Claims',
          [result.model_a_name]: result.model_a_eval.supported_count,
          [result.model_b_name]: result.model_b_eval.supported_count
        },
        {
          metric: 'Unsupported Claims',
          [result.model_a_name]: result.model_a_eval.unsupported_count,
          [result.model_b_name]: result.model_b_eval.unsupported_count
        },
        {
          metric: 'Contradictions',
          [result.model_a_name]: result.model_a_eval.contradicted_count,
          [result.model_b_name]: result.model_b_eval.contradicted_count
        }
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Preset Banner */}
      <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Quick Demo: Load Grounded vs Hallucinating Model comparison preset</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setPrompt(COMPARISON_PRESET.prompt);
            setReferenceText(COMPARISON_PRESET.reference_text);
            setModelAName(COMPARISON_PRESET.model_a_name);
            setModelAAnswer(COMPARISON_PRESET.model_a_answer);
            setModelBName(COMPARISON_PRESET.model_b_name);
            setModelBAnswer(COMPARISON_PRESET.model_b_answer);
            setResult(null);
          }}
          className="px-3 py-1 text-xs font-medium rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30"
        >
          Load Preset
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleCompare} className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Shared Evaluation Prompt</label>
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-200 outline-none resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Shared Reference Ground Truth</label>
            <textarea
              rows={2}
              value={referenceText}
              onChange={(e) => setReferenceText(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-200 outline-none resize-none"
            />
          </div>
        </div>

        {/* Model Side-by-Side Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Model A */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-blue-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400">Candidate A</span>
              <input
                type="text"
                value={modelAName}
                onChange={(e) => setModelAName(e.target.value)}
                className="px-2 py-0.5 text-xs rounded bg-slate-900 border border-slate-800 text-slate-300 text-right outline-none"
              />
            </div>
            <textarea
              rows={4}
              value={modelAAnswer}
              onChange={(e) => setModelAAnswer(e.target.value)}
              placeholder="Paste Model A answer..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 focus:border-blue-500 text-slate-200 outline-none resize-none"
            />
          </div>

          {/* Model B */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400">Candidate B</span>
              <input
                type="text"
                value={modelBName}
                onChange={(e) => setModelBName(e.target.value)}
                className="px-2 py-0.5 text-xs rounded bg-slate-900 border border-slate-800 text-slate-300 text-right outline-none"
              />
            </div>
            <textarea
              rows={4}
              value={modelBAnswer}
              onChange={(e) => setModelBAnswer(e.target.value)}
              placeholder="Paste Model B answer..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 focus:border-purple-500 text-slate-200 outline-none resize-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end border-t border-slate-800/80">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs shadow-md shadow-blue-600/20 transition-all"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Auditing Both Models...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Compare Model Reliability</span>
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Comparison Results */}
      {result && (
        <div className="space-y-6">
          {/* Winner Banner */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-xl flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Head-to-Head Winner:
                </span>
                <span className="text-base font-bold text-white">{result.winner}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                  Δ {result.score_difference} pts
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {result.comparison_summary}
              </p>
            </div>
          </div>

          {/* Side by side metric scorecard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Model A Card */}
            <div className="p-5 rounded-xl bg-slate-900/90 border border-blue-500/30 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{result.model_a_name}</h4>
                  <p className="text-xs text-slate-400">Response time: {result.model_a_eval.performance.response_time_ms} ms</p>
                </div>
                <ScoreBadge score={result.model_a_eval.reliability_score} riskLevel={result.model_a_eval.risk_level} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-emerald-400 block font-bold text-base font-mono">
                    {result.model_a_eval.supported_count}
                  </span>
                  <span className="text-slate-400 text-[10px]">Supported</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-300 block font-bold text-base font-mono">
                    {result.model_a_eval.unsupported_count}
                  </span>
                  <span className="text-slate-400 text-[10px]">Unsupported</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-rose-400 block font-bold text-base font-mono">
                    {result.model_a_eval.contradicted_count}
                  </span>
                  <span className="text-slate-400 text-[10px]">Contradictions</span>
                </div>
              </div>
            </div>

            {/* Model B Card */}
            <div className="p-5 rounded-xl bg-slate-900/90 border border-purple-500/30 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{result.model_b_name}</h4>
                  <p className="text-xs text-slate-400">Response time: {result.model_b_eval.performance.response_time_ms} ms</p>
                </div>
                <ScoreBadge score={result.model_b_eval.reliability_score} riskLevel={result.model_b_eval.risk_level} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-emerald-400 block font-bold text-base font-mono">
                    {result.model_b_eval.supported_count}
                  </span>
                  <span className="text-slate-400 text-[10px]">Supported</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-300 block font-bold text-base font-mono">
                    {result.model_b_eval.unsupported_count}
                  </span>
                  <span className="text-slate-400 text-[10px]">Unsupported</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-rose-400 block font-bold text-base font-mono">
                    {result.model_b_eval.contradicted_count}
                  </span>
                  <span className="text-slate-400 text-[10px]">Contradictions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recharts Comparative Bar Chart */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <h4 className="text-sm font-semibold text-white mb-1">Comparative Reliability Metrics</h4>
            <p className="text-xs text-slate-400 mb-4">Direct performance and groundedness comparison</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <XAxis dataKey="metric" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey={result.model_a_name} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={result.model_b_name} fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
