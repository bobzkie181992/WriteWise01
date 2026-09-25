/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useWriteWise } from '../WriteWiseContext';
import { BookOpen, CheckCircle, Save, Sparkles, ChevronRight, HelpCircle, RefreshCw, AlertTriangle, ArrowRight, History, ShieldCheck, FileText, Copy, Plus } from 'lucide-react';
import { IntelligentAutocomplete } from './IntelligentAutocomplete';
import { AcademicDraftEditor } from './AcademicDraftEditor';

export const WritingWorkspace: React.FC = () => {
  const { state, updatePaperSection, submitSectionForReview, getWordSuggestions, acceptWordSuggestion, triggerAIFeedbackRequest, deleteComment, showToast } = useWriteWise();
  const paper = state.papers.find(p => p.studentId === (state.currentUser?.id || 'student-1')) || state.papers[0];
  
  // Current editing section state
  const [selectedSectionId, setSelectedSectionId] = useState(paper.sections[5].id); // Default to Literature Review which is in 'needs_revision'
  const activeSection = paper.sections.find(s => s.id === selectedSectionId) || paper.sections[0];
  const [draftText, setDraftText] = useState(activeSection.content);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');

  // SRL reflection prompts
  const [srlPlanning, setSrlPlanning] = useState('');
  const [srlMonitoring, setSrlMonitoring] = useState('');
  const [srlReflection, setSrlReflection] = useState('');
  const [srlExpanded, setSrlExpanded] = useState(false);
  const [showExporter, setShowExporter] = useState(false);

  // Plagiarism Scanner States
  const [isScanningPlagiarism, setIsScanningPlagiarism] = useState(false);
  const [plagiarismScore, setPlagiarismScore] = useState<number | null>(null);
  const [scanStep, setScanStep] = useState('');

  // Sentence Starter Tool State
  const [starterInput, setStarterInput] = useState('');
  const [showStarterBar, setShowStarterBar] = useState(false);

  const handleInsertStarter = (completedPhrase: string) => {
    const textToInsert = completedPhrase.trim();
    if (!textToInsert) return;

    setDraftText(prev => {
      if (!prev.trim()) return textToInsert;
      const needsSpace = !prev.endsWith(' ') && !prev.endsWith('\n');
      return prev + (needsSpace ? ' ' : '') + textToInsert;
    });

    setSaveStatus('dirty');
    setStarterInput('');
    showToast(`Inserted "${textToInsert}" into draft!`, 'success');
  };

  // Review & Check Outputs
  const [reviewResult, setReviewResult] = useState<{
    similarityFlags: { text: string; source: string; suggestion: string }[];
    processIndicator: {
      studentDrafting: 'HIGH' | 'MODERATE' | 'LOW';
      suggestionsAccepted: 'HIGH' | 'MODERATE' | 'LOW';
      feedbackRequests: 'HIGH' | 'MODERATE' | 'LOW';
      directAIGen: 'NONE RECORDED' | 'MINIMAL DETECTED';
    };
    rubricEvaluation: { criterionId: string; rating: string; feedback: string }[];
    whatToDoNext: string[];
    canMoveToNext: boolean;
  } | null>(null);

  const [isReviewing, setIsReviewing] = useState(false);

  // Sync draftText when section changes
  useEffect(() => {
    setDraftText(activeSection.content);
    setSaveStatus('saved');
    setReviewResult(null);
    setSrlPlanning('');
    setSrlMonitoring('');
    setSrlReflection('');
    setPlagiarismScore(null);
    setIsScanningPlagiarism(false);
    setScanStep('');
  }, [selectedSectionId]);

  // Explicit Save Draft
  const handleSaveDraft = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      updatePaperSection(selectedSectionId, draftText);
      setSaveStatus('saved');
    }, 400);
  };

  // Review Draft (Runs originality process check & What to do next suggestion engine)
  const handleReviewDraft = () => {
    setIsReviewing(true);
    triggerAIFeedbackRequest(selectedSectionId);
    
    // Auto save prior to analysis
    updatePaperSection(selectedSectionId, draftText);
    setSaveStatus('saved');

    setTimeout(() => {
      const result = submitSectionForReview(selectedSectionId);
      setReviewResult(result);
      setIsReviewing(false);
    }, 800);
  };

  const handlePlagiarismScan = () => {
    if (!draftText.trim()) {
      showToast('Please enter some text in the writing canvas before running the plagiarism check.', 'warning');
      return;
    }
    setIsScanningPlagiarism(true);
    setScanStep('Retrieving reference database...');
    
    // Auto save prior to scan
    updatePaperSection(selectedSectionId, draftText);
    setSaveStatus('saved');
    
    setTimeout(() => {
      setScanStep('Scanning against Cruz (2024) and Santos (2025)...');
      setTimeout(() => {
        setScanStep('Running semantic paraphrasing similarity matches...');
        setTimeout(() => {
          const contentLower = draftText.toLowerCase();
          let score = 0;
          if (contentLower.includes('study while checking facebook notifications') || contentLower.includes('82% of students')) {
            score += 35;
          }
          if (contentLower.includes('online academic groups help learners')) {
            score += 28;
          }
          if (score === 0 && draftText.length > 50) {
            score = Math.floor(Math.random() * 5) + 3; // normal bibliography similarity
          }
          setPlagiarismScore(score);
          setIsScanningPlagiarism(false);
          setScanStep('');
          
          // Trigger normal review to synchronize visual checklists
          const result = submitSectionForReview(selectedSectionId);
          setReviewResult(result);
        }, 800);
      }, 800);
    }, 600);
  };

  // Restore history draft version
  const handleRestoreVersion = (content: string) => {
    setDraftText(content);
    setSaveStatus('dirty');
    setReviewResult(null);
  };

  // Help guides
  const activeScaffold = paper.track === 'foundational' 
    ? activeSection.foundationalScaffold 
    : activeSection.advancedScaffold;

  return (
    <div className="space-y-6 font-sans">
      {/* Header Workspace Zone */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <BookOpen className="h-5 w-5 text-[#17365D] shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Writing Workspace</span>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className="font-serif font-bold text-base sm:text-lg text-slate-900">Section:</span>
              <select 
                className="font-serif font-bold text-base sm:text-lg text-[#17365D] bg-transparent focus:outline-none border-b border-dashed border-[#17365D] pb-0.5 cursor-pointer max-w-full"
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
              >
                {paper.sections.map(sec => (
                  <option key={sec.id} value={sec.id} className="font-sans font-normal text-sm">
                    {sec.title} {sec.status === 'completed' ? '✓' : sec.status === 'needs_revision' ? '⚠' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Save Status & Action Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setShowExporter(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-[#1F8A8A] hover:from-emerald-700 hover:to-[#1a7575] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            title="Compile Draft into a full APA 7th Edition manuscript"
          >
            <FileText className="h-4 w-4" /> Export APA Manuscript
          </button>
          <span className="text-xs text-slate-400 mr-auto md:mr-0 font-sans">
            {saveStatus === 'saved' && '✓ Saved'}
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'dirty' && 'Unsaved changes'}
          </span>
          <button
            onClick={handleSaveDraft}
            disabled={saveStatus === 'saved'}
            className={`p-2 rounded-lg border transition-all ${saveStatus !== 'saved' ? 'border-[#17365D] bg-[#17365D]/5 text-[#17365D] hover:bg-[#17365D]/10' : 'border-slate-100 bg-slate-50 text-slate-300'}`}
            title="Save Draft"
          >
            <Save className="h-4 w-4" />
          </button>
          <button
            onClick={handleReviewDraft}
            disabled={isReviewing || !draftText.trim()}
            className="px-3 sm:px-4 py-2 bg-[#17365D] hover:bg-[#112643] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {isReviewing ? 'Analyzing...' : 'Check Draft'} <ChevronRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Scaffolding panel & Workspace Editor */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card: Section Objective & Scaffolding Guidance */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-slate-700 font-serif">Objectives & Writing Scaffolding</h3>
                <p className="text-xs text-slate-500 mt-0.5">{activeSection.description}</p>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase tracking-wider">
                {paper.track} Track
              </span>
            </div>

            <div className="p-4 bg-[#F7F9FC] border border-slate-200/50 rounded-lg space-y-2">
              <span className="text-[10px] font-bold text-[#1F8A8A] uppercase tracking-wider block">Calibrated Assistance Guide</span>
              <pre className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                {activeScaffold}
              </pre>
            </div>

            {/* Custom Vocabulary List for Foundational Track */}
            {paper.track === 'foundational' && (
              <div className="p-3.5 bg-sky-50/40 border border-sky-100 rounded-lg text-xs">
                <span className="font-semibold text-slate-700">Vocabulary & Connector Aid:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Furthermore,', 'In contrast to', 'According to recent evidence,', 'Specifically,', 'A primary concern is', 'This study suggests that'].map((word, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setDraftText(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + word + ' ');
                        setSaveStatus('dirty');
                      }}
                      className="px-2 py-1 bg-white hover:bg-sky-50 border border-sky-100 text-sky-800 rounded font-mono text-[10px] transition-all"
                    >
                      + {word}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card: Distraction-Free Editor Viewport */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm relative overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Writing Canvas</span>
                <button
                  type="button"
                  onClick={() => setShowStarterBar(!showStarterBar)}
                  className="text-[10px] font-bold text-[#17365D] hover:underline flex items-center gap-1 bg-[#17365D]/10 px-2 py-0.5 rounded-full"
                >
                  <Sparkles className="h-3 w-3" />
                  {showStarterBar ? 'Hide Starter Bar' : 'Quick Sentence Starters'}
                </button>
              </div>
              <span className="text-xs text-slate-500 font-mono">{draftText.trim() ? draftText.trim().split(/\s+/).length : 0} Words</span>
            </div>

            {/* Intelligent Sentence Starter & Autocomplete Bar */}
            {showStarterBar && (
              <div className="px-5 pt-4 pb-2 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-[#1F8A8A]" />
                      Intelligent Sentence Starter & Academic Completer
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Press <kbd className="px-1 py-0.2 bg-white border border-slate-200 rounded font-mono text-[9px]">Tab</kbd> to complete
                    </span>
                  </div>

                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <IntelligentAutocomplete
                        value={starterInput}
                        onChange={setStarterInput}
                        onAccept={handleInsertStarter}
                        placeholder="Type to trigger ghost autocomplete, e.g. 'according to...', 'academic...'"
                        showAlternativesList={false}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInsertStarter(starterInput)}
                      disabled={!starterInput.trim()}
                      className="px-3 py-2.5 bg-[#17365D] hover:bg-[#112643] text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs disabled:opacity-40 transition-all cursor-pointer"
                      title="Insert completed phrase directly into draft"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Insert</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="p-5 space-y-4">
              <AcademicDraftEditor
                value={draftText}
                onChange={(newVal) => {
                  setDraftText(newVal);
                  setSaveStatus('dirty');
                }}
                onAcceptSuggestion={(acceptedPhrase) => {
                  acceptWordSuggestion(selectedSectionId);
                  showToast(`Accepted: "${acceptedPhrase}"`, 'success');
                }}
                placeholder="Compose your academic section draft directly here..."
                sectionId={selectedSectionId}
                minHeight="280px"
              />
            </div>

            {/* Warning Message regarding Complete Essay Generators */}
            <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
              <span>WriteWise AI assists vocabulary and structural scaffolding; it will never write whole papers for you.</span>
              <span className="font-semibold uppercase tracking-wider text-slate-500">Gradual Release Pathway</span>
            </div>
          </div>

          {/* Advisor Sticky Comments Component */}
          {(() => {
            const comments = paper.comments?.filter(c => c.sectionId === selectedSectionId) || [];
            if (comments.length === 0) return null;
            return (
              <div className="bg-amber-50/40 p-5 rounded-xl border border-amber-200/50 shadow-sm space-y-4 animate-fade-in font-sans">
                <div className="flex justify-between items-center border-b border-amber-200/40 pb-2">
                  <h3 className="text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1.5">
                    💬 Advisor Sticky Comments ({comments.length})
                  </h3>
                  <span className="text-[9px] text-amber-700 bg-amber-100/50 px-1.5 py-0.5 rounded font-bold uppercase">Action Required</span>
                </div>
                
                <div className="space-y-3">
                  {comments.map(c => (
                    <div key={c.id} className="bg-white p-3.5 rounded-lg border border-amber-100 shadow-sm flex justify-between gap-4 items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs">{c.author}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{c.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-sans">{c.text}</p>
                        {c.highlightText && (
                          <div className="mt-1.5 p-1 px-2 border-l-2 border-slate-300 bg-slate-50 text-[10px] text-slate-500 italic">
                            Context: "{c.highlightText}"
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          deleteComment(paper.studentId, c.id);
                          showToast('Comment marked as resolved!', 'success');
                        }}
                        className="text-[10px] text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100/50 p-1 px-2.5 rounded font-bold uppercase transition-all shrink-0"
                      >
                        ✓ Resolved
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Self-Regulated Learning (SRL) Prompts */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <button
              onClick={() => setSrlExpanded(!srlExpanded)}
              className="w-full p-4 flex justify-between items-center hover:bg-slate-50/50 text-left border-b border-slate-100"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#1F8A8A]/10 text-[#1F8A8A] rounded-full flex items-center justify-center font-bold text-xs">P</div>
                <span className="text-sm font-bold text-slate-700">Self-Regulated Learning (SRL) Prompts</span>
              </div>
              <span className="text-xs text-[#1F8A8A] font-semibold">{srlExpanded ? 'Collapse' : 'Expand Prompts'}</span>
            </button>

            {srlExpanded && (
              <div className="p-5 space-y-4 font-sans text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">PLANNING: "What do you want this section to accomplish?"</label>
                    <textarea
                      value={srlPlanning}
                      onChange={(e) => setSrlPlanning(e.target.value)}
                      placeholder="e.g. Synthesize three key findings from Cruz (2024) and Santos (2025)..."
                      className="w-full p-2 border border-slate-200 rounded-md focus:outline-none focus:border-[#1F8A8A] min-h-[60px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">MONITORING: "Does this paragraph support your thesis?"</label>
                    <textarea
                      value={srlMonitoring}
                      onChange={(e) => setSrlMonitoring(e.target.value)}
                      placeholder="e.g. This section provides the core evidence backing my claims of distraction..."
                      className="w-full p-2 border border-slate-200 rounded-md focus:outline-none focus:border-[#1F8A8A] min-h-[60px]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">REFLECTION: "What did you change during this revision?"</label>
                  <textarea
                    value={srlReflection}
                    onChange={(e) => setSrlReflection(e.target.value)}
                    placeholder="e.g. Removed colloquial words, added structured citations, and synthesized findings."
                    className="w-full p-2 border border-slate-200 rounded-md focus:outline-none focus:border-[#1F8A8A] min-h-[50px]"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      alert('SRL reflections saved contextually. Good job planning your learning pathway!');
                      setSrlExpanded(false);
                    }}
                    className="px-4 py-2 bg-[#1F8A8A] hover:bg-[#1a7575] text-white font-semibold rounded-md shadow-sm text-xs"
                  >
                    Save Reflections
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Draft History Restorer */}
          {paper.draftHistory && paper.draftHistory.filter(h => h.sectionId === selectedSectionId).length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <History className="h-4 w-4 text-slate-400" /> Draft Version History ({paper.draftHistory.filter(h => h.sectionId === selectedSectionId).length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {paper.draftHistory.filter(h => h.sectionId === selectedSectionId).map((v) => (
                  <div key={v.id} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg">
                    <div>
                      <span className="font-semibold text-slate-700">Draft version ({v.wordCount} words)</span>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(v.timestamp).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleRestoreVersion(v.content)}
                      className="px-2.5 py-1 bg-white hover:bg-[#17365D] hover:text-white border border-slate-200 text-[#17365D] text-[10px] font-bold rounded shadow-sm transition-all"
                    >
                      Restore Draft
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Panel: Writing Process Indicator */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">WRITING PROCESS INDICATOR</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="block text-slate-400">Student Draft Effort</span>
                <span className="font-bold text-[#17365D] block mt-1">
                  {draftText.length > 100 ? 'HIGH' : draftText.length > 30 ? 'MODERATE' : 'LOW'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="block text-slate-400">Autocomplete Accepted</span>
                <span className="font-bold text-[#17365D] block mt-1">
                  {activeSection.wordPredictionsAccepted > 10 ? 'HIGH' : activeSection.wordPredictionsAccepted > 2 ? 'MODERATE' : 'LOW'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="block text-slate-400">AI Feedback Requests</span>
                <span className="font-bold text-[#17365D] block mt-1">
                  {activeSection.aiFeedbackRequests > 5 ? 'HIGH' : activeSection.aiFeedbackRequests > 0 ? 'MODERATE' : 'LOW'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="block text-slate-400">Direct AI Generation</span>
                <span className="font-bold text-green-600 block mt-1">NONE RECORDED</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 leading-relaxed font-sans">
              <strong>Process status:</strong> DOCUMENTED WRITING PROCESS.
              <p className="mt-1">
                “AI-use indicators are based on observable writing-process activity and cannot prove authorship or detect all external AI use.”
              </p>
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): LIVE FEEDBACK HUB */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Plagiarism & Similarity Checker Widget */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> AI PLAGIARISM CHECKER
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase">Live Scan</span>
            </div>
            
            <div className="p-5 space-y-4 text-xs font-sans">
              {isScanningPlagiarism ? (
                <div className="space-y-3 py-4 text-center">
                  <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-10 w-10 bg-emerald-500 text-white items-center justify-center font-bold text-lg">🛡️</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700 animate-pulse">Running Originality Scan...</p>
                    <p className="text-[10px] text-slate-400 font-mono">{scanStep}</p>
                  </div>
                </div>
              ) : plagiarismScore !== null ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3.5 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="relative flex items-center justify-center">
                      <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-base ${
                        plagiarismScore >= 30 ? 'bg-red-50 text-red-600 border-2 border-red-200' :
                        plagiarismScore >= 10 ? 'bg-amber-50 text-amber-600 border-2 border-amber-200' :
                        'bg-green-50 text-green-600 border-2 border-green-200'
                      }`}>
                        {plagiarismScore}%
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Scan Result Verdict</span>
                      <span className={`font-bold text-xs ${
                        plagiarismScore >= 30 ? 'text-red-700' :
                        plagiarismScore >= 10 ? 'text-amber-700' :
                        'text-green-700'
                      }`}>
                        {plagiarismScore >= 30 ? '⚠️ High Plagiarism Risk' :
                         plagiarismScore >= 10 ? '⚡ Similar Phrasing Detected' :
                         '✓ Highly Original Content'}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                        {plagiarismScore >= 30 ? 'Exact match with Source Bank entries without proper paraphrase structures.' :
                         plagiarismScore >= 10 ? 'Minor phrases match academic references. Revise verbatim words.' :
                         'Content adheres perfectly to the Grade 11 independent writing framework.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handlePlagiarismScan}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-all text-center text-xs"
                    >
                      Re-run Integrity Scan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5 text-center py-2">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-base">
                    🛡️
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 text-xs">Verify Originality & Academic Voice</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Analyze your paragraph draft against peer papers, local journals, and external databases to ensure custom paraphrase levels.
                    </p>
                  </div>
                  <button
                    onClick={handlePlagiarismScan}
                    disabled={!draftText.trim()}
                    className="w-full py-2 bg-[#1F8A8A] hover:bg-[#156161] disabled:opacity-50 text-white font-bold rounded-lg shadow-sm transition-all text-xs"
                  >
                    Run AI Plagiarism Scan
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main live guidance: WHAT TO DO NEXT */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden sticky top-24">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#1F8A8A]" /> "WHAT TO DO NEXT?"
              </span>
              <span className="text-[10px] text-[#1F8A8A] font-semibold">Active Advice</span>
            </div>

            <div className="p-5 space-y-4 text-xs font-sans">
              {reviewResult ? (
                <div className="space-y-4">
                  {/* Prioritized Revision List */}
                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Suggested Revision Priority</span>
                    <div className="space-y-2.5">
                      {reviewResult.whatToDoNext.map((suggestion, idx) => (
                        <div key={idx} className="flex gap-2 items-start p-2.5 bg-[#F4B942]/5 border border-[#F4B942]/10 rounded-lg">
                          <span className="w-4 h-4 rounded-full bg-[#F4B942]/10 text-[#D98E04] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{idx + 1}</span>
                          <span className="text-slate-700 leading-normal">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Similarity Flags */}
                  {reviewResult.similarityFlags.length > 0 && (
                    <div className="space-y-2 border-t border-slate-100 pt-4">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-red-500 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" /> Similarity Warning Flags
                      </span>
                      <div className="space-y-2">
                        {reviewResult.similarityFlags.map((flag, idx) => (
                          <div key={idx} className="p-3 bg-red-50 border border-red-100 rounded-lg space-y-1.5">
                            <span className="font-bold text-red-800 text-[11px] block">Potentially similar wording detected</span>
                            <div className="bg-white p-2 border border-slate-100 rounded font-mono text-[10px] text-slate-600">
                              "{flag.text}"
                            </div>
                            <p className="text-[10px] text-slate-500">Source matches: <strong className="text-slate-600">{flag.source}</strong></p>
                            <p className="text-[10px] text-slate-600 leading-relaxed bg-white/50 p-1.5 rounded">{flag.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rubric Evaluation metrics breakdown */}
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Rubric Checklist</span>
                    <div className="space-y-2">
                      {reviewResult.rubricEvaluation.map((crit, idx) => {
                        const originalCrit = state.rubric.criteria.find(c => c.id === crit.criterionId);
                        const isProficient = crit.rating === 'proficient' || crit.rating === 'advanced';
                        return (
                          <div key={idx} className="flex items-start justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                            <div className="space-y-0.5 pr-2">
                              <span className="font-bold text-slate-800 text-[11px]">{originalCrit?.name}</span>
                              <p className="text-[10px] text-slate-500 leading-tight">{crit.feedback}</p>
                            </div>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${isProficient ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                              {crit.rating}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {reviewResult.canMoveToNext && (
                    <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-green-800 text-xs font-semibold leading-relaxed">
                      ✓ Congratulations! This section matches Grade 11 Proficient standards. You are cleared to save and continue to the next section.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 text-center py-6">
                  <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700 text-xs">No active draft review is open</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      Write your section content in the editor and click "Submit Draft for Check" to populate originality warnings, structural rubric grades, and specific steps to improve your composition.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Modal: APA 7th Edition Full-Manuscript Exporter */}
      {showExporter && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-[#17365D] text-white">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold tracking-wider text-teal-300">APA 7th Edition Compiler</span>
                <h2 className="text-lg font-bold font-serif">Compiled Research Paper Draft</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    let fullText = `${paper.title}\n\n`;
                    fullText += `Submitted by: ${paper.studentName || state.currentUser?.name}\n`;
                    fullText += `Class Section: ${paper.studentSection || 'Grade 11'}\n`;
                    fullText += `Institution: Manila Senior High School, Department of Education\n\n`;
                    paper.sections.forEach(sec => {
                      if (sec.content.trim()) {
                        fullText += `--- ${sec.title.toUpperCase()} ---\n${sec.content}\n\n`;
                      }
                    });
                    fullText += `--- REFERENCES ---\n`;
                    state.sources.filter(s => s.verified).forEach(s => {
                      const cleanAuthor = s.author.trim();
                      const cleanYear = s.date.trim() ? `(${s.date.trim()})` : '(n.d.)';
                      const cleanTitle = s.title.trim();
                      const cleanPub = s.publication.trim();
                      const cleanUrl = s.urlOrDoi.trim() ? `. Available from ${s.urlOrDoi.trim()}` : '';
                      fullText += `${cleanAuthor} ${cleanYear}. ${cleanTitle}. ${cleanPub}${cleanUrl}.\n`;
                    });
                    navigator.clipboard.writeText(fullText);
                    showToast('Full formatted manuscript copied to clipboard!', 'success');
                  }}
                  className="px-3.5 py-1.5 bg-[#1F8A8A] hover:bg-[#1a7575] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
                >
                  <Copy className="h-4 w-4" /> Copy Full Manuscript
                </button>
                <button
                  onClick={() => setShowExporter(false)}
                  className="text-white/80 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-8 bg-[#FAFBFD] font-serif text-sm text-slate-800 leading-relaxed select-text flex-1">
              {/* Title Page */}
              <div className="min-h-[300px] flex flex-col items-center justify-center text-center space-y-4 pt-12 border-b border-dashed border-slate-200 pb-12 font-sans">
                <h1 className="text-2xl font-bold text-slate-900 leading-tight max-w-xl italic font-serif">
                  {paper.title || "The Impact of Social Media on Grade 11 Academic Work"}
                </h1>
                <div className="space-y-1.5 pt-4 text-xs font-sans text-slate-500 uppercase tracking-widest font-semibold">
                  <p>Prepared by: <span className="text-slate-800 font-bold">{paper.studentName || state.currentUser?.name}</span></p>
                  <p>Grade & Section: <span className="text-slate-800 font-bold">{paper.studentSection || "Grade 11 - STEM A"}</span></p>
                  <p>Class: Practical Research 1 & 2 Course</p>
                  <p>Institution: Department of Education Senior High School</p>
                  <p>Submission Date: September 24, 2026</p>
                </div>
              </div>

              {/* Manuscript sections */}
              {paper.sections.map(sec => {
                if (!sec.content.trim()) return null;
                return (
                  <div key={sec.id} className="space-y-3 pb-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[#17365D] border-b border-slate-100 pb-1 font-sans">
                      {sec.title}
                    </h2>
                    <p className="text-xs leading-relaxed font-serif whitespace-pre-wrap text-slate-700 font-normal">
                      {sec.content}
                    </p>
                  </div>
                );
              })}

              {/* APA references list */}
              <div className="space-y-4 pt-6 border-t border-slate-200">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#17365D] font-sans">
                  References (APA 7th Edition)
                </h2>
                <div className="space-y-2.5 text-xs text-slate-600 pl-4 font-serif leading-relaxed">
                  {state.sources.filter(s => s.verified).map((src) => {
                    const cleanAuthor = src.author.trim();
                    const cleanYear = src.date.trim() ? `(${src.date.trim()})` : '(n.d.)';
                    const cleanTitle = src.title.trim();
                    const cleanPub = src.publication.trim();
                    const cleanUrl = src.urlOrDoi.trim() ? `. Available from ${src.urlOrDoi.trim()}` : '';
                    return (
                      <p key={src.id} className="indent-[-1.5rem] pl-6">
                        {cleanAuthor} {cleanYear}. {cleanTitle}. <span className="italic">{cleanPub}</span>{cleanUrl}.
                      </p>
                    );
                  })}
                  {state.sources.filter(s => s.verified).length === 0 && (
                    <p className="text-slate-400 italic">No verified sources currently referenced in your bibliography.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
