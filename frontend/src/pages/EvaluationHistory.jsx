import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Trash2,
  Eye,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Layers,
  ChevronRight,
  X,
  Clock,
  Cpu
} from 'lucide-react';
import ScoreBadge from '../components/ScoreBadge';
import ClaimCard from '../components/ClaimCard';
import { api } from '../services/api';

export default function EvaluationHistory({ initialSelectedId }) {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getHistory(search);
      setEvaluations(res.evaluations || []);
      
      // If an initial id was requested (e.g. from Dashboard inspect click)
      if (initialSelectedId) {
        const found = (res.evaluations || []).find((e) => e.id === initialSelectedId);
        if (found) setSelectedEvaluation(found);
      }
    } catch (err) {
      setError(err.message || 'Failed to load evaluation history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [search]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this evaluation record?')) return;

    try {
      setDeletingId(id);
      await api.deleteHistoryItem(id);
      setEvaluations((prev) => prev.filter((item) => item.id !== id));
      if (selectedEvaluation && selectedEvaluation.id === id) {
        setSelectedEvaluation(null);
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (isoString) => {
    try {
      return new Date(isoString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by prompt, model, or status..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-200 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-400">
            {evaluations.length} records found
          </span>
          <button
            onClick={fetchHistory}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            title="Refresh List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Layout: List on left, Inspector modal/drawer on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evaluations List */}
        <div className={`space-y-3 ${selectedEvaluation ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
          {loading && evaluations.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Loading evaluation history...
            </div>
          ) : evaluations.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 p-8 rounded-xl bg-slate-900/40 border border-slate-800">
              No historical records match your query. Run an audit in the Reliability Checker to store one!
            </div>
          ) : (
            evaluations.map((item) => {
              const isSelected = selectedEvaluation && selectedEvaluation.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedEvaluation(item)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/10 border-blue-500/50 shadow-md shadow-blue-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ScoreBadge score={item.reliability_score} riskLevel={item.risk_level} size="sm" />
                      <span className="text-[10px] font-mono text-slate-500">
                        {item.model_name || 'gemini-1.5-flash'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.timestamp)}
                    </span>
                  </div>

                  <p className="mt-2.5 text-xs font-medium text-slate-200 line-clamp-2">
                    {item.prompt}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      {item.total_claims || (item.claims ? item.claims.length : 0)} claims analyzed
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        disabled={deletingId === item.id}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete Evaluation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isSelected ? 'rotate-90 text-blue-400' : ''}`} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Evaluation Inspector Panel */}
        {selectedEvaluation && (
          <div className="lg:col-span-2 p-6 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ScoreBadge score={selectedEvaluation.reliability_score} riskLevel={selectedEvaluation.risk_level} size="md" />
                  <span className="text-xs font-mono text-slate-400">ID: {selectedEvaluation.id}</span>
                </div>
                <h3 className="text-sm font-semibold text-white">Evaluation Audit Report</h3>
              </div>
              <button
                onClick={() => setSelectedEvaluation(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Performance telemetry */}
            {selectedEvaluation.performance && (
              <div className="flex flex-wrap gap-4 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Latency: <strong className="text-slate-200">{selectedEvaluation.performance.response_time_ms} ms</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  Tokens: <strong className="text-slate-200">{selectedEvaluation.performance.estimated_tokens} est.</strong>
                </span>
                <span>
                  Model: <strong className="text-slate-200">{selectedEvaluation.model_name}</strong>
                </span>
              </div>
            )}

            {/* Prompt & Answer */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-400 block mb-1">User Prompt:</span>
                <p className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">
                  {selectedEvaluation.prompt}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-400 block mb-1">AI-Generated Answer:</span>
                <p className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">
                  {selectedEvaluation.ai_answer}
                </p>
              </div>

              {selectedEvaluation.reference_text && (
                <div>
                  <span className="font-semibold text-emerald-400 block mb-1">Ground-Truth Reference Document:</span>
                  <p className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    {selectedEvaluation.reference_text}
                  </p>
                </div>
              )}
            </div>

            {/* Detailed Claims List */}
            {selectedEvaluation.claims && selectedEvaluation.claims.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Decomposed Claim Assertions ({selectedEvaluation.claims.length})
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {selectedEvaluation.claims.map((claim) => (
                    <ClaimCard key={claim.claim_id} claim={claim} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
