import React, { useState } from 'react';
import {
  Braces,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Code2,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';

const JSON_SAMPLES = {
  valid: {
    title: 'Valid Structured JSON',
    raw: JSON.stringify(
      {
        user_id: 1042,
        username: 'alice_ece',
        email: 'alice@ece.univ.edu',
        is_active: true,
        enrolled_courses: ['Signal Processing', 'Microcontrollers', 'Embedded AI'],
        audit_score: 94.5
      },
      null,
      2
    ),
    required: 'user_id, email, is_active',
    types: '{"user_id": "integer", "email": "string", "is_active": "boolean"}'
  },
  malformed: {
    title: 'Syntax Error (Unquoted Keys & Trailing Comma)',
    raw: '{\n  user_id: 1042,\n  "username": \'alice_ece\',\n  "is_active": true,\n}',
    required: 'user_id, email',
    types: '{"user_id": "integer"}'
  },
  missingKeys: {
    title: 'Missing Required Field & Type Mismatch',
    raw: JSON.stringify(
      {
        user_id: 'NOT_AN_INTEGER',
        username: 'bob_student'
      },
      null,
      2
    ),
    required: 'user_id, email, is_active',
    types: '{"user_id": "integer", "email": "string", "is_active": "boolean"}'
  }
};

export default function JsonValidator() {
  const [jsonInput, setJsonInput] = useState(JSON_SAMPLES.valid.raw);
  const [requiredKeysStr, setRequiredKeysStr] = useState(JSON_SAMPLES.valid.required);
  const [expectedTypesStr, setExpectedTypesStr] = useState(JSON_SAMPLES.valid.types);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!jsonInput.trim()) {
      setError('Please provide JSON text to validate.');
      return;
    }

    let parsedTypes = {};
    if (expectedTypesStr.trim()) {
      try {
        parsedTypes = JSON.parse(expectedTypesStr.trim());
      } catch (err) {
        setError('Expected types specification must be valid JSON, e.g. {"field": "integer"}');
        return;
      }
    }

    const requiredKeysList = requiredKeysStr
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    try {
      setLoading(true);
      setError(null);
      const data = await api.validateJson({
        json_input: jsonInput.trim(),
        required_keys: requiredKeysList,
        expected_types: parsedTypes
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'JSON validation failed.');
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset) => {
    setJsonInput(preset.raw);
    setRequiredKeysStr(preset.required);
    setExpectedTypesStr(preset.types);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 mr-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Presets:</span>
        </div>
        <button
          type="button"
          onClick={() => loadPreset(JSON_SAMPLES.valid)}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
        >
          Valid JSON
        </button>
        <button
          type="button"
          onClick={() => loadPreset(JSON_SAMPLES.malformed)}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
        >
          Syntax Error
        </button>
        <button
          type="button"
          onClick={() => loadPreset(JSON_SAMPLES.missingKeys)}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20"
        >
          Missing Keys & Type Mismatch
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleValidate} className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>JSON Output to Validate</span>
            <span className="text-[10px] text-slate-500">Supports markdown ```json code blocks</span>
          </label>
          <textarea
            rows={8}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste raw LLM JSON response here..."
            className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-200 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Required Keys (comma-separated)</label>
            <input
              type="text"
              value={requiredKeysStr}
              onChange={(e) => setRequiredKeysStr(e.target.value)}
              placeholder="e.g. user_id, email, status"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-200 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Expected Field Types (JSON map)</label>
            <input
              type="text"
              value={expectedTypesStr}
              onChange={(e) => setExpectedTypesStr(e.target.value)}
              placeholder='{"user_id": "integer", "email": "string"}'
              className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-200 outline-none"
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
                <span>Checking Syntax...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Validate JSON Structure</span>
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

      {/* Validation Result */}
      {result && (
        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  result.is_valid_json && result.has_required_keys && result.types_match
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {result.is_valid_json && result.has_required_keys && result.types_match ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <XCircle className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {result.is_valid_json && result.has_required_keys && result.types_match
                      ? 'Valid & Schema-Compliant JSON'
                      : 'Validation Issues Detected'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fields inspected: {result.field_count}
                  </p>
                </div>
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className={`px-2.5 py-1 rounded-full border ${
                  result.is_valid_json
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  Syntax: {result.is_valid_json ? 'Valid' : 'Invalid'}
                </span>
                <span className={`px-2.5 py-1 rounded-full border ${
                  result.has_required_keys
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  Required Keys: {result.has_required_keys ? 'Satisfied' : 'Missing'}
                </span>
                <span className={`px-2.5 py-1 rounded-full border ${
                  result.types_match
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  Data Types: {result.types_match ? 'Matching' : 'Mismatch'}
                </span>
              </div>
            </div>

            {/* Errors List */}
            {result.errors && result.errors.length > 0 && (
              <div className="mt-4 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-1.5 text-xs text-rose-300">
                <div className="font-semibold text-rose-200 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Validation Errors:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings List */}
            {result.warnings && result.warnings.length > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1 text-xs text-amber-300">
                <div className="font-semibold text-amber-200 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>Warnings:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 pl-1">
                  {result.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Formatted JSON Preview */}
          {result.is_valid_json && result.parsed_data && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300">Parsed Clean JSON Object:</span>
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-mono overflow-x-auto">
                {JSON.stringify(result.parsed_data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

