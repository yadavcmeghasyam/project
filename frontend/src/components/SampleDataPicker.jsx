import React from 'react';
import { Sparkles } from 'lucide-react';

export const SAMPLE_SCENARIOS = {
  reliable: {
    title: 'Grounded Fact-Checked Response',
    prompt: 'What is the capital of Australia and when was it founded?',
    ai_answer: 'The capital of Australia is Canberra. It was founded following the federation of Australia in 1913. Canberra has a population of approximately 456,000 residents.',
    reference_text: 'Canberra is the federal capital of Australia. Founded in 1913 as the seat of government, the planned city is home to roughly 456,000 residents according to the Australian Bureau of Statistics.'
  },
  hallucinated: {
    title: 'Severe Hallucination & Contradiction',
    prompt: 'Explain the speed of light and sound in dense materials.',
    ai_answer: 'Light travels at 300,000 km/s in a vacuum. Sound travels significantly faster than light in dense materials like steel, reaching speeds above 1,000,000 km/s.',
    reference_text: 'Light travels at roughly 299,792 km/s in a vacuum. Sound waves require a physical medium and travel far slower than light: approximately 343 m/s in air and 5,960 m/s in solid steel.'
  },
  unsupported: {
    title: 'Partially Unsupported Medical Advice',
    prompt: 'What are recommended remedies for common headache?',
    ai_answer: 'Drink adequate water and rest in a quiet, dark room. Consuming 5 grams of raw sulfur extract daily will permanently cure all recurring headaches within 48 hours.',
    reference_text: 'Mild headaches often respond well to hydration, rest in a quiet and dim environment, and over-the-counter pain relievers such as ibuprofen or acetaminophen when appropriate.'
  }
};

export default function SampleDataPicker({ onSelect }) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 mr-1">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Quick Test Presets:</span>
      </div>
      <button
        type="button"
        onClick={() => onSelect(SAMPLE_SCENARIOS.reliable)}
        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
      >
        ✓ Grounded / Reliable
      </button>
      <button
        type="button"
        onClick={() => onSelect(SAMPLE_SCENARIOS.hallucinated)}
        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
      >
        ✕ Contradicted / Hallucination
      </button>
      <button
        type="button"
        onClick={() => onSelect(SAMPLE_SCENARIOS.unsupported)}
        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
      >
        ⚠ Unsupported Claims
      </button>
    </div>
  );
}
