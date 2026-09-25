/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useWriteWise } from '../WriteWiseContext';
import { BookOpen, GraduationCap, ArrowRight, HelpCircle, AlertCircle, BookOpenCheck } from 'lucide-react';

export const WritingSkills: React.FC = () => {
  const { state, showToast } = useWriteWise();
  const paper = state.papers.find(p => p.studentId === (state.currentUser?.id || 'student-1')) || state.papers[0];
  const track = paper.track;
  const [activeModule, setActiveModule] = useState(0);

  const foundationalModules = [
    { title: '1. Understanding the Assignment', desc: 'Break down prompt expectations, variables, and scholastic parameters.', prompt: 'What is the primary topic of your paper? Underline key verbs.', starter: 'This assignment requires me to investigate...' },
    { title: '2. Choosing/Refining a Topic', desc: 'Narrow down a broad subject into a researchable scope.', prompt: 'State a broad topic and reduce it to a specific Grade 11 community issue.', starter: 'The specific issue I wish to explore is...' },
    { title: '3. Developing Ideas', desc: 'Brainstorm claims, causes, and local implications.', prompt: 'List 3 ideas on how this issue affects daily life.', starter: 'One important way this affects our community is...' },
    { title: '4. Research Problem', desc: 'State the broad context, local gap, and immediate urgency.', prompt: 'What is the specific local gap in knowledge?', starter: 'While prior research shows... there is a clear gap regarding...' },
    { title: '5. Research Questions', desc: 'Formulate feasible, clear, and researchable questions.', prompt: 'Draft a main question and two sub-questions.', starter: 'This study intends to address: 1. To what extent...' },
    { title: '6. Thesis Development', desc: 'Structure an arguable stance with concessions and reasons.', prompt: 'Create a thesis statement summarizing your reasons.', starter: 'Although [concession], this paper argues that... because [Reason A] and [Reason B].' },
    { title: '7. Outline Construction', desc: 'Map your sections into a logical roadmap.', prompt: 'Outline the chronological flow of your discussion.', starter: 'First, I will discuss... then examine... and finally conclude...' },
    { title: '8. Introduction', desc: 'Hook readers, provide background, and present the thesis.', prompt: 'Draft an attention-grabbing hook about public education.', starter: 'In the modern Philippine educational landscape...' },
    { title: '9. Body Paragraphs', desc: 'Structure paragraphs using Point, Evidence, Explanation, Link (PEEL).', prompt: 'Write a PEEL topic sentence.', starter: 'First, unmonitored screen usage directly degrades...' },
    { title: '10. Evidence Integration', desc: 'Frame and cite statistics or citations smoothly.', prompt: 'Connect a quote from Cruz (2024) to a main argument.', starter: 'As demonstrated in Cruz’s study (2024), over 65% of...' },
    { title: '11. Paraphrasing', desc: 'Express source findings in your own words.', prompt: 'Rewrite: "82% of students check notifications while studying" in a new way.', starter: 'A substantial majority of learners check active alerts during study...' },
    { title: '12. Citation Basics', desc: 'Learn parenthetical citations and reference entries.', prompt: 'Write an APA citation for an article by Maria Santos published in 2025.', starter: 'Research indicates cognitive exhaustion is common (Santos, 2025).' },
    { title: '13. Conclusion writing', desc: 'Restate thesis, synthesize main points, and state implications.', prompt: 'Draft a call to action regarding digital regulation.', starter: 'Ultimately, stakeholders must collaborate to regulate...' },
    { title: '14. Revision strategies', desc: 'Learn to refine drafts based on objective rubrics.', prompt: 'Identify a personal pronoun in your draft and replace it.', starter: 'Instead of "I believe", write "The evidence suggests..."' },
    { title: '15. Reflection Work', desc: 'Evaluate your learning pathway and independent gains.', prompt: 'What is the most significant writing skill you built today?', starter: 'Through drafting this section, I learned to synthesize...' }
  ];

  const advancedModules = [
    { title: '1. Research Problem Refinement', desc: 'Identify empirical contradictions or localized gaps in existing scholarship.', prompt: 'Contrast two research perspectives and pinpoint the precise gap.', starter: 'A critical empirical inconsistency exists between...' },
    { title: '2. Nuanced Thesis Development', desc: 'Draft conditional, arguable, and complex thesis structures.', prompt: 'Create an arguable thesis statement with a qualifying clause.', starter: 'While [concession] may hold under conditions of [X], the empirical reality is...' },
    { title: '3. Argument Construction', desc: 'Build compelling claims supported by analytical logic.', prompt: 'Formulate a claim showing causal links between variables.', starter: 'This phenomenon is best explained by the interaction between...' },
    { title: '4. Evidence Synthesis', desc: 'Compare and contrast multiple sources back-to-back.', prompt: 'Draft a synthesis comparing findings of Santos (2025) and Cruz (2024).', starter: 'While Cruz (2024) emphasizes learning benefits, Santos (2025) highlights...' },
    { title: '5. Refuting Counterarguments', desc: 'Acknowledge, analyze, and respectfully rebut opposing views.', prompt: 'State an opposing argument and explain its limitations.', starter: 'Proponents of [opposing view] argue... however, this perspective overlooks...' },
    { title: '6. Academic Tone & Voice', desc: 'Eliminate subjective bias and conversational pronouns.', prompt: 'Rewrite: "I think social media is bad" into high academic prose.', starter: 'Considerable research highlights the detrimental academic impacts of...' },
    { title: '7. Coherence and Cohesion', desc: 'Utilize transitional matrices and logical sequencing.', prompt: 'Write a transition linking study habits to cognitive fatigue.', starter: 'As a direct consequence of this notification switching, students experience...' },
    { title: '8. Critical Source Evaluation', desc: 'Verify credibility, methodology, and citations of literature.', prompt: 'Assess a source’s credentials and identify potential limitations.', starter: 'The methodological framework of [Author, Year] remains highly reliable because...' },
    { title: '9. Literature Synthesis', desc: 'Map thematic matrices across multiple research papers.', prompt: 'Group three studies under a single cohesive theme.', starter: 'A consensus exists among local scholars (Cruz, 2024; Santos, 2025) regarding...' },
    { title: '10. Advanced Revision Loops', desc: 'Execute deep level structural and analytical revisions.', prompt: 'Identify a logical leap in an argument and draft a bridge sentence.', starter: 'To fully establish this connection, it is necessary to examine...' },
    { title: '11. Self-Evaluation Protocols', desc: 'Formulate rubric audits on your own drafts.', prompt: 'Conduct a peer-critique or self-check on thesis specificity.', starter: 'Comparing this claim to the rubric indicates proficiency because...' },
    { title: '12. Metacognitive Reflection', desc: 'Track your transition towards writing independence.', prompt: 'Assess your level of reliance on AI tools during writing.', starter: 'I have successfully reduced reliance on generative models by...' }
  ];

  const activeList = track === 'foundational' ? foundationalModules : advancedModules;
  const active = activeList[activeModule] || activeList[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      
      {/* Left Column (4 cols): Module List */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[#17365D]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Writing Skills Pathway</h2>
          </div>
          <p className="text-xs text-slate-500">
            {track === 'foundational' 
              ? '15 modules delivering full academic structure, templates, and vocab helpers.' 
              : '12 advanced modules focused on critical synthesis, refutation, and style.'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {activeList.map((mod, idx) => (
            <button
              key={idx}
              onClick={() => setActiveModule(idx)}
              className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${idx === activeModule ? 'bg-slate-50/80 text-[#17365D] font-bold' : 'hover:bg-slate-50/30 text-slate-600'}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${idx === activeModule ? 'bg-[#17365D] text-white' : 'bg-slate-100 text-slate-500'}`}>
                {idx + 1}
              </span>
              <div>
                <span className="text-xs font-semibold block">{mod.title.replace(/^\d+\.\s*/, '')}</span>
                <span className="text-[10px] text-slate-400 line-clamp-1 block font-normal">{mod.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column (8 cols): Active Module Sandbox */}
      <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-4 space-y-1">
          <span className="text-[10px] font-bold uppercase text-[#1F8A8A] tracking-widest">{track} module {activeModule + 1} of {activeList.length}</span>
          <h2 className="text-xl font-serif font-bold text-[#17365D]">{active.title}</h2>
          <p className="text-xs text-slate-500">{active.desc}</p>
        </div>

        {/* Scaffold Sandbox prompt */}
        <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-lg space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#17365D] uppercase tracking-wider">
            <HelpCircle className="h-4 w-4 text-[#1F8A8A]" /> Scaffold Practice Exercise
          </div>
          <p className="text-xs text-slate-700 leading-normal">{active.prompt}</p>
        </div>

        {/* Interactive worked sentence starter */}
        <div className="p-4 bg-sky-50/40 border border-sky-100 rounded-lg space-y-2">
          <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">Student Sentence Starter Template</span>
          <div className="bg-white p-3 border border-sky-100 rounded font-serif text-xs text-slate-800 italic select-all cursor-copy" title="Click to copy">
            "{active.starter}"
          </div>
          <p className="text-[10px] text-slate-400">Tip: Click and copy this template into your writing workspace canvas to structure your draft correctly.</p>
        </div>

        {/* Self check form */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Draft Sandbox Test:</h4>
          <textarea
            placeholder="Type your practice sentence here using the starter above..."
            className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A] min-h-[80px] font-sans"
          />
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>This practice area does not affect your formal paper draft. Use it freely!</span>
            <button
              onClick={() => showToast('Practice response saved! You can copy it into your Workspace when drafting.', 'success')}
              className="px-3 py-1.5 bg-[#17365D] hover:bg-[#112643] text-white text-[10px] font-bold rounded shadow-sm flex items-center gap-1 transition-all"
            >
              Save Practice <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* DepEd alignment callout */}
        <div className="flex items-start gap-2.5 p-3.5 bg-green-50 border border-green-100 rounded-lg text-[11px] text-green-800 leading-normal font-sans">
          <BookOpenCheck className="h-4 w-4 shrink-0 mt-0.5 text-green-700" />
          <div>
            <strong>Grade 11 DepEd Competency Alignment:</strong>
            <p className="text-slate-600 mt-0.5">This module provides direct instructional scaffolding for DepEd Practical Research competencies. Mastering this skill fulfills key rubric expectations for your formal paper.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
