/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useWriteWise } from '../WriteWiseContext';
import { ClipboardList, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

interface PreSurveyProps {
  onComplete: () => void;
}

export const PreSurvey: React.FC<PreSurveyProps> = ({ onComplete }) => {
  const { savePreSurvey, state } = useWriteWise();
  const [answers, setAnswers] = useState<Record<string, number>>({
    sews_ideation_1: 2,
    sews_ideation_2: 2,
    sews_conventions_1: 2,
    sews_conventions_2: 2,
    sews_regulation_1: 2,
    sews_regulation_2: 2,
    ailq_affective_1: 2,
    ailq_affective_2: 2,
    ailq_behavioural_1: 2,
    ailq_behavioural_2: 2,
    ailq_cognitive_1: 2,
    ailq_cognitive_2: 2,
    ailq_ethical_1: 2,
    ailq_ethical_2: 2,
    atp_positive_1: 2,
    atp_positive_2: 2,
    atp_negative_1: 2,
    atp_negative_2: 2,
    atp_norms_1: 2,
    atp_norms_2: 2
  });
  const [showPlacement, setShowPlacement] = useState(false);
  const [assignedTrack, setAssignedTrack] = useState<'foundational' | 'advanced'>('foundational');

  const questions = {
    efficacy: [
      { id: 'sews_ideation_1', label: 'I feel confident that I can write down my thoughts clearly to formulate a research problem statement.', sub: 'Ideation Subscale' },
      { id: 'sews_ideation_2', label: 'I can generate original, arguable claims for my paper without looking at external text first.', sub: 'Ideation Subscale' },
      { id: 'sews_conventions_1', label: 'I feel comfortable structuring a formal paragraph and integrating citations in APA format.', sub: 'Writing Conventions Subscale' },
      { id: 'sews_conventions_2', label: 'I can correct spelling, grammatical errors, and sentence fragments in my own drafts.', sub: 'Writing Conventions Subscale' },
      { id: 'sews_regulation_1', label: 'I can continue writing my paper even when I am feeling distracted or stuck.', sub: 'Self-Regulation Subscale' },
      { id: 'sews_regulation_2', label: 'I can plan my writing time effectively to meet all drafting deadlines.', sub: 'Self-Regulation Subscale' }
    ],
    ai: [
      { id: 'ailq_affective_1', label: 'I feel anxious or lost when writing academic research papers without having an AI assistant open.', sub: 'Affective Dimension' },
      { id: 'ailq_affective_2', label: 'I feel secure and confident when using my own words rather than AI-generated sentences.', sub: 'Affective Dimension' },
      { id: 'ailq_behavioural_1', label: 'I tend to rely on generative AI tools to compose complete body paragraphs for my school tasks.', sub: 'Behavioural Dimension' },
      { id: 'ailq_behavioural_2', label: 'I regularly prompt AI to provide sentence-by-sentence phrasing when I draft my research.', sub: 'Behavioural Dimension' },
      { id: 'ailq_cognitive_1', label: 'I understand the difference between using AI for autocomplete suggestions vs. letting AI generate entire ideas.', sub: 'Cognitive Dimension' },
      { id: 'ailq_cognitive_2', label: 'I am aware that generative AI tools can construct false or hallucinated research references.', sub: 'Cognitive Dimension' },
      { id: 'ailq_ethical_1', label: 'I believe it is academically honest to submit AI-generated text as if it were my own original writing.', sub: 'Ethical Dimension' },
      { id: 'ailq_ethical_2', label: 'I understand why copying and pasting AI-generated paragraphs without citation constitutes a form of academic dishonesty.', sub: 'Ethical Dimension' }
    ],
    orig: [
      { id: 'atp_positive_1', label: 'In some situations, copy-pasting small paragraphs from websites without citation is acceptable.', sub: 'Positive Attitudes Dimension' },
      { id: 'atp_positive_2', label: 'Plagiarism is not a big deal as long as the student gets a passing grade on the assignment.', sub: 'Positive Attitudes Dimension' },
      { id: 'atp_negative_1', label: 'Plagiarism defeats the educational purpose of learning how to think and write independently.', sub: 'Negative Attitudes Dimension' },
      { id: 'atp_negative_2', label: 'I feel a sense of guilt or personal dishonesty if I use someone else’s wording without proper attribution.', sub: 'Negative Attitudes Dimension' },
      { id: 'atp_norms_1', label: 'Most students in my school section think that paraphrasing without citation is normal and expected.', sub: 'Subjective Norms Dimension' },
      { id: 'atp_norms_2', label: 'My peers expect me to submit work that is completely my own, without copied content.', sub: 'Subjective Norms Dimension' }
    ]
  };

  const handleValChange = (qId: string, val: number) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Diagnostic calculation
    const listSews = [
      answers.sews_ideation_1, answers.sews_ideation_2, 
      answers.sews_conventions_1, answers.sews_conventions_2, 
      answers.sews_regulation_1, answers.sews_regulation_2
    ];
    const avgEfficacy = listSews.reduce((a, b) => a + b, 0) / listSews.length;

    const listAilq = [
      answers.ailq_affective_1, answers.ailq_behavioural_1, answers.ailq_behavioural_2
    ];
    const avgAIReliance = listAilq.reduce((a, b) => a + b, 0) / listAilq.length;
    
    // On 1-4 scale, 2.5 is the exact midpoint. Foundational if high AI reliance (>= 2.5) or lower efficacy (< 2.5)
    const track = (avgAIReliance >= 2.5 || avgEfficacy < 2.5) ? 'foundational' : 'advanced';
    setAssignedTrack(track);

    // Save to context
    savePreSurvey(answers);
    setShowPlacement(true);
  };

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 lg:p-8 bg-white rounded-xl border border-slate-200 shadow-sm font-sans">
      {!showPlacement ? (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3 text-center border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-[#17365D] rounded-full text-xs font-semibold">
              <ClipboardList className="h-4 w-4" /> Grade 11 Participant Baseline Protocol
            </div>
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-slate-900">
              Adapted Pre-Survey Assessment
            </h1>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Please answer these baseline questions truthfully before using the application. Your answers calibrate your scaffolded drafting assistance track and establish your initial writing confidence baseline.
            </p>
          </div>

          {/* Section 1: Writing Self-Efficacy (SEWS) */}
          <div className="space-y-4">
            <div className="border-l-4 border-emerald-600 pl-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#17365D]">
                Scale A: Self-Efficacy for Writing Scale (SEWS)
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">Measures Ideation, Conventions, and Self-Regulation confidence</p>
            </div>
            <div className="space-y-4">
              {questions.efficacy.map((q) => (
                <div key={q.id} className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-sm font-medium text-slate-800">{q.label}</p>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">{q.sub}</span>
                  </div>
                  <div className="pt-1 max-w-md">
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { val: 1, label: 'Strongly Disagree' },
                        { val: 2, label: 'Disagree' },
                        { val: 3, label: 'Agree' },
                        { val: 4, label: 'Strongly Agree' }
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => handleValChange(q.id, item.val)}
                          className={`py-2 px-1 rounded-lg flex flex-col items-center justify-center font-bold text-xs transition-all ${answers[q.id] === item.val ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'}`}
                        >
                          <span className="text-xs">{item.val}</span>
                          <span className="text-[7px] font-semibold uppercase tracking-wider mt-0.5">{item.label.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: AI Literacy Questionnaire (AILQ) */}
          <div className="space-y-4">
            <div className="border-l-4 border-[#1F8A8A] pl-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#17365D]">
                Scale B: AI Literacy Questionnaire (AILQ)
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">Measures Affective, Behavioural, Cognitive, and Ethical dimensions of AI use</p>
            </div>
            <div className="space-y-4">
              {questions.ai.map((q) => (
                <div key={q.id} className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-sm font-medium text-slate-800">{q.label}</p>
                    <span className="text-[9px] font-bold text-[#1F8A8A] bg-teal-50 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">{q.sub}</span>
                  </div>
                  <div className="pt-1 max-w-md">
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { val: 1, label: 'Strongly Disagree' },
                        { val: 2, label: 'Disagree' },
                        { val: 3, label: 'Agree' },
                        { val: 4, label: 'Strongly Agree' }
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => handleValChange(q.id, item.val)}
                          className={`py-2 px-1 rounded-lg flex flex-col items-center justify-center font-bold text-xs transition-all ${answers[q.id] === item.val ? 'bg-[#1F8A8A] text-white shadow-sm' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'}`}
                        >
                          <span className="text-xs">{item.val}</span>
                          <span className="text-[7px] font-semibold uppercase tracking-wider mt-0.5">{item.label.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Attitudes Toward Plagiarism (ATP) */}
          <div className="space-y-4">
            <div className="border-l-4 border-[#EA580C] pl-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#17365D]">
                Scale C: Attitudes Toward Plagiarism (ATP) Questionnaire
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">Measures Positive attitudes, Negative attitudes, and Subjective norms towards Plagiarism</p>
            </div>
            <div className="space-y-4">
              {questions.orig.map((q) => (
                <div key={q.id} className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-sm font-medium text-slate-800">{q.label}</p>
                    <span className="text-[9px] font-bold text-[#EA580C] bg-orange-50 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">{q.sub}</span>
                  </div>
                  <div className="pt-1 max-w-md">
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { val: 1, label: 'Strongly Disagree' },
                        { val: 2, label: 'Disagree' },
                        { val: 3, label: 'Agree' },
                        { val: 4, label: 'Strongly Agree' }
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => handleValChange(q.id, item.val)}
                          className={`py-2 px-1 rounded-lg flex flex-col items-center justify-center font-bold text-xs transition-all ${answers[q.id] === item.val ? 'bg-[#EA580C] text-white shadow-sm' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'}`}
                        >
                          <span className="text-xs">{item.val}</span>
                          <span className="text-[7px] font-semibold uppercase tracking-wider mt-0.5">{item.label.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="w-full py-3 bg-[#17365D] text-white font-semibold text-sm rounded-lg hover:bg-[#112643] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              Analyze Answers & Determine Support Track <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6 text-center py-6">
          <div className="w-16 h-16 bg-[#1F8A8A]/10 text-[#1F8A8A] rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900">Your Diagnostic Profile</h2>
          
          <div className="p-6 bg-[#F7F9FC] border border-slate-200 rounded-xl max-w-md mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#17365D]">Assigned Support Track</span>
            <div className={`text-2xl font-bold font-serif uppercase ${assignedTrack === 'foundational' ? 'text-[#F4B942]' : 'text-[#1F8A8A]'}`}>
              {assignedTrack === 'foundational' ? 'Foundational Track' : 'Advanced Track'}
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed font-sans pt-2">
              {assignedTrack === 'foundational' 
                ? 'Your profile suggests you would benefit from full writing scaffolding. We have pre-configured worked templates, paragraph starters, and step-by-step structures in your workspace to ease you into original academic composition.' 
                : 'Your profile suggests you possess solid baseline confidence! We have adjusted your assistance to provide reduced scaffolding, focusing on complex prompt extensions, source evaluation, and synthesis challenges.'}
            </p>
          </div>

          <div className="flex items-start gap-3 bg-[#F4B942]/10 border border-[#F4B942]/20 rounded-lg p-4 max-w-md mx-auto text-left">
            <AlertCircle className="h-5 w-5 text-[#D98E04] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-normal">
              <strong>Support Terminology Note:</strong> Your assigned track represents your immediate learning support settings. These settings can be adjusted by your teacher in the dashboard at any time as your writing skills mature.
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={onComplete}
              className="px-8 py-3 bg-[#17365D] hover:bg-[#112643] text-white text-sm font-semibold rounded-lg transition-all shadow-sm inline-flex items-center gap-2"
            >
              Enter Your Writing Workspace <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
