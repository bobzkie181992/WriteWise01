/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useWriteWise } from '../WriteWiseContext';
import { 
  PlusCircle, Search, Trash, Check, CheckCircle2, ShieldAlert, BookOpen, 
  AlertCircle, Bookmark, Table, Cpu, Sparkles, Copy, RefreshCw, FileText
} from 'lucide-react';
import { IntelligentAutocomplete } from './IntelligentAutocomplete';

export const ResearchSources: React.FC = () => {
  const { state, addSource, verifySource, updateMatrixCell, showToast } = useWriteWise();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'sources' | 'matrix' | 'generator'>('sources');

  const paper = state.papers.find(p => p.studentId === (state.currentUser?.id || 'student-1')) || state.papers[0];
  const userMatrix = paper.synthesisMatrix || [];

  // New Source Fields (Source Bank Tab)
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [publication, setPublication] = useState('');
  const [date, setDate] = useState('');
  const [urlOrDoi, setUrlOrDoi] = useState('');
  const [mainIdea, setMainIdea] = useState('');
  const [evidence, setEvidence] = useState('');
  const [studentNotes, setStudentNotes] = useState('');
  const [credibilityNotes, setCredibilityNotes] = useState('');
  const [intendedSection, setIntendedSection] = useState('Review of Related Literature');

  // New Citation Generator Fields (APA Builder Tab)
  const [genType, setGenType] = useState<'journal' | 'book' | 'website'>('journal');
  const [genAuthor, setGenAuthor] = useState('');
  const [genTitle, setGenTitle] = useState('');
  const [genPub, setGenPub] = useState('');
  const [genYear, setGenYear] = useState('');
  const [genUrl, setGenUrl] = useState('');

  // Synthesis matrix standard themes
  const MATRIX_THEMES = [
    { id: 'theme-distract', label: 'Notification & Media Distractions', desc: 'Alert notifications leading to cognitive switching and late-night social media checks.' },
    { id: 'theme-sleep', label: 'Late-Night Sleep Interruptions', desc: 'Active screen-time past 10 PM resulting in delayed sleep onset and morning attention fatigue.' },
    { id: 'theme-support', label: 'Peer Collaboration & Study Groups', desc: 'Academic utility of shared note-taking, online study communities, and instant peer support.' }
  ];

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !title) return;
    
    addSource({
      author,
      title,
      publication,
      date,
      urlOrDoi,
      mainIdea,
      evidence,
      studentNotes,
      credibilityNotes,
      intendedSection,
      verified: true
    });

    showToast('New academic source added and logged in your Source Bank!', 'success');

    // Reset Form
    setAuthor('');
    setTitle('');
    setPublication('');
    setDate('');
    setUrlOrDoi('');
    setMainIdea('');
    setEvidence('');
    setStudentNotes('');
    setCredibilityNotes('');
    setShowAddForm(false);
  };

  // APA Reference citation text builders
  const getApaBibliographyText = () => {
    const cleanAuthor = genAuthor.trim() || 'Author, A. A.';
    const cleanYear = genYear.trim() ? `(${genYear.trim()})` : '(n.d.)';
    const cleanTitle = genTitle.trim() || 'Title of research study or page article';
    const cleanPub = genPub.trim() || 'Publisher, University, or Journal Name';
    const cleanUrl = genUrl.trim() ? `. Available from ${genUrl.trim()}` : '';

    if (genType === 'journal') {
      return `${cleanAuthor} ${cleanYear}. ${cleanTitle}. ${cleanPub}${cleanUrl}.`;
    } else if (genType === 'book') {
      return `${cleanAuthor} ${cleanYear}. ${cleanTitle}. ${cleanPub}${cleanUrl}.`;
    } else {
      return `${cleanAuthor} ${cleanYear}. ${cleanTitle}. Retrieved from ${cleanPub}${genUrl.trim() ? ': ' + genUrl.trim() : ''}.`;
    }
  };

  const getApaInTextCitation = () => {
    const cleanAuthor = genAuthor.trim();
    if (!cleanAuthor) return '(Author, Year)';
    const commaIdx = cleanAuthor.indexOf(',');
    const lastName = commaIdx > 0 ? cleanAuthor.substring(0, commaIdx).trim() : cleanAuthor.split(' ')[0];
    const cleanYear = genYear.trim() || 'n.d.';
    return `(${lastName}, ${cleanYear})`;
  };

  const handleAddGeneratedSource = () => {
    if (!genAuthor || !genTitle) {
      alert('Please fill out at least Author and Title fields to add this citation.');
      return;
    }
    
    addSource({
      author: genAuthor,
      title: genTitle,
      publication: genPub || (genType === 'website' ? 'Web Publication' : 'Academic Press'),
      date: genYear || '2026',
      urlOrDoi: genUrl || 'N/A',
      mainIdea: 'Auto-constructed from APA reference citation builder.',
      evidence: '',
      studentNotes: `APA Reference: ${getApaBibliographyText()}`,
      credibilityNotes: 'Added via APA reference generator tool.',
      intendedSection: 'Review of Related Literature',
      verified: true
    });

    showToast('APA generated citation added straight to Source Bank!', 'success');

    // Reset fields
    setGenAuthor('');
    setGenTitle('');
    setGenPub('');
    setGenYear('');
    setGenUrl('');
  };

  // Copy helper
  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${type} successfully copied to clipboard!`, 'success');
  };

  const filteredSources = state.sources.filter(src => {
    const term = searchTerm.toLowerCase();
    return (
      src.title.toLowerCase().includes(term) ||
      src.author.toLowerCase().includes(term) ||
      src.intendedSection.toLowerCase().includes(term)
    );
  });

  // Theme checking status for Matrix
  const isCellChecked = (rowSourceId: string, columnTheme: string) => {
    return userMatrix.some(cell => cell.rowSourceId === rowSourceId && cell.columnTheme === columnTheme && cell.active);
  };

  const toggleCell = (rowSourceId: string, columnTheme: string) => {
    const currentlyActive = isCellChecked(rowSourceId, columnTheme);
    updateMatrixCell(paper.studentId, rowSourceId, columnTheme, !currentlyActive);
  };

  // Live Synthesized Paragraph Planner Generator
  const generateSynthesisParagraph = () => {
    // Collect checked sources for notification distractions
    const distractCites = state.sources.filter(s => isCellChecked(s.id, 'theme-distract'));
    const sleepCites = state.sources.filter(s => isCellChecked(s.id, 'theme-sleep'));
    const supportCites = state.sources.filter(s => isCellChecked(s.id, 'theme-support'));

    if (distractCites.length === 0 && sleepCites.length === 0 && supportCites.length === 0) {
      return "Start checking boxes in the matrix above to map which sources correspond to each theme. Once checked, WriteWise will compile a localized synthesis roadmap for you here!";
    }

    let synthesisText = "";

    if (distractCites.length > 0) {
      const citeNames = distractCites.map(s => {
        const commaIdx = s.author.indexOf(',');
        const lName = commaIdx > 0 ? s.author.substring(0, commaIdx).trim() : s.author.split(' ')[0];
        return `${lName} (${s.date})`;
      }).join(' and ');
      synthesisText += `Regarding notification and social media distractions, scholars like ${citeNames} heavily emphasize that constant incoming alerts disrupt high school student workflows, fracturing attention and dividing focus. `;
    }

    if (sleepCites.length > 0) {
      const citeNames = sleepCites.map(s => {
        const commaIdx = s.author.indexOf(',');
        const lName = commaIdx > 0 ? s.author.substring(0, commaIdx).trim() : s.author.split(' ')[0];
        return `${lName} (${s.date})`;
      }).join(', and supported by ');
      synthesisText += `This disruption extends past study hours into sleep cycles; late-night screen time has been explicitly documented by ${citeNames} as a primary source of delayed sleep onset and subsequent morning cognitive fatigue among secondary students. `;
    }

    if (supportCites.length > 0) {
      const citeNames = supportCites.map(s => {
        const commaIdx = s.author.indexOf(',');
        const lName = commaIdx > 0 ? s.author.substring(0, commaIdx).trim() : s.author.split(' ')[0];
        return `${lName} (${s.date})`;
      }).join(' and ');
      synthesisText += `Conversely, social media holds valuable scholastic opportunities when used constructively; ${citeNames} highlights that active online peer communities offer essential avenues for file sharing, collaborative study circles, and peer-to-peer reassurance. `;
    }

    synthesisText += `In synthesis, while these digital networks provide robust collaborative benefits, educational policy must address notification fatigue and sleep health to optimize overall Grade 11 learning outcomes.`;

    return synthesisText;
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Tab Header Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Research Workspace</span>
            <h2 className="text-xl font-bold font-serif text-slate-900">Academic Literature & Synthesis Desk</h2>
            <p className="text-xs text-slate-500 font-sans">Organize references, verify citations, map thematic synthesis matrices, and generate perfect APA 7th bibliography files.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-2 bg-[#17365D] hover:bg-[#112643] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="h-4 w-4" /> Add Custom Source
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('sources')}
            className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'sources' ? 'border-[#1F8A8A] text-[#1F8A8A]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Bookmark className="h-4 w-4" /> Source Bank & Log ({state.sources.length})
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'matrix' ? 'border-[#1F8A8A] text-[#1F8A8A]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Table className="h-4 w-4" /> Synthesis Matrix (RRL Themes)
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'generator' ? 'border-[#1F8A8A] text-[#1F8A8A]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Cpu className="h-4 w-4" /> APA Citation Machine
          </button>
        </div>
      </div>

      {/* Adding custom source inline form */}
      {showAddForm && (
        <form onSubmit={handleAddSource} className="bg-white p-6 rounded-xl border border-[#17365D]/20 shadow-sm space-y-4 text-xs font-sans animate-fade-in">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold text-sm text-[#17365D] font-serif">Add Academic Source Reference</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Record correct citation metadata to automatically generate APA bibliography lists.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 uppercase">Author(s) (Lastname, Initials)</label>
              <input
                required
                type="text"
                placeholder="e.g., Santos, M., & Ramos, E."
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 uppercase">Publication Year</label>
              <input
                required
                type="text"
                placeholder="e.g., 2025"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 uppercase">Intended Section</label>
              <select
                value={intendedSection}
                onChange={(e) => setIntendedSection(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-[#1F8A8A] cursor-pointer"
              >
                <option value="Introduction">Introduction</option>
                <option value="Research Problem">Research Problem</option>
                <option value="Review of Related Literature">Review of Related Literature</option>
                <option value="Main Discussion/Arguments">Main Discussion/Arguments</option>
                <option value="Evidence">Evidence</option>
                <option value="Conclusion">Conclusion</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 uppercase">Article / Source Title</label>
              <input
                required
                type="text"
                placeholder="e.g., Fractured Attention: Cognitive Fragmentation in Multitasking Youth"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 uppercase">Journal / Publisher Name</label>
              <input
                required
                type="text"
                placeholder="e.g., Manila Journal of Social Sciences"
                value={publication}
                onChange={(e) => setPublication(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-600 uppercase">URL or DOI link</label>
            <input
              type="text"
              placeholder="e.g., https://doi.org/10.1234/mjss.2025"
              value={urlOrDoi}
              onChange={(e) => setUrlOrDoi(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 uppercase">Main Scholarly Thesis / Argument</label>
              <textarea
                placeholder="What is the primary conclusion of this research?"
                value={mainIdea}
                onChange={(e) => setMainIdea(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A] min-h-[50px]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 uppercase">Concrete Evidence / Statistics</label>
              <textarea
                placeholder="Record exact statistical claims or findings (e.g. 82% distraction rate...)"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A] min-h-[50px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 uppercase">My Synthesis Notes</label>
              <textarea
                placeholder="How does this relate to your paper’s argument?"
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A] min-h-[50px]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 uppercase">Credibility Assessment (Peer-review review)</label>
              <textarea
                placeholder="Is this source peer-reviewed? What are the credentials of the publisher?"
                value={credibilityNotes}
                onChange={(e) => setCredibilityNotes(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A] min-h-[50px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#17365D] text-white rounded-lg font-semibold hover:bg-[#112643]"
            >
              Save Source
            </button>
          </div>
        </form>
      )}

      {/* TAB 1: Source Bank & Log */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Search className="h-3.5 w-3.5 text-[#17365D]" />
                Intelligent Source Search & Filter
              </span>
              <span className="text-[10px] text-slate-400">
                {filteredSources.length} of {state.sources.length} sources matching
              </span>
            </div>
            <IntelligentAutocomplete
              value={searchTerm}
              onChange={setSearchTerm}
              predefinedList={Array.from(new Set([
                ...state.sources.map(s => s.author),
                ...state.sources.map(s => s.title),
                ...state.sources.map(s => s.intendedSection),
                'Cruz', 'Santos', 'Dela Cruz', 'Social media', 'Sleep deprivation', 'Blended learning', 'Academic performance'
              ])).filter(Boolean)}
              placeholder="Search sources by author, keyword, or section (press Tab to accept)..."
              showAlternativesList={false}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSources.map((src) => (
              <div 
                key={src.id} 
                className={`bg-white rounded-xl border shadow-sm p-5 space-y-4 flex flex-col justify-between ${src.isAiSuggested && !src.verified ? 'border-[#F4B942]/60 bg-amber-50/5' : 'border-slate-200'}`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Section: {src.intendedSection}
                    </span>

                    {src.isAiSuggested ? (
                      !src.verified ? (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 border border-amber-100 rounded text-[9px] font-bold text-[#D98E04]">
                          <ShieldAlert className="h-3 w-3" /> AI SUGGESTED
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 border border-green-100 rounded text-[9px] font-bold text-green-700">
                          <Check className="h-3 w-3" /> VERIFIED BY USER
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-sky-50 text-sky-800 rounded text-[9px] font-bold uppercase tracking-wider border border-sky-100">
                        ✓ Verified Academic
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-sm font-serif">{src.title}</h3>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5 font-medium">
                      By {src.author} ({src.date}) · <span className="italic">{src.publication}</span>
                    </p>
                  </div>

                  {src.isAiSuggested && !src.verified && (
                    <div className="p-3 bg-amber-50/60 border border-amber-200/50 rounded-lg text-[10px] text-[#D98E04] leading-relaxed flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>AI-suggested source — verify before use.</strong>
                        <p className="mt-0.5 text-slate-600">This citation was suggested by the drafting assistant. Please verify that this study exists in actual academic journals before citing it in your final paper.</p>
                        <button
                          onClick={() => {
                            verifySource(src.id, true);
                            showToast('Citation verified by candidate!', 'success');
                          }}
                          className="mt-2 px-2.5 py-1 bg-[#D98E04] text-white font-bold rounded hover:bg-[#b07302] transition-colors"
                        >
                          Confirm Source Exists & Mark Verified
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 text-[11px] pt-3 border-t border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-400 block uppercase text-[9px]">Main Finding:</span>
                      <p className="text-slate-700 font-sans leading-normal mt-0.5">{src.mainIdea}</p>
                    </div>
                    {src.evidence && (
                      <div>
                        <span className="font-semibold text-slate-400 block uppercase text-[9px]">Empirical Evidence / Stats:</span>
                        <p className="text-slate-700 font-sans leading-normal mt-0.5">{src.evidence}</p>
                      </div>
                    )}
                    {src.studentNotes && (
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                        <span className="font-bold text-slate-600 block uppercase text-[9px]">My Study Notes:</span>
                        <p className="text-slate-600 font-sans leading-normal mt-0.5">{src.studentNotes}</p>
                      </div>
                    )}
                    {src.credibilityNotes && (
                      <div className="text-slate-500">
                        <span className="font-semibold text-slate-400 block uppercase text-[9px]">Credibility Review:</span>
                        <p className="italic font-sans leading-normal mt-0.5">{src.credibilityNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-sans mt-3">
                  <span className="font-mono">DOI / URL: {src.urlOrDoi || 'N/A'}</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Bookmark className="h-3.5 w-3.5 text-[#17365D]" /> Citations saved
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Interactive Literature Synthesis Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-1 text-sm font-serif">
              <Table className="h-4 w-4 text-[#1F8A8A]" /> Interactive Literature Synthesis Matrix
            </h3>
            <p className="text-slate-500 leading-normal">
              Map and group saved literature references against central research themes of the RRL draft. Check the intersecting cell boxes where an author provides evidence supporting that theme. WriteWise will synthesize a draft paragraph structure below based on your active checks.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                  <th className="p-4 w-1/4">Academic Source / Author</th>
                  {MATRIX_THEMES.map(theme => (
                    <th key={theme.id} className="p-4 text-center w-1/4">
                      <div className="space-y-1">
                        <span className="block text-slate-700 text-[10px]">{theme.label}</span>
                        <span className="block text-[8px] font-normal text-slate-400 capitalize max-w-[150px] mx-auto leading-tight">
                          {theme.desc}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                {state.sources.filter(s => s.verified).map((src) => (
                  <tr key={src.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-slate-800 block">{src.author} ({src.date})</span>
                        <span className="text-[10px] text-slate-500 italic block mt-0.5 line-clamp-1">{src.title}</span>
                      </div>
                    </td>
                    {MATRIX_THEMES.map(theme => {
                      const checked = isCellChecked(src.id, theme.id);
                      return (
                        <td key={theme.id} className="p-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer p-2 rounded-lg hover:bg-slate-50">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleCell(src.id, theme.id)}
                              className="w-4 h-4 text-[#1F8A8A] border-slate-300 rounded focus:ring-[#1F8A8A] cursor-pointer"
                            />
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {state.sources.filter(s => s.verified).length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      No verified sources available yet in your Source Bank. Please add a source or verify suggested references to start mapping your synthesis matrix!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Matrix live paragraph planning draft generator */}
          <div className="bg-[#17365D]/5 rounded-xl border border-[#17365D]/10 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-[#17365D]/10 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#1F8A8A] tracking-wider block">Live Scaffolding Output</span>
                <h3 className="font-bold text-sm text-[#17365D] font-serif flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#1F8A8A]" /> Auto-Synthesized RRL Paragraph Roadmap
                </h3>
              </div>
              <button
                onClick={() => handleCopyToClipboard(generateSynthesisParagraph(), 'Synthesis Outline')}
                className="px-3 py-1.5 bg-[#17365D] text-white text-[10px] font-bold rounded hover:bg-[#112643] transition-all flex items-center gap-1"
              >
                <Copy className="h-3.5 w-3.5" /> Copy Outline
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-sans italic p-4 bg-white border border-[#17365D]/5 rounded-lg border-l-4 border-l-[#1F8A8A] selection:bg-slate-100">
              "{generateSynthesisParagraph()}"
            </p>
            <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>Tip: This plan groups citations together contextually to model proper thematic writing, a vital skill in high school Practical Research.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: APA Reference Citation Builder */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Builder inputs (left 5 cols) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Metadata Inputs</h3>
              <p className="text-[10px] text-slate-500">Formulate standard parenthetical reference attributes correctly.</p>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-500 uppercase text-[10px] block">Source / Media Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['journal', 'book', 'website'] as const).map(type => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setGenType(type)}
                    className={`py-1.5 text-[10px] font-bold uppercase rounded border transition-all ${genType === type ? 'bg-[#1F8A8A] border-[#1F8A8A] text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-500 uppercase text-[10px] block">Author(s)</label>
              <input
                type="text"
                placeholder="e.g. Santos, M. P. or Dela Cruz, J."
                value={genAuthor}
                onChange={(e) => setGenAuthor(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-500 uppercase text-[10px] block">Publication Year</label>
                <input
                  type="text"
                  placeholder="e.g. 2025"
                  value={genYear}
                  onChange={(e) => setGenYear(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-500 uppercase text-[10px] block">
                  {genType === 'journal' ? 'Journal Title' : genType === 'book' ? 'Publisher Location' : 'Website Publisher'}
                </label>
                <input
                  type="text"
                  placeholder={genType === 'journal' ? 'e.g. Philippine Science Journal' : 'e.g. Rex Bookstore'}
                  value={genPub}
                  onChange={(e) => setGenPub(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-500 uppercase text-[10px] block">Source Work Title</label>
              <input
                type="text"
                placeholder="e.g. Distraction and Academic Achievement in Local Schools"
                value={genTitle}
                onChange={(e) => setGenTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-500 uppercase text-[10px] block">URL / DOI Link (Optional)</label>
              <input
                type="text"
                placeholder="e.g. https://doi.org/10.123/psj.2025"
                value={genUrl}
                onChange={(e) => setGenUrl(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A]"
              />
            </div>

            <button
              type="button"
              onClick={handleAddGeneratedSource}
              className="w-full py-2 bg-[#17365D] hover:bg-[#112643] text-white text-xs font-semibold rounded-lg transition-all"
            >
              Add This Citation to Source Bank
            </button>
          </div>

          {/* Builder outputs (right 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Box 1: Bibliography List APA */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">APA 7th Bibliography Entry</span>
                <button
                  onClick={() => handleCopyToClipboard(getApaBibliographyText(), 'Bibliography Entry')}
                  className="text-[10px] text-[#1F8A8A] font-bold hover:underline flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" /> Copy Reference
                </button>
              </div>

              <div className="bg-slate-50/70 border border-slate-100 rounded-lg p-4 text-xs font-sans text-slate-800 leading-normal select-all">
                {getApaBibliographyText()}
              </div>

              <p className="text-[10px] text-slate-400 font-sans">
                This forms the full entry placed inside the final **References** section of your Practical Research paper.
              </p>
            </div>

            {/* Box 2: In-text parenthetical citations */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">In-Text Citation Format</span>
                <button
                  onClick={() => handleCopyToClipboard(getApaInTextCitation(), 'In-Text Citation')}
                  className="text-[10px] text-[#1F8A8A] font-bold hover:underline flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" /> Copy Citation
                </button>
              </div>

              <div className="bg-slate-50/70 border border-slate-100 rounded-lg p-4 text-xs font-sans text-slate-800 leading-normal select-all">
                {getApaInTextCitation()}
              </div>

              <p className="text-[10px] text-slate-400 font-sans">
                Place this citation within parenthetical sentences directly following statistical/scholarly claims made in your draft (*e.g., "...as shown in Manila youth {getApaInTextCitation()}."*).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
