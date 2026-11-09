import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Search,
  ShieldAlert,
  Braces,
  GitCompare,
  History,
  Settings as SettingsIcon,
  Database,
  Cpu
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, systemStatus }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reliability', label: 'Reliability Checker', icon: ShieldCheck, badge: 'Core' },
    { id: 'hallucination', label: 'Hallucination Analyzer', icon: Search },
    { id: 'injection', label: 'Prompt Injection Tester', icon: ShieldAlert },
    { id: 'json', label: 'JSON Validator', icon: Braces },
    { id: 'comparison', label: 'Model Comparison', icon: GitCompare },
    { id: 'history', label: 'Evaluation History', icon: History },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const isMongo = systemStatus?.is_mongodb_connected;

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
            TrustLens <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">AI</span>
          </h1>
          <p className="text-xs text-slate-400">Response Auditor</p>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Auditor Tools
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            Storage
          </span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
            isMongo
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
          }`}>
            {isMongo ? 'MongoDB' : 'Local Demo DB'}
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            Engine
          </span>
          <span className="text-[11px] text-slate-300 font-mono">
            {systemStatus?.llm_provider ? (systemStatus.is_llm_api_configured ? 'Gemini API' : 'Rule-Based Demo') : 'Rule-Based'}
          </span>
        </div>
      </div>
    </aside>
  );
}
