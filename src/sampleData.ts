/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Assignment, Paper, Source, CompetencyMapping, ExpertValidation, Rubric } from './types';

export const DEMO_STUDENT = {
  id: 'student-1',
  name: 'Alex Marasigan',
  email: 'student@writewise.demo',
  role: 'student' as const,
  track: 'foundational' as const,
  classId: 'class-g11'
};

export const DEMO_TEACHER = {
  id: 'teacher-1',
  name: 'Mrs. Maria Santos',
  email: 'teacher@writewise.demo',
  role: 'teacher' as const,
  classId: 'class-g11'
};

export const DEFAULT_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign-1',
    title: 'Grade 11 Practical Research Paper',
    description: 'A formal quantitative/qualitative inquiry paper exploring modern socio-cultural or technological phenomena in local Philippine communities.',
    dueDate: '2026-10-30',
    requiredSections: [
      'Title',
      'Introduction',
      'Research Problem',
      'Research Questions',
      'Thesis/Central Claim',
      'Review of Related Literature',
      'Main Discussion/Arguments',
      'Evidence',
      'Counterargument',
      'Conclusion',
      'References'
    ],
    trackSettings: {
      allowStudentTrackChange: false
    },
    aiAssistancePolicy: 'guided'
  }
];

export const DEFAULT_RUBRIC: Rubric = {
  id: 'rubric-1',
  assignmentId: 'assign-1',
  criteria: [
    {
      id: 'crit-org',
      name: 'Organization & Structure',
      description: 'Logical sequencing of sections, transitions, and adherence to the academic format.',
      levels: {
        beginning: 'Disorganized; ideas do not flow logically; sections are misplaced or missing.',
        developing: 'Some structural order is present, but sections lack fluid transitions.',
        proficient: 'Structure is clear, logical, and appropriate; headings structure the paper well.',
        advanced: 'Masterful organizational flow; ideas transition seamlessly; headings are used effectively.'
      }
    },
    {
      id: 'crit-coh',
      name: 'Coherence & Cohesion',
      description: 'The internal logical connection of claims, paragraph unity, and structural unity.',
      levels: {
        beginning: 'Paragraphs are fragmented and unconnected; thoughts are hard to follow.',
        developing: 'Basic connections exist but cohesion is superficial; repetitive transition words.',
        proficient: 'Consistent paragraph unity; clear relationships between paragraphs and main claims.',
        advanced: 'Flawless cohesion; sophisticated stylistic transitions; clear, unified academic prose.'
      }
    },
    {
      id: 'crit-thesis',
      name: 'Thesis & Central Claim',
      description: 'Clarity, specificity, and positioning of the central academic argument.',
      levels: {
        beginning: 'Thesis is missing, vague, or merely states a broad topic without a clear stance.',
        developing: 'Thesis is identifiable but too broad, or represents a simple factual summary.',
        proficient: 'Thesis is clear, arguable, and specific, setting up the paper’s structure.',
        advanced: 'Thesis is highly original, nuanced, precise, and consistently defended throughout.'
      }
    },
    {
      id: 'crit-evidence',
      name: 'Evidence & Integration',
      description: 'Use of high-quality primary or secondary sources and their integration into paragraphs.',
      levels: {
        beginning: 'Claims are made without evidence, or sources are unrelated to the arguments.',
        developing: 'Evidence is dropped into paragraphs without adequate explanation or framing.',
        proficient: 'Relevant evidence is integrated with analysis explaining its connection to claims.',
        advanced: 'Meticulous evidence selection; evidence is beautifully synthesized and critiqued.'
      }
    },
    {
      id: 'crit-cite',
      name: 'Citation & Citation Style',
      description: 'Adherence to standard formatting (APA/MLA) and avoidance of plagiarism.',
      levels: {
        beginning: 'No citations provided or consistent failure to credit sources.',
        developing: 'Inconsistent citation styling or minor formatting errors in in-text/references.',
        proficient: 'Correct in-text and bibliographic citations following guidelines.',
        advanced: 'Flawless academic citation; exceptional research ethics and source accountability.'
      }
    },
    {
      id: 'crit-orig',
      name: 'Originality & Academic Honesty',
      description: 'Expression of original student voice, avoiding plagiarism or copy-paste slop.',
      levels: {
        beginning: 'Extensive verbatim matches; failure to synthesize in student’s own voice.',
        developing: 'Heavy reliance on source wording; mechanical paraphrasing without deep understanding.',
        proficient: 'Ideas are synthesized in the student’s own voice; clear distinction between student and sources.',
        advanced: 'Highly original synthesis; excellent critical insight; impeccable scholastic voice.'
      }
    }
  ]
};

