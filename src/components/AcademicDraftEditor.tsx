/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AcademicDraftEditor
 * 
 * High-Accuracy Intelligent Autocomplete multiline editor specifically tailored for
 * "Compose Academic Draft" in WriteWise.
 * 
 * Features:
 * - Native multiline <textarea> for seamless standard drafting.
 * - Multi-tiered context engine predicting sentence stems, subclauses, 
 *   n-gram collocations, next-phrase continuations, and academic vocabulary.
 * - Section-aware weighting (Introduction, RRL, Methodology, Results, Discussion, Conclusion).
 * - Inline light-gray ghost-text display positioned directly after typed characters.
 * - Unimpeded normal typing and backspacing.
 * - Keyboard shortcuts: Tab or Right Arrow to accept, Escape to dismiss.
 * - Mobile-friendly touch toolbar with one-tap accept.
 * - Pixel-matched backdrop with synchronized scrolling.
 * - Zero page reloads, 100% reactive client-side state.
 */

import React, { useState, useRef, useEffect, useId } from 'react';
import { Sparkles, Check, X, BookOpen, Layers } from 'lucide-react';
import { 
  predictAcademicCompletion, 
  AutocompletePrediction 
} from '../utils/academicAutocompleteEngine';
import { ACADEMIC_SENTENCE_STEMS } from '../data/autocompletePhrases';

export interface AcademicDraftEditorProps {
  value: string;
  onChange: (value: string) => void;
  onAcceptSuggestion?: (acceptedPhrase: string) => void;
  placeholder?: string;
  sectionId?: string;
  className?: string;
  minHeight?: string;
  disabled?: boolean;
}

