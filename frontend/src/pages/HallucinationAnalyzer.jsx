import React, { useState } from 'react';
import {
  Search,
  Play,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle,
  Sparkles
} from 'lucide-react';
import ClaimCard from '../components/ClaimCard';
import { api } from '../services/api';

const HALLUCINATION_SAMPLES = {
  highRisk: {
    title: 'High Risk (Contradicted Claims)',
    ai_answer: 'Water boils at 50 degrees Celsius at sea level. Drinking boiled water destroys human bone structure within minutes.',
    reference_text: 'Pure water boils at approximately 100 degrees Celsius (212 degrees Fahrenheit) at standard atmospheric pressure at sea level. Drinking boiled water is safe once cooled.'
  },
  grounded: {
    title: 'Grounded (Zero Hallucination)',
    ai_answer: 'Photosynthesis occurs in plant chloroplasts using chlorophyll. It converts light energy into chemical energy, producing oxygen as a byproduct.',
    reference_text: 'Photosynthesis is carried out in chloroplasts using the pigment chlorophyll. Through this biological process, plants convert light energy into glucose and chemical energy, releasing oxygen as a byproduct.'
  }
};

export default function HallucinationAnalyzer() {
  const [aiAnswer, setAiAnswer] = useState('');
  const [referenceText, setReferenceText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    if (!aiAnswer.trim() || !referenceText.trim()) {
      setError('Please provide both the AI Answer and Reference Document.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.analyzeHallucination({
        ai_answer: aiAnswer.trim(),
        reference_text: referenceText.trim()
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Hallucination analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sample Presets */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 mr-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Presets:</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setAiAnswer(HALLUCINATION_SAMPLES.highRisk.ai_answer);
            setReferenceText(HALLUCINATION_SAMPLES.highRisk.reference_text);
            setResult(null);
          }}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
        >
          Load Contradiction Sample
        </button>
        <button
          type="button"
          onClick={() => {
            setAiAnswer(HALLUCINATION_SAMPLES.grounded.ai_answer);
            setReferenceText(HALLUCINATION_SAMPLES.grounded.reference_text);
            setResult(null);
          }}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
        >
          Load Grounded Sample
        </button>
      </div>

      {/* Input Section */}
      <form onSubmit={handleRunAnalysis} className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">AI-Generated Text to Audit</label>
            <textarea
              rows={4}
              value={aiAnswer}
              onChange={(e) => setAiAnswer(e.target.value)}
              placeholder="Paste the generated response to check for hallucinations..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-200 placeholder-slate-600 outline-none resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Ground-Truth Reference Document</label>
            <textarea
              rows={4}
              value={referenceText}
              onChange={(e) => setReferenceText(e.target.value)}
              placeholder="Paste the source document against which claims should be grounded..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-200 placeholder-slate-600 outline-none resize-none"
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
                <span>Scanning Claims...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Analyze Hallucination Risk</span>
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

      {/* Analysis Output */}
      {result && (
        <div className="space-y-6">
          {/* Risk Gauge Card */}
          <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Hallucination Index
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className={`text-3xl font-extrabold font-mono ${
                    result.overall_hallucination_rate > 50
                      ? 'text-rose-400'
                      : result.overall_hallucination_rate > 20
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}>
                    {result.overall_hallucination_rate}%
                  </span>
                  <span className="text-sm font-semibold text-slate-200">
                    {result.risk_verdict}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  {result.hallucination_summary}
                </p>
              </div>

              {/* Status summary pill tags */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  {result.supported_count} Supported
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  {result.partially_supported_count} Partial
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  {result.unsupported_count} Unsupported
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                  {result.contradicted_count} Contradicted
                </span>
              </div>
            </div>

            {/* Hallucination progress bar */}
            <div className="mt-5 w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  result.overall_hallucination_rate > 50
                    ? 'bg-rose-500'
                    : result.overall_hallucination_rate > 20
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, result.overall_hallucination_rate))}%` }}
              />
            </div>
          </div>

          {/* Claim Cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Claim-by-Claim Evidence Review</h3>
            {result.claims.map((claim) => (
              <ClaimCard key={claim.claim_id} claim={claim} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