export const DEFAULT_COMPETENCIES: CompetencyMapping[] = [
  {
    id: 'comp-1',
    competency: 'Formulate clearly statement of research problem (CS_RS11-IIIc-m-3)',
    activity: 'Research Problem Drafting',
    scaffold: 'Problem context framework instructions & template',
    evidence: 'Student-formulated background and statement of the problem',
    criterion: 'Thesis & Central Claim'
  },
  {
    id: 'comp-2',
    competency: 'Formulate clearly research questions (CS_RS11-IIIc-m-4)',
    activity: 'Research Questions Section',
    scaffold: 'Question refinement questions (Feasible, Clear, Significant)',
    evidence: 'Specific, clear, researchable questions drafted',
    criterion: 'Organization & Structure'
  },
  {
    id: 'comp-3',
    competency: 'Write a coherent review of related literature (CS_RS11-IIIf-j-6)',
    activity: 'Review of Related Literature',
    scaffold: 'Evidence synthesis prompt (comparing Sources A and B)',
    evidence: 'Synthesized thematic paragraphs with source comparisons',
    criterion: 'Coherence & Cohesion'
  },
  {
    id: 'comp-4',
    competency: 'Cite related literature using standard styles (CS_RS11-IIIe-5)',
    activity: 'References & Citations',
    scaffold: 'APA in-text citation examples and check guide',
    evidence: 'In-text citations and reference list entries',
    criterion: 'Citation & Citation Style'
  }
];

export const DEFAULT_VALIDATIONS: ExpertValidation[] = [
  {
    id: 'val-1',
    expertName: 'Dr. Evelyn Ramos (DepEd Curriculum Specialist)',
    date: '2026-08-15',
    ratings: {
      curriculumAlignment: 5,
      contentValidity: 5,
      scaffoldingQuality: 4,
      aiBehavior: 5,
      suggestionQuality: 4,
      usability: 5,
      technicalFunctionality: 4,
      originalityIndicator: 5
    },
    comments: 'Excellent alignment with Grade 11 Practical Research 1 & 2 guidelines. The "What to Do Next" panel successfully prevents generative dependency. Suggest adding more localized Filipino templates in the foundational track.',
    recommendations: 'Integrate the DepEd competency codes explicitly inside the teacher analytics panel.',
    status: 'validated'
  },
  {
    id: 'val-2',
    expertName: 'Prof. Juan Dela Cruz (Senior Writing Instructor)',
    date: '2026-09-10',
    ratings: {
      curriculumAlignment: 4,
      contentValidity: 5,
      scaffoldingQuality: 5,
      aiBehavior: 5,
      suggestionQuality: 5,
      usability: 4,
      technicalFunctionality: 5,
      originalityIndicator: 4
    },
    comments: 'The autocomplete suggestions are perfectly capped at 1-3 words, which is highly appropriate for secondary learners who are easily tempted to copy-paste. The distinction between actual process indicators and AI-detection claims is ethically sound.',
    recommendations: 'Allow teachers to manually adjust student tracks directly from the student roster table.',
    status: 'validated'
  }
];

