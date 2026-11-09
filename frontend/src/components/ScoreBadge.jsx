import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function ScoreBadge({ score, riskLevel, showIcon = true, size = 'md' }) {
  let level = riskLevel;
  if (!level && score !== undefined) {
    if (score >= 75) level = 'Reliable';
    else if (score >= 50) level = 'Warning';
    else level = 'High Risk';
  }

  const configs = {
    Reliable: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      icon: ShieldCheck,
      text: 'Reliable',
      dot: 'bg-emerald-400'
    },
    Warning: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      icon: AlertTriangle,
      text: 'Warning',
      dot: 'bg-amber-400'
    },
    'High Risk': {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      icon: AlertOctagon,
      text: 'High Risk',
      dot: 'bg-rose-400'
    }
  };

  const current = configs[level] || configs['Warning'];
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
    lg: 'text-base px-4 py-1.5 gap-2.5 font-semibold'
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${current.bg} ${sizeClasses[size]}`}>
      {showIcon && <Icon className={size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      <span>{current.text}</span>
      {score !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 bg-slate-900/40 rounded text-xs font-mono">
          {score}
        </span>
      )}
    </span>
  );
}
