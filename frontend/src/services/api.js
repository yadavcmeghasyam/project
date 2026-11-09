/**
 * TrustLens AI API Service
 * Handles all communication with the FastAPI backend.
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      let errorMsg = `Server error (${res.status})`;
      try {
        const errorData = await res.json();
        errorMsg = errorData.detail || errorMsg;
      } catch (e) {
        // Fallback to text
      }
      throw new Error(errorMsg);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Dashboard & System
  getDashboardStats: () => request('/dashboard/stats'),
  getSettingsStatus: () => request('/settings/status'),

  // Core Evaluation
  evaluate: (payload) =>
    request('/evaluate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Hallucination Analysis
  analyzeHallucination: (payload) =>
    request('/analyze-hallucination', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Prompt Injection Defense
  testPromptInjection: (payload) =>
    request('/test-prompt-injection', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // JSON Validation
  validateJson: (payload) =>
    request('/validate-json', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Model Comparison
  compareModels: (payload) =>
    request('/compare-models', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // History
  getHistory: (search = '', limit = 50) => {
    const query = search ? `?search=${encodeURIComponent(search)}&limit=${limit}` : `?limit=${limit}`;
    return request(`/history${query}`);
  },
  getHistoryItem: (id) => request(`/history/${id}`),
  deleteHistoryItem: (id) =>
    request(`/history/${id}`, {
      method: 'DELETE',
    }),
};