export const INITIAL_PAPERS: Paper[] = [
  {
    id: 'paper-1',
    studentId: 'student-1',
    studentName: 'Alex Marasigan',
    studentGrade: 'Grade 11',
    studentSection: 'STEM A',
    grade: '',
    title: 'The Effects of Social Media on Student Learning',
    assignmentId: 'assign-1',
    progress: 78,
    track: 'foundational',
    reflectionCompleted: false,
    preSurvey: {
      writingSelfEfficacy: 3.1,
      aiReliance: 3.9,
      originalityAttitudes: 3.0,
      answers: {
        efficacy_1: 3,
        efficacy_2: 3,
        efficacy_3: 3,
        efficacy_4: 4,
        ai_1: 4,
        ai_2: 4,
        ai_3: 4,
        ai_4: 3,
        orig_1: 3,
        orig_2: 3,
        orig_3: 3
      }
    },
    sections: [
      {
        id: 'sec-title',
        title: 'Title',
        description: 'Create a clear, concise title indicating variables and the study population.',
        foundationalScaffold: 'Sentence Starter: "The Impact of [Variable A] on [Variable B] among [Target Group]"',
        advancedScaffold: 'Draft a title specifying variables, relationship, and context in under 15 words.',
        status: 'completed',
        content: 'The Effects of Social Media Usage on the Academic Performance of Grade 11 Students in Manila High School',
        wordCount: 19,
        wordPredictionsAccepted: 1,
        aiFeedbackRequests: 1,
        revisionCount: 2,
        pastedContentDetected: false,
        lastSavedAt: '2026-09-21T10:00:00'
      },
      {
        id: 'sec-intro',
        title: 'Introduction',
        description: 'Set the stage for your research. State the broad topic and its significance.',
        foundationalScaffold: 'Structure template:\n- Grab attention (e.g., "In the contemporary digital era...")\n- Define key terms (e.g., "Social media is defined as...")\n- Connect to students (e.g., "For Grade 11 learners, this serves as...")',
        advancedScaffold: 'Synthesize the historical rise of digital platforms and introduce the specific context of secondary education.',
        status: 'completed',
        content: 'In the contemporary digital era, social media has become an inseparable part of student life. Almost every high school learner in urban areas holds active accounts on platforms like Facebook, TikTok, and Instagram. While these platforms offer educational resources and rapid peer communication, they also present substantial distractions that can lead to academic neglect. Understanding this dual nature is crucial for educational stakeholders.',
        wordCount: 68,
        wordPredictionsAccepted: 4,
        aiFeedbackRequests: 2,
        revisionCount: 3,
        pastedContentDetected: false,
        lastSavedAt: '2026-09-22T11:30:00'
      },
      {
        id: 'sec-problem',
        title: 'Research Problem',
        description: 'Clearly articulate the specific gap in knowledge or social issue that your paper addresses.',
        foundationalScaffold: 'Use this frame:\n"While previous research has focused on [broad topic], there remains a gap regarding how [specific variable] affects [population] in the context of [local situation]. This study addresses this because..."',
        advancedScaffold: 'Identify a theoretical conflict or empirical inconsistency in literature regarding social media usage and study habits.',
        status: 'completed',
        content: 'While previous international research has extensively documented the overall psychological consequences of screen time, there remains a critical gap in localized research regarding how multi-platform switching directly affects the self-regulated study habits of Grade 11 students in public high schools in Manila. This study directly addresses this localized issue to inform academic guidelines.',
        wordCount: 56,
        wordPredictionsAccepted: 3,
        aiFeedbackRequests: 1,
        revisionCount: 2,
        pastedContentDetected: false,
        lastSavedAt: '2026-09-22T14:15:00'
      },
      {
        id: 'sec-questions',
        title: 'Research Questions',
        description: 'Provide the specific questions that your study aims to answer.',
        foundationalScaffold: 'List 3 specific questions:\n1. "What is the profile of..."\n2. "How does..."\n3. "Is there a significant relationship between..."',
        advancedScaffold: 'Develop sub-questions mapping your central variables to behavioral metrics and performance outcomes.',
        status: 'completed',
        content: 'This study aims to answer the following questions:\n1. What is the frequency and average daily duration of social media usage among Grade 11 students?\n2. How do students perceive the effect of notifications on their homework completion?\n3. Is there a measurable correlation between social media use during study hours and general average grades?',
        wordCount: 52,
        wordPredictionsAccepted: 2,
        aiFeedbackRequests: 2,
        revisionCount: 2,
        pastedContentDetected: false,
        lastSavedAt: '2026-09-23T09:00:00'
      },
      {
        id: 'sec-thesis',
        title: 'Thesis/Central Claim',
        description: 'Formulate the central, arguable stance of your research paper.',
        foundationalScaffold: 'Fill in this structure:\n"Although [concession], this paper argues that [your primary claim] because [reason A] and [reason B]."',
        advancedScaffold: 'Draft a complex, conditional thesis statement that encapsulates your empirical hypothesis and structural argument.',
        status: 'completed',
        content: 'Although social media platforms facilitate rapid information exchange and collaborative study circles, this paper argues that unmonitored excessive usage significantly degrades academic outcomes by fracturing students attention spans and encouraging sleep deprivation.',
        wordCount: 34,
        wordPredictionsAccepted: 1,
        aiFeedbackRequests: 2,
        revisionCount: 1,
        pastedContentDetected: false,
        lastSavedAt: '2026-09-23T11:10:00'
      },
      {
        id: 'sec-litreview',
        title: 'Review of Related Literature',
        description: 'Synthesize findings from existing research to contextualize your claim.',
        foundationalScaffold: 'Synthesis Guide:\n- Paragraph 1: Group studies on positive effects (e.g., "According to Cruz (2024), social media can...")\n- Paragraph 2: Group studies on negative distractions (e.g., "Conversely, Santos (2025) found that...")\n- Paragraph 3: Connect these ideas together (e.g., "In synthesis, these researchers show that...")',
        advancedScaffold: 'Contrast differing methodological frameworks in local scholarship regarding distraction index and academic burnout.',
        status: 'needs_revision',
        content: 'Many local scholars have investigated digital habits in the Philippines. Cruz (2024) asserts that online academic groups help learners share notes. However, Santos (2025) found that 82% of students study while checking Facebook notifications. This leads to what Santos calls cognitive fragmentation. Another study by Dela Cruz (2023) supports this by showing that screen time after 10 PM is linked to lower attention spans the following morning in school. I think social media is bad but has some good sides.',
        wordCount: 88,
        wordPredictionsAccepted: 4,
        aiFeedbackRequests: 3,
        revisionCount: 3,
        pastedContentDetected: false,
        lastSavedAt: '2026-09-23T15:20:00'
      },
      {
        id: 'sec-arguments',
        title: 'Main Discussion/Arguments',
        description: 'Develop your arguments step-by-step to support your thesis.',
        foundationalScaffold: 'For each main point, write:\n- Point (Claim): "First, excessive screen time leads to..."\n- Explanation: "When students do this, they..."\n- Connect: "Therefore, this demonstrates that..."',
        advancedScaffold: 'Develop a cohesive progression of paragraphs, each exploring a specific dimension of attention fracturing or habitual study degradation.',
        status: 'not_started',
        content: '',
        wordCount: 0,
        wordPredictionsAccepted: 0,
        aiFeedbackRequests: 0,
        revisionCount: 0,
        pastedContentDetected: false,
        lastSavedAt: ''
      },
      {
        id: 'sec-evidence',
        title: 'Evidence',
        description: 'Integrate concrete statistics, survey findings, or expert quotes to substantiate your claims.',
        foundationalScaffold: 'How to introduce evidence:\n- "As demonstrated in the survey, [X] percent of..."\n- "According to academic research, [quote]..."\n- "This data indicates that..."',
        advancedScaffold: 'Systematically present and critique primary quantitative/qualitative data points, maintaining a high academic tone.',
        status: 'not_started',
        content: '',
        wordCount: 0,
        wordPredictionsAccepted: 0,
        aiFeedbackRequests: 0,
        revisionCount: 0,
        pastedContentDetected: false,
        lastSavedAt: ''
      },
      {
        id: 'sec-counter',
        title: 'Counterargument',
        description: 'Address and respectfully rebut opposing views or alternative explanations.',
        foundationalScaffold: 'Address opposition:\n- "Critics might argue that social media..."\n- "While this counter-point has some merit, it fails to account for..."\n- "Thus, the primary argument remains strong because..."',
        advancedScaffold: 'Acknowledge the learning affordances of digital collaboration networks, then synthesize why self-regulation failures eclipse these affordances.',
        status: 'not_started',
        content: '',
        wordCount: 0,
        wordPredictionsAccepted: 0,
        aiFeedbackRequests: 0,
        revisionCount: 0,
        pastedContentDetected: false,
        lastSavedAt: ''
      },
      {
        id: 'sec-conclusion',
        title: 'Conclusion',
        description: 'Summarize your main arguments, restate your thesis in a new way, and state implications.',
        foundationalScaffold: 'Conclusion Template:\n- Restate thesis: "In conclusion, this paper has shown that..."\n- Summarize arguments: "Through examining distraction rates and sleep..."\n- Final call to action: "Educators and parents must..."',
        advancedScaffold: 'Synthesize the broader academic implications of your findings and suggest specific directions for future policy intervention.',
        status: 'not_started',
        content: '',
        wordCount: 0,
        wordPredictionsAccepted: 0,
        aiFeedbackRequests: 0,
        revisionCount: 0,
        pastedContentDetected: false,
        lastSavedAt: ''
      },
      {
        id: 'sec-references',
        title: 'References',
        description: 'Provide an alphabetical list of all sources cited in APA or MLA format.',
        foundationalScaffold: 'APA Reference Examples:\n- Book: Author, A. A. (Year). Title. Publisher.\n- Journal: Author, B. B. (Year). Article Title. Journal Name, Vol(No), Page-Page.',
        advancedScaffold: 'Ensure all references have complete DOI indices and are listed in alphabetical order strictly following APA 7th edition guidelines.',
        status: 'not_started',
        content: '',
        wordCount: 0,
        wordPredictionsAccepted: 0,
        aiFeedbackRequests: 0,
        revisionCount: 0,
        pastedContentDetected: false,
        lastSavedAt: ''
      }
    ],
    draftHistory: [
      {
        id: 'df-1',
        sectionId: 'sec-litreview',
        content: 'I think social media is bad for students because it makes them study less. Some papers say that Cruz (2024) believes social media is useful but Santos (2025) says notifications distract students. That makes sense.',
        wordCount: 35,
        timestamp: '2026-09-23T11:00:00',
        feedbackSummary: 'This draft is short and informal. It relies heavily on conversational language rather than formal academic tone.',
        processMetrics: {
          studentDrafting: 'MODERATE',
          wordSuggestionsAccepted: 'LOW',
          feedbackRequests: 'LOW',
          directAIGeneration: 'NONE RECORDED'
        }
      },
      {
        id: 'df-2',
        sectionId: 'sec-litreview',
        content: 'Many local scholars have investigated digital habits. Cruz (2024) asserts that online academic groups help learners share notes. However, Santos (2025) found that 82% of students study while checking Facebook notifications. This leads to what Santos calls cognitive fragmentation. I think social media is bad but has some good sides.',
        wordCount: 52,
        timestamp: '2026-09-23T14:30:00',
        feedbackSummary: 'Good progress. Synthesizing multiple sources is improved, but you still include conversational expressions ("I think") in the final sentence, which weakens the formal academic tone.',
        processMetrics: {
          studentDrafting: 'HIGH',
          wordSuggestionsAccepted: 'MODERATE',
          feedbackRequests: 'MODERATE',
          directAIGeneration: 'NONE RECORDED'
        }
      }
    ]
  },
  {
    id: 'paper-2',
    studentId: 'student-2',
    studentName: 'Sarah Javier',
    studentSection: 'Grade 11 - HUMSS B',
    grade: 94,
    title: 'An Analysis of Street Vendor Livelihoods in Quiapo',
    assignmentId: 'assign-1',
    progress: 100,
    track: 'advanced',
    reflectionCompleted: true,
    preSurvey: {
      writingSelfEfficacy: 3.8,
      aiReliance: 2.5,
      originalityAttitudes: 4.1,
      answers: {}
    },
    postSurvey: {
      writingSelfEfficacy: 4.5,
      aiReliance: 1.8,
      originalityAttitudes: 4.8,
      answers: {}
    },
    sections: [
      {
        id: 'sec-title',
        title: 'Title',
        description: '...',
        foundationalScaffold: '...',
        advancedScaffold: '...',
        status: 'completed',
        content: 'An Analysis of Street Vendor Livelihoods in Quiapo',
        wordCount: 9,
        wordPredictionsAccepted: 1,
        aiFeedbackRequests: 1,
        revisionCount: 1,
        pastedContentDetected: false,
        lastSavedAt: '2026-09-18T10:00:00'
      }
    ],
    draftHistory: []
  }
];

