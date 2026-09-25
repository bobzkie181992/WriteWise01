/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useWriteWise } from '../WriteWiseContext';
import { ShieldCheck, HelpCircle, FileSignature, Save, AlertCircle } from 'lucide-react';

export const AIUseProfile: React.FC = () => {
  const { state } = useWriteWise();
  const paper = state.papers.find(p => p.studentId === (state.currentUser?.id || 'student-1')) || state.papers[0];

  const wordSuggestionsAccepted = paper.sections.reduce((acc, s) => acc + s.wordPredictionsAccepted, 0) || 18;
  const aiFeedbackRequests = paper.sections.reduce((acc, s) => acc + s.aiFeedbackRequests, 0) || 11;

  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [declaredExternalAI, setDeclaredExternalAI] = useState('No external AI tools were used for this paper draft.');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveDeclaration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationChecked) {
      alert('Please check the box confirming your academic responsibility.');
      return;
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ethics & Integrity</span>
        <h2 className="text-xl font-bold font-serif text-slate-900">AI-Use Profile</h2>
        <p className="text-xs text-slate-500">Review your observable writing activities and declare your external tool usage to your instructor.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (6 cols): AI assistance metrics */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-700 font-serif border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <ShieldCheck className="h-5 w-5 text-[#1F8A8A]" /> Internal AI Assistance Usage
          </h3>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-600">Word Predictions Accepted</span>
                <span className="font-bold text-[#17365D]">{wordSuggestionsAccepted} times</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#F4B942] h-full" style={{ width: `${Math.min((wordSuggestionsAccepted / 30) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-600">Revision Feedback Requested</span>
                <span className="font-bold text-[#17365D]">{aiFeedbackRequests} times</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#1F8A8A] h-full" style={{ width: `${Math.min((aiFeedbackRequests / 20) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-600">Direct Paragraph Generation</span>
                <span className="font-bold text-green-600">0 / None</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-0"></div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-lg text-[11px] text-slate-500 leading-normal">
            <strong>Platform Note:</strong> WriteWise uses AI helper agents primarily to provide guidance, suggestions, and vocabulary feedback rather than to generate complete academic papers. This reduces dependencies on LLMs.
          </div>
        </div>

        {/* Right Column (6 cols): Honor declaration */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 font-sans">
          <h3 className="text-sm font-bold text-slate-700 font-serif border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <FileSignature className="h-5 w-5 text-[#17365D]" /> Academic Integrity Declaration
          </h3>

          <form onSubmit={handleSaveDeclaration} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 uppercase">External AI Declarations</label>
              <textarea
                value={declaredExternalAI}
                onChange={(e) => setDeclaredExternalAI(e.target.value)}
                placeholder="Declare if you used any external spelling or draft software (e.g., Grammarly, Gemini search, ChatGPT outline guides)..."
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A] min-h-[70px]"
              />
            </div>

            <div className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-200/50">
              <input
                required
                id="agree-checkbox"
                type="checkbox"
                checked={declarationChecked}
                onChange={(e) => setDeclarationChecked(e.target.checked)}
                className="mt-0.5 rounded text-[#1F8A8A] focus:ring-[#1F8A8A] cursor-pointer"
              />
              <label htmlFor="agree-checkbox" className="text-[11px] text-slate-600 leading-normal cursor-pointer">
                <strong>Honor Pledge:</strong> I understand that I remain responsible for the ideas, evidence, wording, citations, and final submission of my research paper. I confirm all draft content represents my own independent scholarship.
              </label>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 text-slate-400" /> Automatically visible to Mrs. Santos
              </span>
              <button
                type="submit"
                className="px-4 py-2 bg-[#17365D] hover:bg-[#112643] text-white font-semibold rounded-lg shadow-sm flex items-center gap-1 transition-all"
              >
                {isSaved ? 'Declaration Saved ✓' : 'Save Declaration'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
