import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, XCircle, Quote } from 'lucide-react';

export default function ClaimCard({ claim }) {
  const statusConfig = {
    Supported: {
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
      border: 'border-l-4 border-l-emerald-500',
      label: 'Supported'
    },
    'Partially Supported': {
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: AlertCircle,
      border: 'border-l-4 border-l-amber-500',
      label: 'Partially Supported'
    },
    Unsupported: {
      badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      icon: HelpCircle,
      border: 'border-l-4 border-l-slate-500',
      label: 'Unsupported'
    },
    Contradicted: {
      badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      icon: XCircle,
      border: 'border-l-4 border-l-rose-500',
      label: 'Contradicted'
    }
  };

  const config = statusConfig[claim.status] || statusConfig.Unsupported;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg bg-slate-900/90 border border-slate-800 ${config.border} space-y-3 transition-all hover:bg-slate-900`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            Claim #{claim.claim_id}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border ${config.badge}`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </span>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Confidence: {Math.round(claim.confidence * 100)}%
        </div>
      </div>

      <p className="text-sm text-slate-200 font-medium leading-relaxed">
        "{claim.claim_text}"
      </p>

      {/* Matched Reference Grounding Quote */}
      {claim.matched_reference_segment && (
        <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
          <Quote className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-blue-400">Reference Grounding: </span>
            <span className="italic text-slate-300">"{claim.matched_reference_segment}"</span>
          </div>
        </div>
      )}

      {/* Reasoning explanation */}
      <div className="text-xs text-slate-400 bg-slate-900/50 pt-2 border-t border-slate-800/60 flex items-start gap-1.5">
        <span className="font-semibold text-slate-300">Auditor Note:</span>
        <span>{claim.reasoning}</span>
      </div>
    </div>
  );
}