export const AcademicDraftEditor: React.FC<AcademicDraftEditorProps> = ({
  value,
  onChange,
  onAcceptSuggestion,
  placeholder = 'Compose your academic section draft directly here...',
  sectionId,
  className = '',
  minHeight = '300px',
  disabled = false,
}) => {
  const editorId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const [cursorPos, setCursorPos] = useState<number>(value.length);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [activeAlternativeIndex, setActiveAlternativeIndex] = useState<number>(-1);
  const [showQuickStarters, setShowQuickStarters] = useState<boolean>(false);

  // Sync cursor position on mount or external value changes
  useEffect(() => {
    if (textareaRef.current) {
      setCursorPos(textareaRef.current.selectionEnd || value.length);
    }
  }, [value]);

  // Synchronize scroll between textarea and ghost backdrop
  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Determine active text slices
  const safeCursorPos = Math.min(Math.max(0, cursorPos), value.length);
  const textBeforeCursor = value.slice(0, safeCursorPos);
  const textAfterCursor = value.slice(safeCursorPos);

  // High-accuracy intelligent prediction
  const prediction: AutocompletePrediction | null = (!isDismissed && !disabled)
    ? predictAcademicCompletion(textBeforeCursor, sectionId)
    : null;

  const suggestedCompletion = prediction?.suggestedCompletion || null;
  const ghostSuffix = prediction?.ghostSuffix || '';
  const replacementStart = prediction?.replacementStart ?? safeCursorPos;
  const matchingAlternatives = prediction?.alternatives || [];
  const hint = prediction?.hint;
  const category = prediction?.category;

  // Extract trailing word for accurate alternative replacement
  const trailingWordMatch = textBeforeCursor.match(/([a-zA-Z0-9_\-']+)\s*$/);
  const trailingWord = trailingWordMatch ? trailingWordMatch[1] : '';

  // Accept the suggestion (Tab / Right Arrow / Tap)
  const acceptSuggestion = (overrideText?: string) => {
    const textToInsert = overrideText || suggestedCompletion;
    if (!textToInsert) return;

    let prefix = value.slice(0, replacementStart);
    const suffix = value.slice(safeCursorPos);

    // If an alternative from the pill list was selected, ensure proper prefix alignment
    if (overrideText && overrideText !== suggestedCompletion) {
      if (category === 'vocabulary' && trailingWord) {
        prefix = value.slice(0, safeCursorPos - trailingWord.length);
      } else if (category === 'continuation') {
        prefix = value.slice(0, safeCursorPos);
      }
    }
    
    // Add trailing space for natural flow if needed
    const needsTrailingSpace = !suffix.startsWith(' ') && 
                               !suffix.startsWith('\n') && 
                               !suffix.startsWith(',') && 
                               !suffix.startsWith('.') &&
                               !textToInsert.endsWith(' ');

    const completedText = prefix + textToInsert + (needsTrailingSpace ? ' ' : '') + suffix;
    const newCursor = prefix.length + textToInsert.length + (needsTrailingSpace ? 1 : 0);

    onChange(completedText);
    onAcceptSuggestion?.(textToInsert);
    setIsDismissed(true);
    setCursorPos(newCursor);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursor, newCursor);
        handleScroll();
      }
    }, 15);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Escape: Dismiss suggestion
    if (e.key === 'Escape') {
      if (ghostSuffix) {
        e.preventDefault();
        setIsDismissed(true);
        setActiveAlternativeIndex(-1);
      }
      return;
    }

    // Tab key: Accept suggestion
    if (e.key === 'Tab') {
      if (ghostSuffix && suggestedCompletion) {
        e.preventDefault();
        acceptSuggestion(suggestedCompletion);
      }
      return;
    }

    // Right Arrow key: Accept suggestion if cursor is at the end of typed prefix
    if (e.key === 'ArrowRight') {
      if (ghostSuffix && suggestedCompletion && cursorPos === safeCursorPos) {
        e.preventDefault();
        acceptSuggestion(suggestedCompletion);
      }
      return;
    }

    // Alt + Down/Up arrows for alternative matching phrases
    if (matchingAlternatives.length > 1 && !isDismissed) {
      if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveAlternativeIndex(prev => 
          prev < matchingAlternatives.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveAlternativeIndex(prev => 
          prev > 0 ? prev - 1 : matchingAlternatives.length - 1
        );
        return;
      }
    }
  };

  // Textarea input changes
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    const newPos = e.target.selectionEnd;
    setIsDismissed(false);
    setActiveAlternativeIndex(-1);
    setCursorPos(newPos);
    onChange(newVal);
  };

  // Track cursor position on click/keyup
  const handleCursorActivity = () => {
    if (textareaRef.current) {
      setCursorPos(textareaRef.current.selectionEnd);
      handleScroll();
    }
  };

  // Quick insert of predefined starter
  const insertQuickStarter = (phrase: string) => {
    const cleanPhrase = phrase.trim();
    const needsSpace = value.length > 0 && !value.endsWith(' ') && !value.endsWith('\n');
    const newText = value + (needsSpace ? ' ' : '') + cleanPhrase + ' ';
    onChange(newText);
    onAcceptSuggestion?.(cleanPhrase);
    setShowQuickStarters(false);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newText.length, newText.length);
        handleScroll();
      }
    }, 20);
  };

  const hasSuggestion = Boolean(ghostSuffix && suggestedCompletion && !isDismissed);

  // Common typography & sizing style for pixel-perfect alignment
  const typographyStyles: React.CSSProperties = {
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '14px',
    lineHeight: '1.625',
    letterSpacing: '0px',
    tabSize: 2,
    boxSizing: 'border-box',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
  };

  // Filter quick starters relevant to current paper section
  const sectionStarters = ACADEMIC_SENTENCE_STEMS.filter(s => 
    !sectionId || !s.sectionHint || s.sectionHint.toLowerCase() === sectionId.toLowerCase()
  ).slice(0, 8);

  return (
    <div className={`space-y-2.5 font-sans ${className}`}>
      
      {/* Top Autocomplete Status Bar & Guidance */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#17365D]">
            <Sparkles className="h-3.5 w-3.5 text-[#1F8A8A]" />
            Compose Academic Draft
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">•</span>
          <span className="text-[10px] text-emerald-600 font-medium hidden sm:inline flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Context-aware prediction active
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Starters Drawer Toggle */}
          <button
            type="button"
            onClick={() => setShowQuickStarters(!showQuickStarters)}
            className="text-[10px] font-bold text-[#17365D] hover:bg-[#17365D]/10 px-2 py-0.5 rounded-md border border-[#17365D]/20 transition-colors flex items-center gap-1"
          >
            <BookOpen className="h-3 w-3" />
            <span>{showQuickStarters ? 'Hide Starters' : 'Sentence Starters'}</span>
          </button>

          {/* Keyboard Legend */}
          <div className="hidden md:flex items-center gap-1 text-[10px] text-slate-400 font-mono">
            <span>Press</span>
            <kbd className="px-1.5 py-0.2 bg-slate-100 border border-slate-200 rounded font-bold text-slate-600 shadow-2xs">Tab</kbd>
            <span>or</span>
            <kbd className="px-1.5 py-0.2 bg-slate-100 border border-slate-200 rounded font-bold text-slate-600 shadow-2xs">→</kbd>
            <span>to accept</span>
          </div>
        </div>
      </div>

      {/* Quick Starters Accordion */}
      {showQuickStarters && (
        <div className="p-3 bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200 rounded-xl space-y-2 text-xs animate-fade-in">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
            <span>Curated Sentence Starters (Click to Insert):</span>
            <button
              type="button"
              onClick={() => setShowQuickStarters(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sectionStarters.map((starter, i) => (
              <button
                key={i}
                type="button"
                onClick={() => insertQuickStarter(starter.text)}
                className="px-2.5 py-1 bg-white hover:bg-[#17365D] hover:text-white text-slate-700 border border-slate-200 rounded-lg text-[11px] font-mono transition-all shadow-2xs text-left"
              >
                + &quot;{starter.text.slice(0, 42)}...&quot;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor Frame with Pixel-Matched Dual Layers */}
      <div 
        className="relative w-full rounded-xl border border-slate-300 bg-white shadow-xs transition-all duration-150 focus-within:border-[#17365D] focus-within:ring-2 focus-within:ring-[#17365D]/15 hover:border-slate-400 overflow-hidden"
        style={{ minHeight }}
      >
        
        {/* LAYER 1: Background Ghost-Text Layer (Pixel-matched with textarea) */}
        <div
          ref={backdropRef}
          aria-hidden="true"
          className="absolute inset-0 p-5 pointer-events-none select-none overflow-hidden text-slate-800"
          style={{
            ...typographyStyles,
            zIndex: 1,
          }}
        >
          {/* User's typed text prior to cursor (invisible placeholder) */}
          <span className="invisible opacity-0 text-transparent">
            {textBeforeCursor}
          </span>

          {/* Inline Ghost Suggestion (Light Gray: Requirements 3 & 4) */}
          {hasSuggestion && (
            <span className="text-slate-400 font-normal">
              {ghostSuffix}
            </span>
          )}

          {/* User's text after cursor (invisible placeholder) */}
          <span className="invisible opacity-0 text-transparent">
            {textAfterCursor}
          </span>
        </div>

        {/* LAYER 2: Interactive Foreground Textarea (Requirements 1, 5, 8, 9) */}
        <textarea
          ref={textareaRef}
          id={editorId}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleCursorActivity}
          onClick={handleCursorActivity}
          onSelect={handleCursorActivity}
          onScroll={handleScroll}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className="relative z-10 w-full bg-transparent p-5 text-slate-800 focus:outline-none resize-y leading-relaxed font-sans placeholder-slate-300"
          style={{
            ...typographyStyles,
            minHeight,
            caretColor: '#17365D',
          }}
        />

        {/* Floating Interactive Autocomplete Helper Pill */}
        {hasSuggestion && (
          <div className="absolute right-3 bottom-3 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs border border-[#17365D]/25 shadow-md p-1.5 rounded-xl animate-fade-in max-w-[95%] sm:max-w-none">
            <div className="flex items-center gap-1.5 px-2 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#1F8A8A] shrink-0" />
              <div className="text-[11px] leading-tight max-w-[170px] sm:max-w-xs truncate">
                {hint && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#17365D] block">
                    {hint}
                  </span>
                )}
                <span className="text-slate-400">Suggest: </span>
                <span className="font-bold text-slate-800">{suggestedCompletion}</span>
              </div>
            </div>

            {/* Accept Button (Keyboard Tab / Touch Friendly Tap: Requirement 6, 10) */}
            <button
              type="button"
              onClick={() => acceptSuggestion(suggestedCompletion || undefined)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#17365D] hover:bg-[#112643] text-white rounded-lg text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              title="Accept suggestion (Tab or Right Arrow)"
            >
              <Check className="h-3.5 w-3.5 text-emerald-300" />
              <span>Accept</span>
              <kbd className="px-1 py-0.2 bg-white/20 rounded font-mono text-[9px] hidden sm:inline">Tab ⇥</kbd>
            </button>

            {/* Dismiss Button (Esc: Requirement 7) */}
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              title="Dismiss suggestion (Esc)"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* Alternative Suggestions Pill Bar (if multiple matches exist) */}
      {matchingAlternatives.length > 1 && !isDismissed && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 px-1">
            <Layers className="h-3 w-3" /> Alternatives:
          </span>
          {matchingAlternatives.map((alt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => acceptSuggestion(alt)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
                alt === suggestedCompletion 
                  ? 'bg-[#17365D] text-white border-[#17365D] shadow-2xs' 
                  : 'bg-white text-slate-700 border-slate-200 hover:border-[#17365D]/40'
              }`}
            >
              &quot;{alt.length > 40 ? alt.slice(0, 38) + '...' : alt}&quot;
            </button>
          ))}
        </div>
      )}

      {/* Footer Info: Gradual Release & Integrity Guarantee */}
      <div className="px-2 flex justify-between items-center text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Intelligent word & sentence autocomplete active. Press <kbd className="px-1 py-0.2 bg-slate-100 rounded font-mono text-[9px]">Tab</kbd> or <kbd className="px-1 py-0.2 bg-slate-100 rounded font-mono text-[9px]">→</kbd> to complete.
        </span>
        <span className="font-mono text-slate-500">
          {value.trim() ? value.trim().split(/\s+/).length : 0} Words
        </span>
      </div>

    </div>
  );
};
