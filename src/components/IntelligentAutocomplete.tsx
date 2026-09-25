/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Intelligent Autocomplete Component
 * 
 * Features:
 * - Real-time prefix & contextual prediction from predefined list
 * - Inline ghost-text suggestion directly inside the input in light gray
 * - Unimpeded normal typing and backspacing
 * - Keyboard shortcuts: Tab or Right Arrow to accept, Esc to dismiss
 * - Touch-friendly mobile "Tap to Accept" action
 * - Zero page reload, purely responsive client-side state
 */

import React, { useState, useRef, useEffect, useId } from 'react';
import { ALL_PREDEFINED_PHRASES } from '../data/autocompletePhrases';
import { predictAcademicCompletion } from '../utils/academicAutocompleteEngine';
import { Sparkles, CornerDownLeft, X, ArrowRight, Check } from 'lucide-react';

export interface IntelligentAutocompleteProps {
  /** Predefined dictionary of phrases/words. Defaults to academic & research dictionary. */
  predefinedList?: string[];
  /** Placeholder text when input is empty */
  placeholder?: string;
  /** Current value if controlled */
  value?: string;
  /** Initial value if uncontrolled */
  defaultValue?: string;
  /** Callback fired whenever user types */
  onChange?: (val: string) => void;
  /** Callback fired when an autocomplete suggestion is accepted */
  onAccept?: (acceptedText: string) => void;
  /** Optional container class name */
  className?: string;
  /** Optional label */
  label?: string;
  /** Optional helper text */
  helperText?: string;
  /** Optional ID for input */
  id?: string;
  /** Whether to show a list of alternative matched suggestions below */
  showAlternativesList?: boolean;
  /** Max items in alternative suggestions list */
  maxAlternatives?: number;
  /** Auto focus on mount */
  autoFocus?: boolean;
}

