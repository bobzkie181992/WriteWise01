/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useWriteWise } from '../WriteWiseContext';
import { Compass, Sparkles, Award, Save, RefreshCw } from 'lucide-react';

export const Reflection: React.FC = () => {
  const { state, saveReflection } = useWriteWise();
  const paper = state.papers.find(p => p.studentId === (state.currentUser?.id || 'student-1')) || state.papers[0];

  const [planning, setPlanning] = useState(paper.reflectionText?.planning || '');
  const [monitoring, setMonitoring] = useState(paper.reflectionText?.monitoring || '');
  const [reflection, setReflection] = useState(paper.reflectionText?.reflection || '');
  const [evaluation, setEvaluation] = useState(paper.reflectionText?.evaluation || '');
  const [adaptation, setAdaptation] = useState(paper.reflectionText?.adaptation || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    saveReflection({
      planning,
      monitoring,
      reflection,
      evaluation,
      adaptation
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Metacognition Cycle</span>
          <h2 className="text-xl font-bold font-serif text-slate-900">SRL Reflection Worksheet</h2>
          <p className="text-xs text-slate-500">Record your cognitive processes throughout the Plan → Write → Monitor → Revise → Reflect cycle.</p>
        </div>
        {paper.reflectionCompleted && (
          <span className="px-3 py-1 bg-green-50 border border-green-100 text-green-700 text-xs font-bold rounded-lg flex items-center gap-1">
            <Award className="h-4 w-4" /> Reflection Completed
          </span>
        )}
      </div>

      <form onSubmit={handleSaveReflection} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2 p-4 bg-slate-50 border border-slate-100 rounded-lg">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">1. PLANNING STAGE</label>
            <span className="text-slate-400 block mb-2 leading-tight">"What did you want your paper sections to accomplish before you started writing?"</span>
            <textarea
              required
              value={planning}
              onChange={(e) => setPlanning(e.target.value)}
              placeholder="e.g. My primary objective was to clearly establish that local social media usage has negative effects on sleep and grades, backed by Philippine pediatric findings..."
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A] min-h-[100px] font-sans"
            />
          </div>

          <div className="space-y-2 p-4 bg-slate-50 border border-slate-100 rounded-lg">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">2. MONITORING STAGE</label>
            <span className="text-slate-400 block mb-2 leading-tight">"How did you monitor your draft's flow to ensure paragraphs supported your central thesis?"</span>
            <textarea
              required
              value={monitoring}
              onChange={(e) => setMonitoring(e.target.value)}
              placeholder="e.g. I consistently read through paragraphs to verify whether they linked back to cognitive fatigue or notifications, weeding out irrelevant sentences..."
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A] min-h-[100px] font-sans"
            />
          </div>

          <div className="space-y-2 p-4 bg-slate-50 border border-slate-100 rounded-lg">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">3. REFLECTION STAGE</label>
            <span className="text-slate-400 block mb-2 leading-tight">"What specific changes did you make during revisions based on the 'What to Do Next?' feedback?"</span>
            <textarea
              required
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="e.g. I eliminated informal pronouns like 'I think', integrated Dela Cruz (2023) to synthesize literature arguments, and formatted parenthetical citations..."
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A] min-h-[100px] font-sans"
            />
          </div>

          <div className="space-y-2 p-4 bg-slate-50 border border-slate-100 rounded-lg">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">4. EVALUATION STAGE</label>
            <span className="text-slate-400 block mb-2 leading-tight">"Which part of your research argument is currently the strongest? Why?"</span>
            <textarea
              required
              value={evaluation}
              onChange={(e) => setEvaluation(e.target.value)}
              placeholder="e.g. The Review of Related Literature, because it compares opposing local views (Cruz and Santos) directly, building a solid foundation for my arguments..."
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A] min-h-[100px] font-sans"
            />
          </div>

        </div>

        <div className="space-y-2 p-4 bg-slate-50 border border-slate-100 rounded-lg">
          <label className="font-bold text-slate-700 uppercase tracking-wider block">5. ADAPTATION STAGE</label>
          <span className="text-slate-400 block mb-2 leading-tight">"What writing or research skills will you do differently in your next research project?"</span>
          <textarea
            required
            value={adaptation}
            onChange={(e) => setAdaptation(e.target.value)}
            placeholder="e.g. I will start by building my Source Bank comprehensively, drafting outlines first, and relying on predictive tools solely for word choice rather than idea structure..."
            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A] min-h-[80px] font-sans"
          />
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Compass className="h-4 w-4" /> Reflections help cement self-regulated learning gains.
          </span>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#17365D] hover:bg-[#112643] text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-1"
          >
            {isSaved ? 'Reflections Saved ✓' : 'Save Reflection Log'}
          </button>
        </div>
      </form>
    </div>
  );
};
