/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Academic Autocomplete & Sentence Prediction Engine
 * 
 * Accurately detects typing context, sentence boundaries, subclauses, 
 * n-gram collocations, and scholarly research vocabulary.
 */

import { 
  ACADEMIC_SENTENCE_STEMS, 
  ACADEMIC_COLLOCATIONS, 
  ACADEMIC_VOCABULARY,
  AutocompleteItem 
} from '../data/autocompletePhrases';

export interface AutocompletePrediction {
  suggestedCompletion: string;      // The completed text to insert
  ghostSuffix: string;              // The light-gray text extending after cursor
  replacementStart: number;          // Where the user's typed prefix begins
  confidence: number;               // Prediction confidence score (0 to 1)
  category: 'sentence_stem' | 'collocation' | 'vocabulary' | 'continuation';
  alternatives: string[];           // Other matching high-quality candidates
  hint?: string;                    // Contextual descriptor (e.g. 'Methodology Stem')
}

/**
 * Predicts the most accurate academic completion based on draft context.
 */
export function predictAcademicCompletion(
  textBeforeCursor: string,
  sectionId?: string
): AutocompletePrediction | null {
  if (!textBeforeCursor || textBeforeCursor.length < 2) {
    return null;
  }

  const cursorPos = textBeforeCursor.length;

  // 1. Identify Sentence Boundary (delimited by . ? ! or newline)
  const lastSentenceDelimiter = Math.max(
    textBeforeCursor.lastIndexOf('.'),
    textBeforeCursor.lastIndexOf('?'),
    textBeforeCursor.lastIndexOf('!'),
    textBeforeCursor.lastIndexOf('\n')
  );

  const rawSentence = lastSentenceDelimiter >= 0 
    ? textBeforeCursor.slice(lastSentenceDelimiter + 1) 
    : textBeforeCursor;
  
  const currentSentence = rawSentence.trimStart();
  const sentenceOffset = textBeforeCursor.length - currentSentence.length;

  // 2. Identify Subclause Boundary (delimited by , ; :)
  const lastSubclauseDelimiter = Math.max(
    textBeforeCursor.lastIndexOf(','),
    textBeforeCursor.lastIndexOf(';'),
    textBeforeCursor.lastIndexOf(':')
  );

  const rawSubclause = (lastSubclauseDelimiter >= lastSentenceDelimiter)
    ? textBeforeCursor.slice(lastSubclauseDelimiter + 1)
    : rawSentence;

  const currentSubclause = rawSubclause.trimStart();
  const subclauseOffset = textBeforeCursor.length - currentSubclause.length;

  // 3. Trailing word and whitespace status
  const endsWithSpace = /\s+$/.test(textBeforeCursor);
  const trailingWordMatch = textBeforeCursor.match(/([a-zA-Z0-9_\-']+)\s*$/);
  const trailingWord = trailingWordMatch ? trailingWordMatch[1] : '';

  // Combine items with Section Priority Weighting
  const scoredStems = ACADEMIC_SENTENCE_STEMS.map(stem => {
    let score = stem.weight || 5;
    if (sectionId && stem.sectionHint && stem.sectionHint.toLowerCase() === sectionId.toLowerCase()) {
      score += 5; // Boost section relevance
    }
    return { ...stem, finalScore: score };
  }).sort((a, b) => b.finalScore - a.finalScore);

  // -------------------------------------------------------------
  // STRATEGY 1: Clause & Sentence-Level Predictive Stems
  // -------------------------------------------------------------
  if (currentSentence.length >= 3) {
    const lowerSentence = currentSentence.toLowerCase();
    
    // Find stems that match the current sentence prefix
    const stemMatches = scoredStems.filter(item => {
      const lowerText = item.text.toLowerCase();
      return lowerText.startsWith(lowerSentence) && lowerText !== lowerSentence;
    });

    if (stemMatches.length > 0) {
      const best = stemMatches[0];
      const isCapitalized = currentSentence[0] === currentSentence[0].toUpperCase() && 
                            currentSentence[0] !== currentSentence[0].toLowerCase();
      const formatted = isCapitalized ? best.text[0].toUpperCase() + best.text.slice(1) : best.text;
      
      const ghostSuffix = formatted.slice(currentSentence.length);
      if (ghostSuffix.trim().length > 0) {
        return {
          suggestedCompletion: formatted,
          ghostSuffix,
          replacementStart: sentenceOffset,
          confidence: 0.95,
          category: 'sentence_stem',
          alternatives: stemMatches.slice(0, 4).map(m => m.text),
          hint: `${best.category.toUpperCase()} STEM`
        };
      }
    }
  }

  // -------------------------------------------------------------
  // STRATEGY 2: Subclause / After-Comma Predictive Stems
  // -------------------------------------------------------------
  if (currentSubclause.length >= 3 && currentSubclause !== currentSentence) {
    const lowerSubclause = currentSubclause.toLowerCase();

    const subMatches = scoredStems.filter(item => {
      const lowerText = item.text.toLowerCase();
      return lowerText.startsWith(lowerSubclause) && lowerText !== lowerSubclause;
    });

    if (subMatches.length > 0) {
      const best = subMatches[0];
      const isCapitalized = currentSubclause[0] === currentSubclause[0].toUpperCase();
      const formatted = isCapitalized ? best.text[0].toUpperCase() + best.text.slice(1) : best.text;

      const ghostSuffix = formatted.slice(currentSubclause.length);
      if (ghostSuffix.trim().length > 0) {
        return {
          suggestedCompletion: formatted,
          ghostSuffix,
          replacementStart: subclauseOffset,
          confidence: 0.9,
          category: 'sentence_stem',
          alternatives: subMatches.slice(0, 4).map(m => m.text),
          hint: 'COHESIVE SUBCLAUSE'
        };
      }
    }
  }

  // -------------------------------------------------------------
  // STRATEGY 3: N-Gram Collocations & Phrasal Matches (2 to 4 words)
  // -------------------------------------------------------------
  const words = textBeforeCursor.trim().split(/\s+/);
  if (words.length >= 2) {
    // Check 2, 3, or 4 trailing words
    for (let lookback = Math.min(words.length, 4); lookback >= 2; lookback--) {
      const nGram = words.slice(-lookback).join(' ').toLowerCase();
      
      // Match against collocations and sentence stems
      const collocationMatches = ACADEMIC_COLLOCATIONS.filter(item => {
        const lowerItem = item.text.toLowerCase();
        return lowerItem.startsWith(nGram) && lowerItem !== nGram;
      });

      if (collocationMatches.length > 0) {
        const best = collocationMatches[0];
        const nGramIndex = textBeforeCursor.toLowerCase().lastIndexOf(nGram);
        
        if (nGramIndex >= 0) {
          const typedPrefix = textBeforeCursor.slice(nGramIndex);
          const ghostSuffix = best.text.slice(typedPrefix.length);

          if (ghostSuffix.trim().length > 0) {
            return {
              suggestedCompletion: best.text,
              ghostSuffix,
              replacementStart: nGramIndex,
              confidence: 0.88,
              category: 'collocation',
              alternatives: collocationMatches.slice(0, 4).map(m => m.text),
              hint: 'SCHOLARLY COLLOCATION'
            };
          }
        }
      }
    }
  }

  // -------------------------------------------------------------
  // STRATEGY 4: Continuation Mode (When user typed word + trailing space)
  // -------------------------------------------------------------
  if (endsWithSpace && words.length > 0) {
    const lastWord = words[words.length - 1].toLowerCase();
    const lastTwoWords = words.length >= 2 ? `${words[words.length - 2].toLowerCase()} ${lastWord}` : lastWord;

    // Collocation continuation lookup
    const continuationMap: Record<string, string[]> = {
      'according to': [
        'recent empirical studies conducted by educational researchers',
        'the findings gathered from the survey respondents',
        'the theoretical framework established in chapter two',
        'scholarly literature on student academic performance'
      ],
      'based on': [
        'the statistical analysis of respondent data',
        'the findings presented in table two',
        'the empirical observations gathered during the investigation'
      ],
      'the results': [
        'indicate a statistically significant positive relationship',
        'demonstrate that a majority of respondents strongly agreed',
        'reveal no significant difference between the tested groups'
      ],
      'the findings': [
        'revealed that student engagement directly impacts learning outcomes',
        'demonstrated a high level of consistency across all indicators',
        'substantiate the alternative hypothesis proposed in chapter one'
      ],
      'there is a': [
        'statistically significant relationship between the variables',
        'moderate positive correlation between self-efficacy and performance',
        'notable disparity in respondents perceptions across strands'
      ],
      'there is no': [
        'statistically significant difference between the two cohorts',
        'significant correlation observed between demographic profile and score'
      ],
      'in order to': [
        'address the research questions formulated in chapter one',
        'ensure the validity and reliability of the research instrument',
        'determine the precise sample size required for this study'
      ],
      'in light of': [
        'the empirical evidence presented in this chapter',
        'these findings, the following recommendations are proffered',
        'the observed limitations, caution is advised in generalizing results'
      ],
      'in conclusion': [
        'the gathered empirical data substantiates the research hypothesis',
        'the findings provide crucial evidence for targeted educational interventions'
      ],
      'it is recommended': [
        'that school administrators and subject teachers collaborate to design support programs',
        'that future researchers replicate this study with a larger longitudinal sample'
      ],
      'data was': [
        'collected utilizing a standardized 4-point Likert scale questionnaire',
        'analyzed using descriptive statistics and Pearson correlation coefficient',
        'gathered with strict adherence to ethical standards and informed consent'
      ],
      'the purpose of': [
        'this study is to investigate the relationship between blended learning and engagement',
        'this research is to determine the significant differences among student demographics'
      ],
      'table 1': [
        'presents the demographic profile and frequency distribution of the respondents',
        'illustrates the distribution of participants across academic strands'
      ],
      'table 2': [
        'summarizes the computed mean scores and verbal interpretations',
        'displays the statistical summary of student responses per indicator'
      ],
      'table 3': [
        'displays the correlation matrix and level of statistical significance',
        'presents the t-test results comparing pre-test and post-test scores'
      ]
    };

    // Check last two words then last word
    const matchedContinuations = continuationMap[lastTwoWords] || continuationMap[lastWord];
    if (matchedContinuations && matchedContinuations.length > 0) {
      const best = matchedContinuations[0];
      return {
        suggestedCompletion: best,
        ghostSuffix: best,
        replacementStart: cursorPos,
        confidence: 0.85,
        category: 'continuation',
        alternatives: matchedContinuations,
        hint: 'NEXT-PHRASE PREDICTION'
      };
    }
  }

  // -------------------------------------------------------------
  // STRATEGY 5: Accurate Academic Vocabulary & Term Completion
  // -------------------------------------------------------------
  if (trailingWord && trailingWord.length >= 2 && !endsWithSpace) {
    const lowerTrailing = trailingWord.toLowerCase();

    // 1. Search vocabulary dictionary
    const vocabMatches = ACADEMIC_VOCABULARY.filter(word => {
      const lower = word.toLowerCase();
      return lower.startsWith(lowerTrailing) && lower !== lowerTrailing;
    });

    // 2. Also search stems for multi-word phrases starting with this word
    const phrasalMatches = scoredStems.filter(stem => {
      const lower = stem.text.toLowerCase();
      return lower.startsWith(lowerTrailing) && lower !== lowerTrailing;
    });

    if (vocabMatches.length > 0 || phrasalMatches.length > 0) {
      // Pick best match: prefer vocabulary if word is short, or stem if context fits
      const bestWord = vocabMatches[0];
      const bestPhrase = phrasalMatches[0]?.text;
      
      // Determine candidate
      const candidate = bestWord || bestPhrase;
      if (candidate) {
        const isCapitalized = trailingWord[0] === trailingWord[0].toUpperCase();
        const formatted = isCapitalized ? candidate[0].toUpperCase() + candidate.slice(1) : candidate;
        const ghostSuffix = formatted.slice(trailingWord.length);

        if (ghostSuffix.trim().length > 0) {
          const wordOffset = textBeforeCursor.length - trailingWord.length;
          const allAlternatives = [
            ...vocabMatches.slice(0, 3),
            ...phrasalMatches.slice(0, 2).map(p => p.text)
          ].filter(Boolean);

          return {
            suggestedCompletion: formatted,
            ghostSuffix,
            replacementStart: wordOffset,
            confidence: 0.82,
            category: 'vocabulary',
            alternatives: allAlternatives,
            hint: bestWord ? 'ACADEMIC VOCABULARY' : 'RESEARCH PHRASE'
          };
        }
      }
    }
  }

  return null;
}
