/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useWriteWise } from '../WriteWiseContext';
import { Award, Compass, FileText, ChevronRight, CheckCircle2, RefreshCw, AlertCircle, Printer, Download, Sparkles } from 'lucide-react';
import { AutocompletePlayground } from './AutocompletePlayground';

export const PostSurvey: React.FC = () => {
  const { state, savePostSurvey, updatePaperSection } = useWriteWise();
  const paper = state.papers.find(p => p.studentId === (state.currentUser?.id || 'student-1')) || state.papers[0];

  const [step, setStep] = useState<'preview' | 'survey' | 'results'>(
    paper.postSurvey ? 'results' : 'preview'
  );

  const [answers, setAnswers] = useState<Record<string, number>>({
    sews_ideation_1: 3,
    sews_ideation_2: 3,
    sews_conventions_1: 4,
    sews_conventions_2: 3,
    sews_regulation_1: 3,
    sews_regulation_2: 4,
    ailq_affective_1: 1,
    ailq_affective_2: 4,
    ailq_behavioural_1: 1,
    ailq_behavioural_2: 2,
    ailq_cognitive_1: 3,
    ailq_cognitive_2: 4,
    ailq_ethical_1: 1,
    ailq_ethical_2: 4,
    atp_positive_1: 1,
    atp_positive_2: 1,
    atp_negative_1: 4,
    atp_negative_2: 4,
    atp_norms_1: 2,
    atp_norms_2: 4
  });

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

  // Force Sim completion of paper for demo convenience
  const handleSimComplete = () => {
    paper.sections.forEach(sec => {
      if (sec.content.trim() === '') {
        const dummyText = `This is a simulated completed draft paragraph for the ${sec.title} section of the Grade 11 research paper, demonstrating full academic structural compliance and structured vocabulary formatting.`;
        updatePaperSection(sec.id, dummyText, 'completed');
      } else {
        updatePaperSection(sec.id, sec.content, 'completed');
      }
    });
    alert('Simulation complete! All sections marked as completed. You can now preview and finalize your paper.');
  };

  const handleValChange = (qId: string, val: number) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePostSurvey(answers);
    setStep('results');
  };

  const handleDownload = () => {
    alert('Exporting student-authored final paper to DOCX/PDF...');
  };

  // Pre vs Post comparative math
  const preS = paper.preSurvey || { writingSelfEfficacy: 2.1, aiReliance: 3.4, originalityAttitudes: 2.0 };
  
  const listSews = [
    answers.sews_ideation_1, answers.sews_ideation_2, 
    answers.sews_conventions_1, answers.sews_conventions_2, 
    answers.sews_regulation_1, answers.sews_regulation_2
  ];
  const listAilq = [
    answers.ailq_affective_1, answers.ailq_behavioural_1, answers.ailq_behavioural_2
  ];
  const listAtp = [
    answers.atp_positive_1, answers.atp_positive_2,
    answers.atp_negative_1, answers.atp_negative_2,
    answers.atp_norms_1, answers.atp_norms_2
  ];

  const postS = paper.postSurvey || {
    writingSelfEfficacy: parseFloat((listSews.reduce((a, b) => a + b, 0) / listSews.length).toFixed(1)),
    aiReliance: parseFloat((listAilq.reduce((a, b) => a + b, 0) / listAilq.length).toFixed(1)),
    originalityAttitudes: parseFloat((listAtp.reduce((a, b) => a + b, 0) / listAtp.length).toFixed(1))
  };

  const diffEfficacy = parseFloat((postS.writingSelfEfficacy - preS.writingSelfEfficacy).toFixed(1));
  const diffAI = parseFloat((postS.aiReliance - preS.aiReliance).toFixed(1));
  const diffOrig = parseFloat((postS.originalityAttitudes - preS.originalityAttitudes).toFixed(1));

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step 5 — Finalization</span>
          <h2 className="text-xl font-bold font-serif text-slate-900">Finalized Original Formal Paper</h2>
          <p className="text-xs text-slate-500">Preview your full writing composition, submit post-survey reflection, and track your writing growth.</p>
        </div>
        {step === 'results' && (
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1"
            >
              <Download className="h-4 w-4" /> Export DOCX
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-[#17365D] hover:bg-[#112643] text-white rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <Printer className="h-4 w-4" /> Print Paper
            </button>
          </div>
        )}
      </div>

      {step === 'preview' && (
        <div className="space-y-6">
          {/* Simulation Helper Banner if not 100% complete */}
          {paper.progress < 100 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-amber-800 uppercase tracking-wider block">Sandbox Demo convenience</span>
                <p className="text-slate-600">Your research paper is currently at <strong>{paper.progress}% completion</strong>. To view the final compiled layout, you can quickly simulate completion of any unfinished draft sections.</p>
              </div>
              <button
                onClick={handleSimComplete}
                className="px-4 py-2 bg-[#D98E04] hover:bg-[#b07302] text-white font-bold rounded-lg transition-all whitespace-nowrap"
              >
                Simulate Paper Completion
              </button>
            </div>
          )}

          {/* Compiled Document Preview Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden font-sans">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center text-xs text-slate-400 uppercase font-bold tracking-wider">
              <span>Full compiled manuscript</span>
              <span className="text-[#1F8A8A]">Student-Authored Final Paper</span>
            </div>

            <div className="p-8 lg:p-12 space-y-6 max-h-[450px] overflow-y-auto font-serif text-slate-800 leading-relaxed max-w-2xl mx-auto">
              {/* Paper Title */}
              <div className="text-center space-y-2 pb-6 border-b border-slate-100">
                <h1 className="text-2xl font-bold font-serif text-slate-950 capitalize">
                  {paper.sections.find(s => s.id === 'sec-title')?.content || 'Untranslated Title Draft'}
                </h1>
                <p className="text-xs font-sans text-slate-400 uppercase tracking-widest pt-2">By Alex Marasigan</p>
                <p className="text-xs font-sans text-slate-400">Grade 11 Student · Manila High School</p>
              </div>

              {/* Sections compilations */}
              {paper.sections.slice(1).map((sec) => (
                <div key={sec.id} className="space-y-2">
                  <h3 className="text-xs font-sans font-bold uppercase text-[#17365D] tracking-widest pt-4">
                    {sec.title}
                  </h3>
                  {sec.content ? (
                    <p className="text-sm font-sans text-slate-700 indent-6 whitespace-pre-line">
                      {sec.content}
                    </p>
                  ) : (
                    <p className="text-xs font-sans text-slate-300 italic">
                      [Drafting in progress... this section has not been submitted yet]
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Final Submission triggers */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="text-xs text-slate-500 font-sans">
                {paper.progress === 100 
                  ? 'All sections comply with the Practical Research standards. You are ready to complete your post-survey!' 
                  : 'Please complete or simulate all paper sections to proceed.'}
              </span>
              <button
                disabled={paper.progress < 100}
                onClick={() => setStep('survey')}
                className="px-6 py-2.5 bg-[#17365D] hover:bg-[#112643] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-40 transition-all font-sans"
              >
                Proceed to Post-Survey <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Autocomplete Suite directly below the finalized paper */}
          <div className="pt-6 border-t border-slate-200/80">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#17365D] text-white rounded-lg shadow-2xs">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Academic Autocomplete Suite
                  </h3>
                  <p className="text-xs text-slate-500">
                    Practice academic phrasing, test scholarly vocabulary, and refine sentence structures directly below your finalized paper.
                  </p>
                </div>
              </div>
            </div>
            <AutocompletePlayground />
          </div>
        </div>
      )}

      {step === 'survey' && (
        <form onSubmit={handleSurveySubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-8 font-sans">
          <div className="space-y-3 text-center border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
              <Award className="h-4 w-4" /> Grade 11 Participant Post-Survey Protocol
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">Adapted Post-Survey Assessment</h1>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">
              Congratulations on completing your formal research paper! To finalize the study protocol, please complete this adapted post-survey so WriteWise can analyze your writing self-efficacy growth and independent authorship metrics.
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

          <button
            type="submit"
            className="w-full py-3 bg-[#17365D] hover:bg-[#112643] text-white font-semibold text-sm rounded-lg shadow-sm"
          >
            Submit Growth Survey & View Analytics
          </button>
        </form>
      )}

      {step === 'results' && (
        <div className="space-y-6">
          {/* Certificate banner */}
          <div className="bg-[#1F8A8A]/10 border border-[#1F8A8A]/20 p-6 rounded-xl flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 bg-white text-[#1F8A8A] rounded-full flex items-center justify-center shadow-sm shrink-0">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-lg">Congratulations! Your Research Paper is Certified Original</h3>
              <p className="text-xs text-slate-500 mt-0.5">Alex Marasigan, you have successfully planned, cited, drafted, and revised your formal manuscript without generative dependence.</p>
            </div>
          </div>

          {/* Comparative analytics cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            
            {/* Self-Efficacy card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold block">Writing Self-Efficacy</span>
              <div className="flex justify-between items-baseline pt-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">PRE / POST</span>
                  <span className="font-serif font-bold text-2xl text-slate-800 tracking-tight">
                    {preS.writingSelfEfficacy} <span className="text-xs font-normal font-sans">→</span> {postS.writingSelfEfficacy}
                  </span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${diffEfficacy >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {diffEfficacy >= 0 ? `+${diffEfficacy}` : diffEfficacy} (Confidence)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal font-sans pt-1">Shows a positive shift in your self-assessed capability to draft and citation-format papers independently.</p>
            </div>

            {/* AI Reliance card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold block">AI Tool Reliance</span>
              <div className="flex justify-between items-baseline pt-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">PRE / POST</span>
                  <span className="font-serif font-bold text-2xl text-slate-800 tracking-tight">
                    {preS.aiReliance} <span className="text-xs font-normal font-sans">→</span> {postS.aiReliance}
                  </span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${diffAI <= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {diffAI} (Dependence)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal font-sans pt-1">Reflects a reduction in your need to rely on external large-language models to formulate arguments.</p>
            </div>

            {/* Originality card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold block">Originality Attitudes</span>
              <div className="flex justify-between items-baseline pt-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">PRE / POST</span>
                  <span className="font-serif font-bold text-2xl text-slate-800 tracking-tight">
                    {preS.originalityAttitudes} <span className="text-xs font-normal font-sans">→</span> {postS.originalityAttitudes}
                  </span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${diffOrig >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {diffOrig >= 0 ? `+${diffOrig}` : diffOrig} (Awareness)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal font-sans pt-1">Demonstrates strengthened awareness of plagiaristic hazards and the value of your own unique scholastic voice.</p>
            </div>

          </div>

          {/* Research causal disclaimer */}
          <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg flex items-start gap-2.5 text-xs text-slate-600 leading-normal font-sans">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-slate-400" />
            <div>
              <strong>Scholarly Change Analysis Note:</strong>
              <p className="mt-0.5 text-slate-500">
                WriteWise notes that while developmental progress and pre/post trends are recorded, we do not automatically claim direct, isolated causation from pre/post differences. Student growth is influenced by comprehensive classroom instruction and teacher guidance alongside WriteWise assistance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
