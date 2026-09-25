/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useWriteWise } from '../WriteWiseContext';
import { Compass, Sparkles, UserCheck, BookOpenCheck, ChevronRight, GraduationCap } from 'lucide-react';

export const StudentProgress: React.FC = () => {
  const { state } = useWriteWise();
  const paper = state.papers.find(p => p.studentId === (state.currentUser?.id || 'student-1')) || state.papers[0];

  const categories = [
    { name: 'Writing Self-Efficacy', value: paper.preSurvey?.writingSelfEfficacy || 3.1, color: 'bg-indigo-500' },
    { name: 'Organization & Flow', value: 3.8, color: 'bg-[#1F8A8A]' },
    { name: 'Evidence Use', value: 3.2, color: 'bg-green-500' },
    { name: 'Coherence & Cohesion', value: 3.5, color: 'bg-[#F4B942]' },
    { name: 'Citation Style Accuracy', value: 2.8, color: 'bg-red-500' },
    { name: 'Revision Confidence', value: 3.6, color: 'bg-[#17365D]' }
  ];

  const progression = [
    { label: 'GUIDED', desc: 'Heavy structures, templates, worked examples, starters', active: paper.progress <= 30 },
    { label: 'SUPPORTED', desc: 'Vocabulary aids, structured prompts, checklists', active: paper.progress > 30 && paper.progress <= 60 },
    { label: 'DEVELOPING', desc: 'Targeted prompt checks, rubric feedback, revision advice', active: paper.progress > 60 && paper.progress < 100 },
    { label: 'INDEPENDENT', desc: 'Self-evaluation, references check, final proofreading', active: paper.progress === 100 }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">My Development</span>
        <h2 className="text-xl font-bold font-serif text-slate-900">Writing Progress & Independence</h2>
        <p className="text-xs text-slate-500">Track your transition from scaffolded writing into complete authorship and research independence.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Skill meters */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-700 font-serif flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <GraduationCap className="h-5 w-5 text-[#17365D]" /> Writing Capability Diagnostics
          </h3>

          <div className="space-y-4">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between items-center text-slate-600 font-medium">
                  <span>{cat.name}</span>
                  <span className="font-bold text-[#17365D] font-mono">{cat.value} / 5.0</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`${cat.color} h-full rounded-full`} 
                    style={{ width: `${(cat.value / 5.0) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 leading-normal">
            <strong>Individual Diagnostics:</strong> WriteWise tracks your capability based on survey responses and rubric feedback results. We never rank you publicly. This exists solely to visualize your own progress.
          </div>
        </div>

        {/* Right Column (5 cols): Independence timeline */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-700 font-serif flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Compass className="h-5 w-5 text-[#1F8A8A]" /> Writing Independence Continuum
          </h3>

          <div className="space-y-4 relative pl-4 border-l border-slate-200">
            {progression.map((stage, idx) => (
              <div key={idx} className="relative space-y-1">
                {/* timeline dot */}
                <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 ${stage.active ? 'bg-[#1F8A8A] border-[#1F8A8A] scale-125' : 'bg-white border-slate-300'}`}></span>
                
                <div className="flex justify-between items-center">
                  <span className={`text-[11px] font-bold uppercase tracking-widest ${stage.active ? 'text-[#1F8A8A]' : 'text-slate-400'}`}>
                    {stage.label} {stage.active && '· CURRENT LEVEL'}
                  </span>
                  {stage.active && (
                    <span className="text-[9px] font-bold bg-[#1F8A8A]/10 text-[#1F8A8A] px-2 py-0.5 rounded uppercase">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-normal font-sans pr-4">{stage.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#1F8A8A]/5 border border-[#1F8A8A]/10 rounded-lg flex gap-2.5 text-xs text-slate-700 leading-relaxed font-sans">
            <BookOpenCheck className="h-5 w-5 text-[#1F8A8A] shrink-0 mt-0.5" />
            <div>
              <strong>Gradual Release Mechanism:</strong>
              <p className="text-[11px] text-slate-500 mt-0.5">As your section progress climbs, WriteWise automatically scales back starting structures and challenges you with higher-level synthesis and refutations to prepare you for independent college writing.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
