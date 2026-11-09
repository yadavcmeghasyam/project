import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ReliabilityChecker from './pages/ReliabilityChecker';
import HallucinationAnalyzer from './pages/HallucinationAnalyzer';
import PromptInjectionTester from './pages/PromptInjectionTester';
import JsonValidator from './pages/JsonValidator';
import ModelComparison from './pages/ModelComparison';
import EvaluationHistory from './pages/EvaluationHistory';
import Settings from './pages/Settings';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedEvalId, setSelectedEvalId] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await api.getSettingsStatus();
        setSystemStatus(data);
      } catch (err) {
        // Backend not started yet or starting up
        setSystemStatus({
          is_mongodb_connected: false,
          is_llm_api_configured: false,
          database_type: 'Local Storage (Demo Mode)',
          llm_provider: 'Rule-Based Engine (Demo Mode)'
        });
      }
    };
    fetchStatus();
  }, [activeTab]);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} setSelectedEvalId={setSelectedEvalId} />;
      case 'reliability':
        return <ReliabilityChecker />;
      case 'hallucination':
        return <HallucinationAnalyzer />;
      case 'injection':
        return <PromptInjectionTester />;
      case 'json':
        return <JsonValidator />;
      case 'comparison':
        return <ModelComparison />;
      case 'history':
        return <EvaluationHistory initialSelectedId={selectedEvalId} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setActiveTab={setActiveTab} setSelectedEvalId={setSelectedEvalId} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Fixed Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedEvalId(null);
          setActiveTab(tab);
        }}
        systemStatus={systemStatus}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

