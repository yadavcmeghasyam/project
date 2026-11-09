import React from 'react';
import { Shield, Sparkles, Terminal } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const titles = {
    dashboard: { title: 'Auditor Dashboard', desc: 'Real-time metrics, reliability score trends, and recent audits.' },
    reliability: { title: 'Answer Reliability Checker', desc: 'Evaluate groundedness, contradictions, and calculate an overall trust score.' },
    hallucination: { title: 'Hallucination Risk Analyzer', desc: 'Identify unsupported claims, subtle fabrications, and conflicting assertions.' },
    injection: { title: 'Prompt Injection Defense Tester', desc: 'Detect adversarial instruction overrides, jailbreaks, and system prompt leaks.' },
    json: { title: 'JSON Output & Schema Validator', desc: 'Verify syntax compliance, required fields, and correct typing in LLM output.' },
    comparison: { title: 'Side-by-Side Model Comparison', desc: 'Benchmark two AI responses against the same prompt and reference standard.' },
    history: { title: 'Audit History & Records', desc: 'Search, review, and manage past AI reliability evaluations.' },
    settings: { title: 'System Settings & Connectivity', desc: 'Configure LLM credentials, view MongoDB connection state, and runtime diagnostics.' },
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="h-16 px-6 bg-slate-900/60 backdrop-blur border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-base font-semibold text-white tracking-tight">{current.title}</h2>
        <p className="text-xs text-slate-400 hidden sm:block">{current.desc}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('reliability')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Evaluation</span>
        </button>
      </div>
    </header>
  );
}

