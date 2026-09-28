/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useWriteWise } from '../WriteWiseContext';
import { Award, BookOpen, CheckCircle, HelpCircle, AlertCircle, RefreshCw, Trophy, Sparkles, Star, ArrowRight, ShieldCheck, Zap, Lock } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: { key: string; text: string }[];
  correctKey: string;
  explanation: string;
}

type QuizLevel = 'beginner' | 'intermediate' | 'mastery';

interface QuizConfig {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  questions: Question[];
}

export const AssessmentQuiz: React.FC = () => {
  const { state, submitAssessmentScore, showToast } = useWriteWise();
  const user = state.currentUser;

  const [activeLevel, setActiveLevel] = useState<QuizLevel>('beginner');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, Record<string, string>>>({
    beginner: {},
    intermediate: {},
    mastery: {}
  });
  const [isSubmitted, setIsSubmitted] = useState<Record<QuizLevel, boolean>>({
    beginner: false,
    intermediate: false,
    mastery: false
  });
  const [results, setResults] = useState<Record<QuizLevel, { score: number; xpEarned: number } | null>>({
    beginner: null,
    intermediate: null,
    mastery: null
  });

  const quizzes: Record<QuizLevel, QuizConfig> = {
    beginner: {
      id: 'practical-research-beginner',
      title: 'Beginner Level: Foundations of Inquiry',
      description: 'Master simple variables, distinguish primary sources, and understand basic research honesty.',
      rewardXp: 30,
      questions: [
        {
          id: 'b1',
          text: 'Which of the following describes a non-researchable problem statement because it lacks measurable academic variables?',
          options: [
            { key: 'A', text: 'To what extent does daily screen time affect student focus during math exercises?' },
            { key: 'B', text: 'Should senior high school students always be happy and kind to their peers?' },
            { key: 'C', text: 'The relationship between online vocabulary games and English reading scores of Grade 11 students.' },
            { key: 'D', text: 'How do students manage unmonitored distractions during homework hours?' }
          ],
          correctKey: 'B',
          explanation: 'Option B is a moral/ethical question about how people "should" feel or act, rather than an objective, measurable empirical problem. Standard research requires clear, non-subjective variables that can be systematically measured.'
        },
        {
          id: 'b2',
          text: 'What constitutes a primary source of data in a Senior High School practical research study?',
          options: [
            { key: 'A', text: 'A direct survey or interview session conducted by the student researchers themselves.' },
            { key: 'B', text: 'A summary paragraph written about an old study in a secondary school textbook.' },
            { key: 'C', text: 'An article explaining the general history of internet technology on Wikipedia.' },
            { key: 'D', text: 'A generic list of reference titles suggested by an AI chatbot.' }
          ],
          correctKey: 'A',
          explanation: 'Primary data is collected first-hand, directly from source participants (like surveys, experiments, or focus groups) specifically for the current research study.'
        },
        {
          id: 'b3',
          text: 'If you use a sentence written by another author in your research paper, what must you do to ensure academic honesty?',
          options: [
            { key: 'A', text: 'Nothing is required if you are submitting to a high school section rather than a formal journal.' },
            { key: 'B', text: 'Place the text in quotation marks and include a parenthetical citation pointing to the original author.' },
            { key: 'C', text: 'Simply change a few words using a thesaurus and submit without citation.' },
            { key: 'D', text: 'Acknowledge in your thesis that some ideas are borrowed from unnamed web pages.' }
          ],
          correctKey: 'B',
          explanation: 'Using someone else\'s exact words requires both quotation marks and a formal citation to attribute credit and preserve academic integrity.'
        },
        {
          id: 'b4',
          text: 'What is the main objective of Chapter 1 (Statement of the Problem)?',
          options: [
            { key: 'A', text: 'To summarize all articles ever written about sleep and school.' },
            { key: 'B', text: 'To explicitly declare the exact questions the research study aims to investigate and answer.' },
            { key: 'C', text: 'To define technical vocabulary terms used in the appendix list.' },
            { key: 'D', text: 'To write letters requesting permission from local public officials.' }
          ],
          correctKey: 'B',
          explanation: 'The Statement of the Problem guides the entire research by defining the scope, goals, and precise research questions that the investigation will answer.'
        },
        {
          id: 'b5',
          text: 'During Practical Research 1 or 2, who has the final authority to review, critique, and validate your learning track and draft sections?',
          options: [
            { key: 'A', text: 'An anonymous AI text generator.' },
            { key: 'B', text: 'Your assigned Classroom Research Advisor / Master Teacher.' },
            { key: 'C', text: 'The school registrar administrator.' },
            { key: 'D', text: 'A student section representative.' }
          ],
          correctKey: 'B',
          explanation: 'Your human Research Advisor provides curriculum oversight, structural ratings, and final validation of your Practical Research competencies.'
        }
      ]
    },
    intermediate: {
      id: 'practical-research-intermediate',
      title: 'Intermediate Level: Drafting & APA Standards',
      description: 'Develop well-scoped research questions, apply APA inline formats, and learn true paraphrasing.',
      rewardXp: 30,
      questions: [
        {
          id: 'i1',
          text: 'Which of the following describes the most feasible, well-scoped research question for a Senior High School Practical Research study?',
          options: [
            { key: 'A', text: 'How has global internet technology affected student mental health across all Asian countries in the last 20 years?' },
            { key: 'B', text: 'To what extent does unmonitored sleep interruption relate to the concentration levels of Grade 11 STEM students in Batangas High School during S.Y. 2026-2027?' },
            { key: 'C', text: 'Is social media good or bad for secondary learners?' },
            { key: 'D', text: 'Why do high school students like playing computer games instead of reading literature books?' }
          ],
          correctKey: 'B',
          explanation: 'Option B is highly feasible and well-scoped. It specifies a clear local population (Grade 11 STEM in Batangas), measurable variables (sleep interruption and concentration levels), and a defined academic timeframe (S.Y. 2026-2027).'
        },
        {
          id: 'i2',
          text: 'According to APA 7th Edition style guidelines, what is the correct format for an inline, parenthetical citation with two authors?',
          options: [
            { key: 'A', text: '(Santos and Cruz, 2025)' },
            { key: 'B', text: '(Santos & Cruz 2025)' },
            { key: 'C', text: '(Santos & Cruz, 2025)' },
            { key: 'D', text: '[Santos & Cruz, 2025]' }
          ],
          correctKey: 'C',
          explanation: 'APA 7th Edition requires using an ampersand (&) inside parenthetical citations followed by a comma and the publication year: (Santos & Cruz, 2025).'
        },
        {
          id: 'i3',
          text: 'A student paraphrases a paragraph from an online journal article by changing a few words, but keeps the exact sentence order and does not include an inline citation. Why is this unacceptable?',
          options: [
            { key: 'A', text: 'It is acceptable as long as the online journal is listed in the final reference list.' },
            { key: 'B', text: 'It constitutes plagiarism because paraphrased ideas must still be properly cited, and patching synonyms while retaining the structural outline is plagiarism of structure.' },
            { key: 'C', text: 'It is acceptable as long as the student used a generative AI paraphrasing tool to randomize the word choice.' },
            { key: 'D', text: 'It is only unacceptable if the teacher uses an automated plagiarism scanner.' }
          ],
          correctKey: 'B',
          explanation: 'Even when paraphrasing or changing words, the ideas must still be cited. Keeping the exact sentence flow with synonym patching is structural plagiarism and violates academic integrity standards.'
        },
        {
          id: 'i4',
          text: 'Why is summarizing your sources back-to-back ("Study A says X. Study B says Y. Study C says Z") considered a weak Literature Review (RRL)?',
          options: [
            { key: 'A', text: 'Because a literature review should never discuss more than two sources.' },
            { key: 'B', text: 'Because summarizing does not build a thematic, synthesized narrative showing how studies overlap, differ, or support each other.' },
            { key: 'C', text: 'Because teachers only accept papers with direct word-for-word quotes.' },
            { key: 'D', text: 'Because summaries are too long and exceed typical word count margins.' }
          ],
          correctKey: 'B',
          explanation: 'An effective RRL integrates multiple papers under cohesive themes rather than producing isolated study summaries. This synthesizes the current landscape clearly.'
        },
        {
          id: 'i5',
          text: 'If your study aims to investigate the shared lived experiences of student leaders managing heavy academic workloads, which research methodology is most appropriate?',
          options: [
            { key: 'A', text: 'Quantitative Experimental Design' },
            { key: 'B', text: 'Qualitative Phenomenological Design' },
            { key: 'C', text: 'Quantitative Correlational Design' },
            { key: 'D', text: 'Historical Document Review' }
          ],
          correctKey: 'B',
          explanation: 'Phenomenological designs explore the "lived experiences" and common perceptions of individuals experiencing a specific phenomenon, making it the perfect qualitative design.'
        }
      ]
    },
    mastery: {
      id: 'practical-research-mastery',
      title: 'Mastery Level: Critical Synthesis & Integrity',
      description: 'Formulate Literature Synthesis Matrices, handle hallucinations, and adapt formal scholarly tone.',
      rewardXp: 30,
      questions: [
        {
          id: 'm1',
          text: 'What is the primary purpose of constructing a Literature Synthesis Matrix before drafting Chapter 2?',
          options: [
            { key: 'A', text: 'To count how many words are in each source description.' },
            { key: 'B', text: 'To separate sources into chronological order so that old papers are ignored.' },
            { key: 'C', text: 'To group academic papers under thematic categories, allowing researchers to see overlaps, consensus, or contradictions between different authors.' },
            { key: 'D', text: 'To substitute for writing the final body text of the literature chapter.' }
          ],
          correctKey: 'C',
          explanation: 'A synthesis matrix groups sources by theme. This prevents a source-by-source summary list and helps students write a critical synthesis showing how literature overlaps or contradicts.'
        },
        {
          id: 'm2',
          text: 'When using generative AI assistance for academic drafting, what is a "hallucination" and how should a researcher handle it?',
          options: [
            { key: 'A', text: 'An AI-suggested title that sounds too creative; it should be rewritten using traditional dictionary synonyms.' },
            { key: 'B', text: 'An AI-generated fact or citation that appears plausible but is entirely fabricated; researchers must verify every source against database libraries.' },
            { key: 'C', text: 'A technical delay in the response generation; the user should restart their browser.' },
            { key: 'D', text: 'When the AI matches your writing style perfectly; no action is required.' }
          ],
          correctKey: 'B',
          explanation: 'Large language models often invent references that look completely genuine but do not exist. Researchers must double-check every reference in databases (Google Scholar, local libraries) to verify content validity.'
        },
        {
          id: 'm3',
          text: 'In writing advanced academic research, what is the purpose of actively identifying and discussing "rebuttals" or "opposing viewpoints" in your thesis?',
          options: [
            { key: 'A', text: 'It weakens your paper\'s argument, so opposing arguments should always be hidden.' },
            { key: 'B', text: 'It shows intellectual balance and builds credibility by presenting opposing views and objectively refuting them with strong empirical evidence.' },
            { key: 'C', text: 'To lengthen the paper and reach a higher word count benchmark.' },
            { key: 'D', text: 'To prove that previous scholars were academically incompetent.' }
          ],
          correctKey: 'B',
          explanation: 'Acknowledging and refuting counterarguments is a hallmark of scholastic rigor. It builds confidence by proving that you have fully explored the landscape and that your stance remains valid under scrutiny.'
        },
        {
          id: 'm4',
          text: 'Which sentence demonstrates the most professional, objective academic tone suitable for Chapter 5 (Conclusion & Discussion)?',
          options: [
            { key: 'A', text: 'I think that unmonitored cellphones are super bad for student brains because everyone looks exhausted.' },
            { key: 'B', text: 'The results clearly show that students are lazy and don\'t study when alerts go off.' },
            { key: 'C', text: 'The empirical evidence indicates a substantial correlation between continuous notification interruption and diminished cognitive endurance.' },
            { key: 'D', text: 'Cellphones are definitely a complete nightmare for K-12 learning processes nowadays.' }
          ],
          correctKey: 'C',
          explanation: 'Option C utilizes objective, formal, third-person academic prose with precise vocabulary, avoiding personal pronouns ("I think") and conversational exaggeration ("super bad", "lazy", "nightmare").'
        },
        {
          id: 'm5',
          text: 'A critical "scholarly gap" or "empirical inconsistency" is defined as:',
          options: [
            { key: 'A', text: 'A typing mistake or citation formatting error made by a prior researcher.' },
            { key: 'B', text: 'An area or sub-theme where prior scholarship contains contradictions, lacks localized data, or leaves unanswered questions.' },
            { key: 'C', text: 'The literal page spacing between consecutive body paragraphs.' },
            { key: 'D', text: 'The distance between public schools in remote regional divisions.' }
          ],
          correctKey: 'B',
          explanation: 'A scholarly gap is the academic justification for your study—identifying what prior researchers have not yet answered, especially within specific localized demographics or variables.'
        }
      ]
    }
  };

  const activeQuiz = quizzes[activeLevel];
  const previousScore = user?.assessmentScores?.[activeQuiz.id];

  const isLevelUnlocked = (lvl: QuizLevel): boolean => {
    if (lvl === 'beginner') return true;
    if (lvl === 'intermediate') {
      const beg = user?.assessmentScores?.['practical-research-beginner'];
      return !!beg && beg.score >= 3;
    }
    if (lvl === 'mastery') {
      const inter = user?.assessmentScores?.['practical-research-intermediate'];
      return !!inter && inter.score >= 3;
    }
    return false;
  };

  const isLocked = !isLevelUnlocked(activeLevel);

  const handleSelectOption = (qId: string, optionKey: string) => {
    if (isSubmitted[activeLevel]) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [activeLevel]: {
        ...prev[activeLevel],
        [qId]: optionKey
      }
    }));
  };

  const handleResetQuiz = () => {
    setSelectedAnswers(prev => ({
      ...prev,
      [activeLevel]: {}
    }));
    setIsSubmitted(prev => ({ ...prev, [activeLevel]: false }));
    setResults(prev => ({ ...prev, [activeLevel]: null }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitted[activeLevel]) return;

    const levelAnswers = selectedAnswers[activeLevel];
    const answeredCount = Object.keys(levelAnswers).length;
    if (answeredCount < activeQuiz.questions.length) {
      alert(`Please answer all ${activeQuiz.questions.length} questions before submitting so we can calculate your points out of 30 XP!`);
      return;
    }

    // Calculate score
    let score = 0;
    activeQuiz.questions.forEach(q => {
      if (levelAnswers[q.id] === q.correctKey) {
        score += 1;
      }
    });

    // Call state update
    const result = submitAssessmentScore(activeQuiz.id, score, activeQuiz.questions.length);

    setResults(prev => ({
      ...prev,
      [activeLevel]: {
        score,
        xpEarned: result.xpEarned
      }
    }));
    setIsSubmitted(prev => ({ ...prev, [activeLevel]: true }));
    showToast(`Level ${activeLevel.toUpperCase()} submitted! Earned ${result.xpEarned} XP.`, 'success');
  };

  const activeLevelAnswers = selectedAnswers[activeLevel];
  const allAnswered = Object.keys(activeLevelAnswers).length === activeQuiz.questions.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Banner Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#17365D]/10 text-[#17365D] uppercase tracking-wide">
            <Award className="h-3.5 w-3.5" /> Gamified Research Pathway
          </div>
          <h2 className="text-xl font-bold font-serif text-slate-900">Research Competency Path</h2>
          <p className="text-xs text-slate-500">
            Build independent writing competencies. Take assessments graded specifically across progressive learning levels.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 p-3 rounded-xl shrink-0">
          <Star className="h-5 w-5 text-amber-500 fill-amber-500 animate-pulse" />
          <div className="text-xs">
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total XP Earned</span>
            <span className="font-serif font-bold text-slate-800 text-sm">{(user?.xp || 0)} XP</span>
          </div>
        </div>
      </div>

      {/* Levels Navigation Tabs */}
      <div className="grid grid-cols-3 gap-2.5 p-1 bg-slate-100 rounded-xl">
        {(['beginner', 'intermediate', 'mastery'] as QuizLevel[]).map(lvl => {
          const isActive = activeLevel === lvl;
          const scoreEntry = user?.assessmentScores?.[quizzes[lvl].id];
          const unlocked = isLevelUnlocked(lvl);
          return (
            <button
              key={lvl}
              onClick={() => {
                setActiveLevel(lvl);
              }}
              className={`py-3 px-2 text-center rounded-lg font-sans text-xs font-bold uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                isActive 
                  ? 'bg-white text-[#17365D] shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
              }`}
            >
              <span className="capitalize flex items-center gap-1">
                {!unlocked && <Lock className="h-3 w-3 text-slate-400" />}
                {lvl}
              </span>
              {scoreEntry ? (
                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                  {scoreEntry.score}/5 ({scoreEntry.xpEarned} XP)
                </span>
              ) : (
                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-md border border-amber-100">
                  30 XP Max
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Level Info Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/60 space-y-2">
        <h3 className="text-sm font-bold text-slate-800 capitalize flex items-center gap-2">
          {activeLevel === 'beginner' && <BookOpen className="h-4 w-4 text-indigo-500" />}
          {activeLevel === 'intermediate' && <Zap className="h-4 w-4 text-[#1F8A8A]" />}
          {activeLevel === 'mastery' && <ShieldCheck className="h-4 w-4 text-amber-500" />}
          {activeQuiz.title}
        </h3>
        <p className="text-xs text-slate-500">{activeQuiz.description}</p>
      </div>

      {previousScore && !isSubmitted[activeLevel] && (
        <div className="p-4 bg-emerald-50 border border-emerald-200/60 rounded-xl flex items-center justify-between gap-4 text-xs">
          <div className="flex gap-2.5 items-center">
            <Trophy className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-emerald-800 uppercase tracking-wider block">Completed Previously</span>
              <p className="text-slate-600">
                You took this level and scored <strong>{previousScore.score} / {previousScore.total}</strong> (Earned <strong>{previousScore.xpEarned} XP</strong>). You can take it again to improve your score and obtain extra XP!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      {isLocked ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm text-center space-y-5 py-12">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Lock className="h-6 w-6 text-slate-400" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Level Lock Restricted</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {activeLevel === 'intermediate' ? (
                <span>To unlock the <strong>Intermediate level</strong>, you must first answer all questions and pass the <strong>Beginner level</strong> with a score of at least <strong>3 out of 5 (60%)</strong>.</span>
              ) : (
                <span>To unlock the <strong>Mastery level</strong>, you must first answer all questions and pass the <strong>Intermediate level</strong> with a score of at least <strong>3 out of 5 (60%)</strong>.</span>
              )}
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setActiveLevel(activeLevel === 'intermediate' ? 'beginner' : 'intermediate')}
              className="px-4 py-2 bg-[#17365D] hover:bg-[#112643] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              Practice Previous Level &rarr;
            </button>
          </div>
        </div>
      ) : !isSubmitted[activeLevel] ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {activeQuiz.questions.map((q, index) => {
              const selectedKey = activeLevelAnswers[q.id];
              return (
                <div key={q.id} className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[#17365D]/10 text-[#17365D] flex items-center justify-center text-xs font-bold shrink-0">
                      {index + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-800 leading-snug pt-0.5">
                      {q.text}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 pl-9">
                    {q.options.map(opt => {
                      const isSelected = selectedKey === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => handleSelectOption(q.id, opt.key)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex gap-3 cursor-pointer ${
                            isSelected 
                              ? 'bg-sky-50 border-sky-400 text-sky-900 font-medium shadow-xs' 
                              : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 border transition-all ${
                            isSelected ? 'bg-[#17365D] border-[#17365D] text-white' : 'border-slate-300 bg-slate-50 text-slate-500'
                          }`}>
                            {opt.key}
                          </span>
                          <span className="leading-normal">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-slate-400 shrink-0" />
              <span>
                {allAnswered 
                  ? 'All level questions completed! Ready to submit.' 
                  : `Please answer all questions (${Object.keys(activeLevelAnswers).length}/${activeQuiz.questions.length} answered)`}
              </span>
            </div>

            <button
              type="submit"
              disabled={!allAnswered}
              className="px-6 py-2.5 bg-[#17365D] hover:bg-[#112643] text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-40 flex items-center gap-2 cursor-pointer"
            >
              Submit {activeLevel.toUpperCase()} Quiz <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      ) : (
        /* Results View */
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#17365D] to-[#1F8A8A] rounded-2xl p-6 text-white text-center space-y-4 shadow-md">
            <Trophy className="h-12 w-12 text-[#F4B942] mx-auto animate-bounce" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-serif">Assessment Finished!</h3>
              <p className="text-xs text-teal-100 max-w-md mx-auto">
                Thank you for completing the Practical Research {activeLevel.toUpperCase()} Competency Assessment. Your score and points have been processed.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto bg-white/10 p-4 rounded-xl backdrop-blur-xs">
              <div>
                <span className="block text-[10px] text-teal-200 uppercase font-bold tracking-wider">Correct Answers</span>
                <span className="font-serif font-bold text-xl text-white">{results[activeLevel]?.score} / {activeQuiz.questions.length}</span>
              </div>
              <div>
                <span className="block text-[10px] text-teal-200 uppercase font-bold tracking-wider">Prorated Points</span>
                <span className="font-serif font-bold text-xl text-[#F4B942]">{results[activeLevel]?.xpEarned} XP</span>
              </div>
              <div>
                <span className="block text-[10px] text-teal-200 uppercase font-bold tracking-wider">Max Points Possible</span>
                <span className="font-serif font-bold text-xl text-teal-200">30 XP</span>
              </div>
            </div>

            <div className="text-[11px] text-teal-100 italic pt-1">
              {results[activeLevel]?.score === activeQuiz.questions.length 
                ? '⭐ Perfect Score! You obtained the full 30 XP!' 
                : `💡 Scaled Score Calculation: (${results[activeLevel]?.score} correct / ${activeQuiz.questions.length} questions) × 30 max points = ${results[activeLevel]?.xpEarned} XP!`}
            </div>

            <div className="pt-2">
              <button
                onClick={handleResetQuiz}
                className="px-4 py-1.5 bg-white text-[#17365D] hover:bg-slate-100 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Retake {activeLevel.toUpperCase()} Quiz
              </button>
            </div>
          </div>

          {/* Correct Answer Explanation list */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Explanations & Study Insights</h4>
            
            {activeQuiz.questions.map((q, index) => {
              const selectedKey = activeLevelAnswers[q.id];
              const isCorrect = selectedKey === q.correctKey;
              return (
                <div key={q.id} className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-2.5">
                      <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {index + 1}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 leading-snug">{q.text}</h4>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                      isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <div className="space-y-1 pl-7 text-xs">
                    <p className="text-slate-600 font-medium">
                      Your answer: <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                        Option {selectedKey}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="text-slate-600">
                        Correct answer: <span className="text-emerald-700 font-bold">Option {q.correctKey}</span>
                      </p>
                    )}
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-500 leading-relaxed flex gap-2">
                      <HelpCircle className="h-4 w-4 text-[#1F8A8A] shrink-0 mt-0.5" />
                      <div>
                        <strong>Scholarly Insight:</strong> {q.explanation}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