export const IntelligentAutocomplete: React.FC<IntelligentAutocompleteProps> = ({
  predefinedList = ALL_PREDEFINED_PHRASES,
  placeholder = 'Type an academic phrase, e.g. "academic...", "the pri...", "accord..."',
  value: controlledValue,
  defaultValue = '',
  onChange,
  onAccept,
  className = '',
  label,
  helperText,
  id,
  showAlternativesList = true,
  maxAlternatives = 4,
  autoFocus = false,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const [isDismissed, setIsDismissed] = useState(false);
  const [lastAcceptedWord, setLastAcceptedWord] = useState<string | null>(null);
  const [activeAlternativeIndex, setActiveAlternativeIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize search candidates
  const candidates = predefinedList.length > 0 ? predefinedList : ALL_PREDEFINED_PHRASES;

  // Find the best match
  let suggestedCompletion: string | null = null;
  let ghostSuffix = '';
  let matchingAlternatives: string[] = [];

  const trimmed = currentValue;

  if (trimmed.length > 0 && !isDismissed) {
    // Try the context-aware academic engine first
    const enginePred = predictAcademicCompletion(trimmed);
    if (enginePred && enginePred.ghostSuffix) {
      suggestedCompletion = enginePred.suggestedCompletion;
      ghostSuffix = enginePred.ghostSuffix;
      matchingAlternatives = enginePred.alternatives.slice(0, maxAlternatives);
    } else {
      const lowerTyped = trimmed.toLowerCase();

      // 1. Direct prefix match against full phrase (highest priority)
      const directMatches = candidates.filter(item => 
        item.toLowerCase().startsWith(lowerTyped) && item.toLowerCase() !== lowerTyped
      );

      if (directMatches.length > 0) {
        // Pick best match (closest in length or exact first match)
        const bestMatch = directMatches[0];
        suggestedCompletion = bestMatch;
        
        // Preserve user typed casing in the prefix and append remainder
        ghostSuffix = bestMatch.slice(trimmed.length);
        matchingAlternatives = directMatches.slice(0, maxAlternatives);
      } else {
        // 2. Trailing word / clause prefix match
        const lastWordMatch = trimmed.match(/([a-zA-Z0-9_-]+)$/);
        if (lastWordMatch && lastWordMatch[1].length >= 2) {
          const lastWord = lastWordMatch[1].toLowerCase();
          const wordMatches = candidates.filter(item => 
            item.toLowerCase().startsWith(lastWord) && item.toLowerCase() !== lastWord
          );

          if (wordMatches.length > 0) {
            const matchedWord = wordMatches[0];
            const prefixBeforeWord = trimmed.slice(0, trimmed.length - lastWord.length);
            suggestedCompletion = prefixBeforeWord + matchedWord;
            ghostSuffix = matchedWord.slice(lastWord.length);
            matchingAlternatives = wordMatches.map(w => prefixBeforeWord + w).slice(0, maxAlternatives);
          }
        }
      }
    }
  }

  // Handle text input changes (Requirement 1, 2, 5, 8, 9)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setIsDismissed(false); // Re-enable suggestions on new keystrokes
    setActiveAlternativeIndex(-1);

    if (!isControlled) {
      setInternalValue(newVal);
    }
    onChange?.(newVal);
  };

  // Accept the suggestion (Requirement 6)
  const acceptSuggestion = (fullTextToAccept?: string) => {
    const textToApply = fullTextToAccept || suggestedCompletion;
    if (!textToApply) return;

    if (!isControlled) {
      setInternalValue(textToApply);
    }
    onChange?.(textToApply);
    onAccept?.(textToApply);

    setLastAcceptedWord(textToApply);
    setIsDismissed(true);

    // Keep focus and put cursor at the end
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(textToApply.length, textToApply.length);
      }
    }, 10);
  };

  // Keyboard navigation & control (Requirement 6, 7, 8)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Escape: Dismiss suggestion (Requirement 7)
    if (e.key === 'Escape') {
      if (ghostSuffix || matchingAlternatives.length > 0) {
        e.preventDefault();
        setIsDismissed(true);
        setActiveAlternativeIndex(-1);
      }
      return;
    }

    // Tab key: Accept suggestion (Requirement 6)
    if (e.key === 'Tab') {
      if (ghostSuffix && suggestedCompletion) {
        e.preventDefault();
        acceptSuggestion(suggestedCompletion);
      }
      return;
    }

    // Right Arrow key: Accept suggestion if cursor is at the end of typed text (Requirement 6)
    if (e.key === 'ArrowRight') {
      const cursorPosition = inputRef.current?.selectionStart;
      if (cursorPosition === currentValue.length && ghostSuffix && suggestedCompletion) {
        e.preventDefault();
        acceptSuggestion(suggestedCompletion);
      }
      return;
    }

    // Arrow Down/Up for navigating alternative suggestions if visible
    if (showAlternativesList && matchingAlternatives.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveAlternativeIndex(prev => 
          prev < matchingAlternatives.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveAlternativeIndex(prev => 
          prev > 0 ? prev - 1 : matchingAlternatives.length - 1
        );
        return;
      }
      if (e.key === 'Enter' && activeAlternativeIndex >= 0) {
        e.preventDefault();
        acceptSuggestion(matchingAlternatives[activeAlternativeIndex]);
        return;
      }
    }
  };

  // Clear text
  const handleClear = () => {
    if (!isControlled) {
      setInternalValue('');
    }
    onChange?.('');
    setIsDismissed(false);
    inputRef.current?.focus();
  };

  const hasSuggestion = Boolean(ghostSuffix && suggestedCompletion && !isDismissed);

  return (
    <div className={`w-full font-sans ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            {label}
          </label>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-600 font-bold shadow-2xs">Tab</kbd>
            <span>or</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-600 font-bold shadow-2xs">→</kbd>
            <span>to accept</span>
          </div>
        </div>
      )}

      {/* Input container with dual-layer alignment */}
      <div className="relative w-full rounded-xl border border-slate-300 bg-white shadow-xs transition-all duration-150 focus-within:border-[#17365D] focus-within:ring-2 focus-within:ring-[#17365D]/15 hover:border-slate-400">
        
        {/* Layer 1: Background Ghost Text Layer (Requirement 3, 4) */}
        {/* Uses exact same padding, typography, and line-height as the foreground input */}
        <div 
          aria-hidden="true"
          className="absolute inset-0 flex items-center px-4 py-3 pointer-events-none select-none overflow-hidden text-sm sm:text-base font-normal leading-normal whitespace-pre text-left"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Transparent user text */}
          <span className="invisible opacity-0 text-transparent font-normal">
            {currentValue}
          </span>
          
          {/* Light Gray Ghost Suggestion (Requirement 4) */}
          {hasSuggestion && (
            <span className="text-slate-400 font-normal">
              {ghostSuffix}
            </span>
          )}
        </div>

        {/* Layer 2: Foreground Interactive Input (Requirement 1, 5, 8, 9) */}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={currentValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className="relative z-10 w-full bg-transparent px-4 py-3 pr-24 sm:pr-32 text-sm sm:text-base font-normal text-slate-800 leading-normal placeholder:text-slate-400 focus:outline-none"
        />

        {/* Right Action Zone: Mobile Friendly Tap-to-Accept & Status (Requirement 6, 7, 10) */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5">
          {/* Clear button if input has text */}
          {currentValue.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
              title="Clear input"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Active Suggestion Accept Badge / Mobile Tap Button (Requirement 6, 10) */}
          {hasSuggestion ? (
            <button
              type="button"
              onClick={() => acceptSuggestion(suggestedCompletion || undefined)}
              className="group flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-[#17365D] hover:bg-[#112643] text-white rounded-lg shadow-xs transition-all active:scale-95 animate-pulse hover:animate-none cursor-pointer"
              title="Click or tap to accept completion (or press Tab / Right Arrow)"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span className="text-[11px] hidden xs:inline">Accept</span>
              <kbd className="px-1 py-0.2 bg-white/20 rounded text-[9px] font-mono tracking-tight">⇥</kbd>
            </button>
          ) : currentValue.length > 0 ? (
            <span className="text-[10px] text-slate-400 px-1 font-mono">
              {currentValue.length} chars
            </span>
          ) : null}
        </div>
      </div>

      {/* Mobile Keyboard Guidance & Controls Bar (Requirement 10) */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 px-1 text-xs">
        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
          {hasSuggestion ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-200">
              <Check className="h-3 w-3" />
              Suggested: <span className="font-semibold">{suggestedCompletion}</span>
            </span>
          ) : (
            <span>{helperText || 'Start typing any academic word to trigger instant intelligent autocomplete.'}</span>
          )}
        </div>

        {/* Quick action buttons for mobile touch devices */}
        {hasSuggestion && (
          <div className="flex items-center gap-1.5 sm:hidden">
            <button
              type="button"
              onClick={() => acceptSuggestion(suggestedCompletion || undefined)}
              className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold active:scale-95"
            >
              Tap to Complete
            </button>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[11px] font-medium"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Alternative Suggestions Dropdown Pill List (Requirement 2, 9, 10) */}
      {showAlternativesList && matchingAlternatives.length > 1 && !isDismissed && (
        <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-0.5 flex items-center justify-between">
            <span>Matching completions ({matchingAlternatives.length})</span>
            <span className="text-[9px] font-normal text-slate-400">Click or tap to choose</span>
          </div>
          <div className="grid grid-cols-1 gap-1">
            {matchingAlternatives.map((alt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => acceptSuggestion(alt)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                  idx === activeAlternativeIndex || (idx === 0 && !hasSuggestion)
                    ? 'bg-[#17365D] text-white font-medium shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                }`}
              >
                <span className="truncate pr-2 font-mono text-xs">
                  <span className="font-bold underline decoration-slate-300">{alt.slice(0, currentValue.length)}</span>
                  <span className="opacity-80">{alt.slice(currentValue.length)}</span>
                </span>
                <span className="text-[10px] opacity-60 flex items-center gap-0.5 shrink-0">
                  <ArrowRight className="h-3 w-3" /> Select
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Toast on Acceptance */}
      {lastAcceptedWord && (
        <div className="mt-1.5 text-[11px] text-emerald-600 flex items-center gap-1 animate-fade-in">
          <Check className="h-3 w-3" />
          <span>Accepted: &quot;{lastAcceptedWord}&quot;</span>
        </div>
      )}
    </div>
  );
};