export const INITIAL_SOURCES: Source[] = [
  {
    id: 'src-1',
    author: 'Cruz, J.',
    title: 'Digital Communities and Collaborative Learning in Public Schools',
    publication: 'Philippine Journal of Educational Research',
    date: '2024',
    urlOrDoi: 'https://doi.org/10.1234/pjer.2024.56',
    mainIdea: 'Facebook study groups provide peer-supported environments that enhance learning motivation.',
    evidence: 'Over 65% of surveyed high school students reported clarification of assignments through peer chats.',
    studentNotes: 'Provides the positive counter-point that collaborative learning is facilitated by social platforms.',
    credibilityNotes: 'Peer-reviewed local educational journal. Reliable sample size.',
    intendedSection: 'Review of Related Literature',
    verified: true
  },
  {
    id: 'src-2',
    author: 'Santos, M.',
    title: 'Fractured Attention: Cognitive Fragmentation in Multitasking Youth',
    publication: 'Manila Journal of Social Sciences',
    date: '2025',
    urlOrDoi: 'https://doi.org/10.1234/mjss.2025.12',
    mainIdea: 'Concurrent notification checking during active reading reduces reading comprehension rates.',
    evidence: '82% of students self-reported checking notification banners within 10 minutes of studying.',
    studentNotes: 'Key source establishing negative distraction effect and the concept of "cognitive fragmentation".',
    credibilityNotes: 'Highly cited Manila-based research institute. Direct experimental methodology.',
    intendedSection: 'Review of Related Literature',
    verified: true
  },
  {
    id: 'src-3',
    author: 'Dela Cruz, R.',
    title: 'Sleep Interruption and Cognitive Performance in High School Learners',
    publication: 'Philippine Pediatric Health Quarterly',
    date: '2023',
    urlOrDoi: 'https://doi.org/10.1234/pphq.2023.09',
    mainIdea: 'Late-night blue light exposure from mobile scrolling correlates with next-day attention deficits.',
    evidence: 'High school students scrolling past 10 PM exhibited a 14% decrease in working memory tasks.',
    studentNotes: 'Links physical cell phone habits to academic focus and sleep problems.',
    credibilityNotes: 'Medical journal. Strict empirical standards.',
    intendedSection: 'Review of Related Literature',
    verified: true
  },
  {
    id: 'src-4',
    author: 'AI Writing Assistant (Generated Idea)',
    title: 'The Role of Gamified Social Applications on Learning Retention',
    publication: 'Global Technology Review (AI Suggested)',
    date: '2026',
    urlOrDoi: 'https://example-unverified-journal.org/gamified',
    mainIdea: 'Gamification increases retention of historical dates and vocabulary in Grade 11 classes.',
    evidence: 'Gamified interfaces show a 20% increase in short term active recall scores.',
    studentNotes: 'AI suggested this. I need to verify whether this journal exists or if it was hallucinated.',
    credibilityNotes: 'UNVERIFIED. Appears to be suggested by generative prompt. No active DOI found.',
    intendedSection: 'Review of Related Literature',
    isAiSuggested: true,
    verified: false
  }
];

