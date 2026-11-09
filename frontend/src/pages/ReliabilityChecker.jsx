import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Play,
  Clock,
  Coins,
  Cpu,
  Layers,
  CheckCircle,
  HelpCircle,
  XCircle,
  Sparkles,
  Info
} from 'lucide-react';
import ClaimCard from '../components/ClaimCard';
import ScoreBadge from '../components/ScoreBadge';
import SampleDataPicker from '../components/SampleDataPicker';
import { api } from '../services/api';

export default function ReliabilityChecker() {
  const [prompt, setPrompt] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [referenceText, setReferenceText] = useState('');
  const [modelName, setModelName] = useState('gemini-1.5-flash');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSelectPreset = (preset) => {
    setPrompt(preset.prompt);
    setAiAnswer(preset.ai_answer);
    setReferenceText(preset.reference_text);
    setResult(null);
    setError(null);
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || !aiAnswer.trim() || !referenceText.trim()) {
      setError('Please provide the Prompt, AI Answer, and Reference Document before auditing.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.evaluate({
        prompt: prompt.trim(),
        ai_answer: aiAnswer.trim(),
        reference_text: referenceText.trim(),
        model_name: modelName,
        use_llm_if_available: true
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Evaluation failed. Please verify that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Test Presets */}
      <SampleDataPicker onSelect={handleSelectPreset} />

      {/* Input Form */}
      <form onSubmit={handleEvaluate} className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* User Prompt */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>1. User Prompt / Query</span>
              <span className="text-[10px] text-slate-500 font-normal">Input instructions</span>
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. What is the capital of Australia and when was it founded?"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-200 placeholder-slate-600 outline-none resize-none"
            />
          </div>

          {/* AI-Generated Answer */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>2. AI-Generated Answer to Audit</span>
              <span className="text-[10px] text-blue-400 font-normal">Audited text</span>
            </label>
            <textarea
              rows={3}
              value={aiAnswer}
              onChange={(e) => setAiAnswer(e.target.value)}
              placeholder="e.g. Canberra is the capital of Australia, established in 1913..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-200 placeholder-slate-600 outline-none resize-none"
            />
          </div>

          {/* Reference Document */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>3. Ground-Truth Reference Document</span>
              <span className="text-[10px] text-emerald-400 font-normal">Verification source</span>
            </label>
            <textarea
              rows={3}
              value={referenceText}
              onChange={(e) => setReferenceText(e.target.value)}
              placeholder="e.g. Canberra was founded in 1913 following Australian federation..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-200 placeholder-slate-600 outline-none resize-none"
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Target Model:</span>
            <select
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="px-2.5 py-1 text-xs rounded bg-slate-950 border border-slate-800 text-slate-300 outline-none focus:border-blue-500"
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="demo-custom-model">Custom / Offline Demo Model</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs shadow-md shadow-blue-600/20 transition-all"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Auditing Claims...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Reliability Audit</span>
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

      {/* Audit Report Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Scorecard Banner */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Score pill */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-2xl font-bold font-mono text-white">
                    {result.reliability_score}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">/ 100</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ScoreBadge score={result.reliability_score} riskLevel={result.risk_level} size="lg" />
                  </div>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    {result.explanation}
                  </p>
                </div>
              </div>

              {/* Performance Telemetry */}
              <div className="flex flex-wrap md:flex-col gap-2 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Latency: <strong className="text-slate-200">{result.performance.response_time_ms} ms</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Tokens: <strong className="text-slate-200">{result.performance.estimated_tokens} est.</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cost: <strong className="text-slate-200">{result.performance.estimated_cost_usd !== null ? `$${result.performance.estimated_cost_usd}` : 'N/A'}</strong></span>
                </div>
              </div>
            </div>

            {/* Claim Counts Summary Pill Bar */}
            <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Supported
                </span>
                <span className="font-mono font-bold text-white text-sm">{result.supported_count}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <span className="text-amber-400 font-medium flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Partially Supported
                </span>
                <span className="font-mono font-bold text-white text-sm">{result.partially_supported_count}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" /> Unsupported
                </span>
                <span className="font-mono font-bold text-white text-sm">{result.unsupported_count}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                <span className="text-rose-400 font-medium flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" /> Contradictions
                </span>
                <span className="font-mono font-bold text-white text-sm">{result.contradicted_count}</span>
              </div>
            </div>

            {/* Warnings list if any */}
            {result.warnings && result.warnings.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1 text-xs text-amber-300">
                <div className="font-semibold flex items-center gap-1.5 text-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Auditor Warnings:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-amber-300/90 pl-1">
                  {result.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Individual Claims Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Decomposed Factual Assertions</h3>
                <p className="text-xs text-slate-400">Every isolated statement compared against the reference text</p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {result.claims.length} claims verified
              </span>
            </div>

            <div className="space-y-3">
              {result.claims.map((claim) => (
                <ClaimCard key={claim.claim_id} claim={claim} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

