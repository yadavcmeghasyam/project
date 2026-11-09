import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Database,
  Cpu,
  Key,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Code2,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function Settings() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSettingsStatus();
      setStatus(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch system status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">System Diagnostics & Configuration</h3>
          <p className="text-xs text-slate-400">
            Runtime environment and connectivity status for TrustLens AI.
          </p>
        </div>
        <button
          onClick={fetchStatus}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Connectivity Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Database Status */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              Storage Engine
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
              status?.is_mongodb_connected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            }`}>
              {status?.is_mongodb_connected ? 'Connected' : 'Active (Demo)'}
            </span>
          </div>
          <div>
            <span className="text-lg font-bold text-white block">
              {status?.database_type || 'Checking...'}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              {status?.is_mongodb_connected
                ? 'Connected to local MongoDB service (port 27017).'
                : 'MongoDB service not detected; automatically operating on local JSON storage so all features remain functional!'}
            </p>
          </div>
        </div>

        {/* AI Engine Status */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Evaluation Engine
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
              status?.is_llm_api_configured
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {status?.is_llm_api_configured ? 'Online API' : 'Rule-Based Engine'}
            </span>
          </div>
          <div>
            <span className="text-lg font-bold text-white block">
              {status?.llm_provider || 'Checking...'}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              {status?.is_llm_api_configured
                ? 'Using external cloud model for semantic reasoning.'
                : 'Operating in standalone demo mode using deterministic rule-based NLP comparison.'}
            </p>
          </div>
        </div>

        {/* Default Model */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              Default Audit Model
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300">
              v1.0.0
            </span>
          </div>
          <div>
            <span className="text-lg font-bold text-white block font-mono">
              {status?.default_model || 'gemini-1.5-flash'}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Primary target for AI latency benchmarking and cost estimation calculations.
            </p>
          </div>
        </div>
      </div>

      {/* University Viva Reference: Scoring Methodology */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4.5 h-4.5 text-blue-400" />
          <span>Reliability Scoring Methodology (Academic Reference)</span>
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          The TrustLens auditor breaks down candidate answers into atomic assertions and computes a weighted composite reliability index:
        </p>

        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-blue-300 overflow-x-auto">
          Score = [(Supported × 100) + (Partially Supported × 60) + (Unsupported × 20) + (Contradicted × 0)] / Total Claims
          <br />
          Penalties: Direct Contradictions subtract 20 points per occurrence.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <strong className="block text-emerald-200">Reliable (Score ≥ 75)</strong>
            Majority of assertions are grounded with zero direct contradictions.
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <strong className="block text-amber-200">Warning (50 ≤ Score &lt; 75)</strong>
            Contains unverified statements or slight deviations from reference facts.
          </div>
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
            <strong className="block text-rose-200">High Risk (Score &lt; 50)</strong>
            Substantial unsupported fabrications or direct factual contradictions detected.
          </div>
        </div>
      </div>

      {/* Environment Setup Guide */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Code2 className="w-4 h-4 text-emerald-400" />
          <span>Environment Configuration (`backend/.env`)</span>
        </h4>
        <p className="text-xs text-slate-400">
          To connect your own Google Gemini API key or MongoDB instance, create a <code className="text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded">.env</code> file in the <code className="text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded">backend/</code> folder:
        </p>
        <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono overflow-x-auto">
{`# Server
HOST=127.0.0.1
PORT=8000

# Database
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=trustlens_db

# Optional AI API Key (Demo mode works even if omitted)
GEMINI_API_KEY=your_gemini_api_key_here`}
        </pre>
      </div>
    </div>
  );
}
