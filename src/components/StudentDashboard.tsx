/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useWriteWise } from '../WriteWiseContext';
import { BookOpen, CheckCircle, Clock, AlertTriangle, ChevronRight, HelpCircle, FileText, Compass, Sparkles, BookMarked, Layers, Award } from 'lucide-react';

const getGradeInterpretation = (gradeStr: string | number | undefined) => {
  if (!gradeStr) return null;
  const grade = parseFloat(String(gradeStr));
  if (isNaN(grade)) return null;

  if (grade >= 4.21 && grade <= 5.00) {
    return { rating: 'Excellent', desc: 'No revision needed', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  } else if (grade >= 3.41 && grade < 4.21) {
    return { rating: 'Very Satisfactory', desc: 'Minor revisions optional', color: 'text-blue-700 bg-blue-50 border-blue-200' };
  } else if (grade >= 2.61 && grade < 3.41) {
    return { rating: 'Satisfactory', desc: 'Revisions needed', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  } else if (grade >= 1.81 && grade < 2.61) {
    return { rating: 'Unsatisfactory', desc: 'Major revisions required', color: 'text-orange-700 bg-orange-50 border-orange-200' };
  } else if (grade >= 1.00 && grade < 1.81) {
    return { rating: 'Poor', desc: 'Complete redesign', color: 'text-red-700 bg-red-50 border-red-200' };
  }
  return null;
};

interface StudentDashboardProps {
  onNavigate: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { state } = useWriteWise();
  const paper = state.papers.find(p => p.studentId === (state.currentUser?.id || 'student-1')) || state.papers[0];
  const user = state.currentUser || { name: 'Alex Marasigan', track: 'foundational' };

  // Calculate stats dynamically from paper data
  const totalSections = paper.sections.length;
  const completedSections = paper.sections.filter(s => s.status === 'completed').length;
  const totalRevisions = paper.sections.reduce((acc, s) => acc + s.revisionCount, 0) + (paper.draftHistory?.length || 0);
  const wordSuggestionsAccepted = paper.sections.reduce((acc, s) => acc + s.wordPredictionsAccepted, 0) || 18;
  const aiFeedbackRequests = paper.sections.reduce((acc, s) => acc + s.aiFeedbackRequests, 0) || 11;

  // AI Assistance assessment
  let assistLevel = 'LOW';
  if (aiFeedbackRequests > 15 || wordSuggestionsAccepted > 25) {
    assistLevel = 'MODERATE';
  }

  return (
    <div className="space-y-6">
      {/* 1. Welcome Panel */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold font-serif text-slate-900">Good morning, {user.name}!</h2>
          <p className="text-xs text-slate-500">
            You are participating in the <strong>WriteWise</strong> research project: a tiered scaffolding framework fostering independent, AI-balanced, and plagiarism-free formal paper writing among Grade 11 students.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Support Track</span>
            <span className="font-serif font-bold text-sm text-[#1F8A8A] uppercase">{paper.track}</span>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            className="text-xs text-[#17365D] hover:underline font-semibold"
          >
            Request Change
          </button>
        </div>
      </div>

      {/* Grid of Main Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): My Current Paper & What to Do Next */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card: My Current Paper */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">My Current Paper</span>
              <span className="text-xs text-[#1F8A8A] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1F8A8A] animate-pulse"></span> Active Drafting
              </span>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-lg font-bold font-serif text-[#17365D] hover:underline cursor-pointer" onClick={() => onNavigate('workspace')}>
                  “{paper.title}”
                </h3>
                <span className="text-xs text-slate-400">Assignment: Grade 11 Practical Research Paper</span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-600">Writing Progress</span>
                  <span className="font-bold text-[#17365D]">{paper.progress}% Complete</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#17365D] h-full transition-all duration-500" 
                    style={{ width: `${paper.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Section / Status */}
              <div className="grid grid-cols-2 gap-4 py-2 text-xs border-t border-slate-100 pt-4">
                <div>
                  <span className="block text-slate-400">Current Section</span>
                  <span className="font-semibold text-slate-700">Review of Related Literature</span>
                </div>
                <div>
                  <span className="block text-slate-400">Section Status</span>
                  <span className="font-bold text-[#D98E04] flex items-center gap-1">
                    <AlertTriangle className="h-3 w.5" /> Needs Revision
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => onNavigate('workspace')}
                  className="px-5 py-2.5 bg-[#17365D] hover:bg-[#112643] text-white text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                >
                  Continue Writing <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Card: What to Do Next */}
          <div className="bg-white rounded-xl border border-[#D98E04]/20 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-[#F4B942]/5 flex justify-between items-center">
              <span className="text-xs font-bold text-[#D98E04] uppercase tracking-widest flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> WHAT TO DO NEXT?
              </span>
              <span className="text-xs text-slate-400">Rubric-Based Coaching Guide</span>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500">
                WriteWise analyzed your latest Literature Review draft and prioritized these specific revisions:
              </p>

              <div className="space-y-3">
                <div className="flex gap-3 items-start p-3 bg-amber-50/40 border border-[#F4B942]/10 rounded-lg">
                  <span className="w-5 h-5 bg-[#F4B942]/10 text-[#D98E04] rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">Strengthen the synthesis between Sources 2 and 3.</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Compare Santos (2025) and Dela Cruz (2023) back-to-back to highlight how notification distractions relate to late-night screen time.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-amber-50/40 border border-[#F4B942]/10 rounded-lg">
                  <span className="w-5 h-5 bg-[#F4B942]/10 text-[#D98E04] rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">Remove subjective phrasing ("I think") in literature synthesis.</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">To maintain formal academic tone, state your synthesis of ideas objectively rather than asserting personal views directly.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-amber-50/40 border border-[#F4B942]/10 rounded-lg">
                  <span className="w-5 h-5 bg-[#F4B942]/10 text-[#D98E04] rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">Check citation format of recent factual claims.</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Ensure the factual claim on cognitive fatigue is explicitly linked to its respective parenthetical study citation.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => onNavigate('workspace')}
                  className="px-5 py-2.5 bg-[#1F8A8A] hover:bg-[#1a7575] text-white text-xs font-semibold rounded-lg transition-all shadow-sm"
                >
                  Open Writing Workspace
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Writing Stats & AI Assistance Summary */}
        <div className="lg:col-span-4 space-y-6 font-sans">
          
          {/* Card: Teacher Evaluation & Rating */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Award className="h-4 w-4 text-[#1F8A8A]" /> Advisor Evaluation
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-100 text-slate-600 font-bold uppercase border border-slate-200">5-Point Rubric</span>
            </div>

            {paper.grade ? (
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-[#1F8A8A] text-white rounded-lg flex flex-col items-center justify-center shadow-sm shrink-0">
                  <span className="text-lg font-bold font-mono">{parseFloat(String(paper.grade)).toFixed(2)}</span>
                  <span className="text-[7px] font-semibold uppercase tracking-wider opacity-85 mt-[-2px]">Score</span>
                </div>
                <div>
                  {(() => {
                    const interpretation = getGradeInterpretation(paper.grade);
                    if (interpretation) {
                      return (
                        <>
                          <h4 className="font-bold text-[#17365D] text-xs font-serif">{interpretation.rating}</h4>
                          <span className="text-[10px] text-slate-500 block leading-tight">{interpretation.desc}</span>
                        </>
                      );
                    }
                    return <span className="text-xs text-slate-500 font-semibold">Evaluated</span>;
                  })()}
                </div>
              </div>
            ) : (
              <div className="py-2 text-center bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                <span className="text-xs text-slate-400 font-medium">Evaluation Pending Submission</span>
                <p className="text-[9px] text-slate-400 mt-0.5 px-3">Your advisor will rate your draft on a 5-point scale once submitted.</p>
              </div>
            )}

            {/* Standard descriptive interpretation legends */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Rubric Scale Benchmarks:</span>
              <div className="grid grid-cols-1 gap-1.5 text-[10px] text-slate-600">
                <div className="flex justify-between items-center bg-emerald-50/50 p-1 px-1.5 rounded border border-emerald-100/50">
                  <span className="font-bold text-emerald-800">4.21 – 5.00</span>
                  <span className="text-slate-500 text-[9px]">Excellent / No Revision</span>
                </div>
                <div className="flex justify-between items-center bg-blue-50/50 p-1 px-1.5 rounded border border-blue-100/50">
                  <span className="font-bold text-blue-800">3.41 – 4.20</span>
                  <span className="text-slate-500 text-[9px]">Very Satisfactory / Minor Rev.</span>
                </div>
                <div className="flex justify-between items-center bg-amber-50/50 p-1 px-1.5 rounded border border-amber-100/50">
                  <span className="font-bold text-amber-800">2.61 – 3.40</span>
                  <span className="text-slate-500 text-[9px]">Satisfactory / Revisions Needed</span>
                </div>
                <div className="flex justify-between items-center bg-orange-50/50 p-1 px-1.5 rounded border border-orange-100/50">
                  <span className="font-bold text-orange-800">1.81 – 2.60</span>
                  <span className="text-slate-500 text-[9px]">Unsatisfactory / Major Rev.</span>
                </div>
                <div className="flex justify-between items-center bg-red-50/50 p-1 px-1.5 rounded border border-red-100/50">
                  <span className="font-bold text-red-800">1.00 – 1.80</span>
                  <span className="text-slate-500 text-[9px]">Poor / Complete Redesign</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Writing Progress Stats */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Writing Progress</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                <span className="block text-xs text-slate-400">Self-Efficacy</span>
                <span className="font-serif font-bold text-lg text-[#17365D] tracking-tight">3.6 <span className="text-xs text-slate-400">/ 5</span></span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                <span className="block text-xs text-slate-400">Completed Sections</span>
                <span className="font-serif font-bold text-lg text-[#17365D] tracking-tight">{completedSections} <span className="text-xs text-slate-400">/ {totalSections}</span></span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                <span className="block text-xs text-slate-400">Revisions Done</span>
                <span className="font-serif font-bold text-lg text-[#17365D] tracking-tight">{totalRevisions}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                <span className="block text-xs text-slate-400">Source Citations</span>
                <span className="font-serif font-bold text-lg text-[#17365D] tracking-tight">{state.sources.filter(s => s.verified).length}</span>
              </div>
            </div>
          </div>

          {/* Card: AI Assistance Summary */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4 relative">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Assistance Summary</h3>
              <div className="group relative">
                <HelpCircle className="h-4 w-4 text-slate-400 cursor-help" />
                <div className="absolute right-0 bottom-6 hidden group-hover:block w-64 p-3 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl leading-relaxed z-20">
                  This indicator summarizes activity recorded within WriteWise. It does not prove or disprove external AI use or authorship.
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500">Word predictions accepted</span>
                <span className="font-mono font-bold text-slate-700">{wordSuggestionsAccepted}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500">AI feedback requests</span>
                <span className="font-mono font-bold text-slate-700">{aiFeedbackRequests}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-slate-500">Direct AI generation</span>
                <span className="font-mono font-bold text-green-600">None recorded</span>
              </div>
              
              <div className="pt-2">
                <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-100 rounded-lg text-green-800 text-xs font-bold justify-center">
                  <CheckCircle className="h-4 w-4" /> {assistLevel} AI ASSISTANCE
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links / Tile */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <button 
                onClick={() => onNavigate('sources')}
                className="flex items-center justify-between p-2.5 hover:bg-slate-50 border border-slate-100 rounded-lg text-left text-slate-700 font-medium"
              >
                <span className="flex items-center gap-2"><BookMarked className="h-4 w-4 text-[#1F8A8A]" /> Research & Source Bank</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
              <button 
                onClick={() => onNavigate('skills')}
                className="flex items-center justify-between p-2.5 hover:bg-slate-50 border border-slate-100 rounded-lg text-left text-slate-700 font-medium"
              >
                <span className="flex items-center gap-2"><Layers className="h-4 w-4 text-[#1F8A8A]" /> Academic Writing Modules</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
              <button 
                onClick={() => onNavigate('progress')}
                className="flex items-center justify-between p-2.5 hover:bg-slate-50 border border-slate-100 rounded-lg text-left text-slate-700 font-medium"
              >
                <span className="flex items-center gap-2"><Compass className="h-4 w-4 text-[#1F8A8A]" /> View My Progress</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Recent Activity Log */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Activity</h3>
        <div className="space-y-3 text-xs font-sans">
          <div className="flex gap-3 items-start border-l-2 border-green-500 pl-3">
            <Clock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-slate-800">Revised Introduction & Title Draft</span>
              <p className="text-slate-400 mt-0.5">Accepted recommendations, checked citations, and re-submitted section draft. Completed successfully.</p>
            </div>
            <span className="text-[10px] text-slate-400 shrink-0 ml-auto">Today</span>
          </div>

          <div className="flex gap-3 items-start border-l-2 border-slate-300 pl-3">
            <Clock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-slate-800">Added Local Source (Dela Cruz, 2023)</span>
              <p className="text-slate-400 mt-0.5">Saved citation metadata and student summary on Sleep Interruption to Source Bank.</p>
            </div>
            <span className="text-[10px] text-slate-400 shrink-0 ml-auto">Yesterday</span>
          </div>

          <div className="flex gap-3 items-start border-l-2 border-[#1F8A8A] pl-3">
            <Clock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-slate-800">Completed Diagnostic Baseline Assessment</span>
              <p className="text-slate-400 mt-0.5">Calibrated writing efficacy indicators and activated localized Foundational scaffold pathway.</p>
            </div>
            <span className="text-[10px] text-slate-400 shrink-0 ml-auto">Sep 21, 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