export const OTHER_STUDENTS = [
  {
    id: 'student-2',
    name: 'Sarah Javier',
    track: 'advanced' as const,
    currentAssignment: 'Grade 11 Practical Research Paper',
    progress: 100,
    currentNeed: 'None - Paper Completed',
    lastActivity: 'Yesterday',
    selfEfficacy: 4.5,
    aiAssistance: 'LOW',
    revisions: 11
  },
  {
    id: 'student-3',
    name: 'Miguel De Leon',
    track: 'foundational' as const,
    currentAssignment: 'Grade 11 Practical Research Paper',
    progress: 55,
    currentNeed: 'Synthesizing evidence in section 7',
    lastActivity: '3 hours ago',
    selfEfficacy: 3.2,
    aiAssistance: 'MODERATE',
    revisions: 19
  },
  {
    id: 'student-4',
    name: 'Patricia Lim',
    track: 'advanced' as const,
    currentAssignment: 'Grade 11 Practical Research Paper',
    progress: 82,
    currentNeed: 'Strengthening thesis claim specificity',
    lastActivity: 'Today',
    selfEfficacy: 3.9,
    aiAssistance: 'LOW',
    revisions: 8
  },
  {
    id: 'student-5',
    name: 'Joshua Alcantara',
    track: 'foundational' as const,
    currentAssignment: 'Grade 11 Practical Research Paper',
    progress: 30,
    currentNeed: 'Refining research questions formulation',
    lastActivity: '2 days ago',
    selfEfficacy: 2.8,
    aiAssistance: 'HIGH',
    revisions: 5
  }
];
