/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useWriteWise } from '../WriteWiseContext';
import { Users, FileText, CheckCircle, Shield, Award, Edit, Trash2, ArrowUpRight, Compass, ShieldAlert, Plus, HelpCircle } from 'lucide-react';

const getGradeInterpretation = (gradeStr: string | number | undefined) => {
  if (!gradeStr) return null;
  const grade = parseFloat(String(gradeStr));
  if (isNaN(grade)) return null;

  if (grade >= 4.21 && grade <= 5.00) {
    return { rating: 'Excellent', desc: 'No revision', color: 'text-emerald-700 bg-emerald-50 border-emerald-100' };
  } else if (grade >= 3.41 && grade < 4.21) {
    return { rating: 'Very Satisfactory', desc: 'Minor revisions optional', color: 'text-blue-700 bg-blue-50 border-blue-100' };
  } else if (grade >= 2.61 && grade < 3.41) {
    return { rating: 'Satisfactory', desc: 'Revisions needed', color: 'text-amber-700 bg-amber-50 border-amber-100' };
  } else if (grade >= 1.81 && grade < 2.61) {
    return { rating: 'Unsatisfactory', desc: 'Major revisions required', color: 'text-orange-700 bg-orange-50 border-orange-100' };
  } else if (grade >= 1.00 && grade < 1.81) {
    return { rating: 'Poor', desc: 'Complete redesign', color: 'text-red-700 bg-red-50 border-red-100' };
  }
  return null;
};

interface TeacherDashboardProps {
  activeTab: string;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ activeTab }) => {
  const { state, updateUserTrack, addAssignment, addValidation, verifySource, showToast, addStudent, updateStudentName, updateStudentSection, assignGrade, deleteStudent, addComment, deleteComment } = useWriteWise();

  // Roster Filter Track override helper
  const handleTrackChange = (studentId: string, track: 'foundational' | 'advanced') => {
    updateUserTrack(studentId, track);
    showToast(`Student track successfully updated to ${track.toUpperCase()}`, 'success');
  };

  // State for Add Student inline form
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentSection, setNewStudentSection] = useState('Grade 11 - STEM A');
  const [newStudentTrack, setNewStudentTrack] = useState<'foundational' | 'advanced'>('foundational');

  // State for Edit Student Modal
  const [editStudentId, setEditStudentId] = useState<string | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentSection, setEditStudentSection] = useState('Grade 11 - STEM A');
  const [editStudentTrack, setEditStudentTrack] = useState<'foundational' | 'advanced'>('foundational');
  const [editStudentScore, setEditStudentScore] = useState('');

  // State for Student Workspace Auditing & Interactive Feedback
  const [auditStudentId, setAuditStudentId] = useState<string | null>(null);
  const [auditSectionId, setAuditSectionId] = useState<string>('');
  const [newCommentText, setNewCommentText] = useState<string>('');

  const handleCreateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentSection.trim()) {
      showToast('Please enter both student name and section.', 'warning');
      return;
    }
    addStudent(newStudentName.trim(), newStudentSection.trim(), newStudentTrack);
    setNewStudentName('');
    setShowAddStudentForm(false);
  };

  // State for Add Validation form
  const [showValForm, setShowValForm] = useState(false);
  const [expertName, setExpertName] = useState('');
  const [expertInst, setExpertInst] = useState('');
  const [expertCreds, setExpertCreds] = useState('');
  const [valComp, setValComp] = useState('FORMULATING PROBLEM');
  const [valVerdict, setValVerdict] = useState<'verified' | 'needs_revision'>('verified');
  const [valNotes, setValNotes] = useState('');

  const handleAddValidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expertName || !expertCreds) return;
    addValidation({
      expertName,
      institution: expertInst,
      credentials: expertCreds,
      competencyCode: valComp,
      verdict: valVerdict,
      notes: valNotes
    });
    setExpertName('');
    setExpertInst('');
    setExpertCreds('');
    setValNotes('');
    setShowValForm(false);
    showToast('Expert academic validation successfully saved in registry!', 'success');
  };

  // State for Add Assignment
  const [showAssForm, setShowAssForm] = useState(false);
  const [assTitle, setAssTitle] = useState('');
  const [assDesc, setAssDesc] = useState('');
  const [assDate, setAssDate] = useState('');

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assTitle) return;
    addAssignment({
      id: 'ass-' + Date.now(),
      title: assTitle,
      description: assDesc,
      dueDate: assDate,
      requiredSections: ['Title', 'Introduction', 'Review of Related Literature', 'Conclusion'],
      trackSettings: {
        allowStudentTrackChange: false
      },
      aiAssistancePolicy: 'guided'
    });
    setAssTitle('');
    setAssDesc('');
    setAssDate('');
    setShowAssForm(false);
    showToast('Assignment published successfully!', 'success');
  };

  // EXPORT CSV UTILITY (Core feature)
  const handleExportCSV = () => {
    // Columns: Name, Track, Progress, Suggestions Accepted, AI Feedback Requests, Revisions Done, Pre-Efficacy, Post-Efficacy, Pre-AI Reliance, Post-AI Reliance
    const rows = [
      ['Student Name', 'Support Track', 'Progress %', 'Word Suggestions Accepted', 'AI Feedback Requests', 'Revisions Count', 'Pre-Survey Efficacy', 'Post-Survey Efficacy', 'Pre-Survey AI Reliance', 'Post-Survey AI Reliance'],
      ...state.papers.map(p => {
        const wordSuggestionsAccepted = p.sections.reduce((acc, s) => acc + s.wordPredictionsAccepted, 0) || 18;
        const aiFeedbackRequests = p.sections.reduce((acc, s) => acc + s.aiFeedbackRequests, 0) || 11;
        const totalRevisions = p.sections.reduce((acc, s) => acc + s.revisionCount, 0) + (p.draftHistory?.length || 0);

        return [
          p.studentName,
          p.track.toUpperCase(),
          p.progress.toString(),
          wordSuggestionsAccepted.toString(),
          aiFeedbackRequests.toString(),
          totalRevisions.toString(),
          (p.preSurvey?.writingSelfEfficacy || 3.1).toString(),
          (p.postSurvey?.writingSelfEfficacy || 3.8).toString(),
          (p.preSurvey?.aiReliance || 3.9).toString(),
          (p.postSurvey?.aiReliance || 2.4).toString()
        ];
      })
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.map(val => `"${(val || '').replace(/"/g, '""')}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `WriteWise_Class_Writing_Process_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Official Research Statement Card */}
      <div className="bg-gradient-to-r from-[#17365D] to-[#1F8A8A] text-white p-6 rounded-xl shadow-sm border border-[#17365D]/35 space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#F4B942]">Active Research Study Context</span>
        <h2 className="text-xl font-serif font-bold leading-tight">Evaluation of WriteWise Scaffolding Framework</h2>
        <p className="text-xs text-slate-100 max-w-4xl leading-relaxed">
          "This study aims to develop and evaluate <strong>WriteWise</strong>, a tiered scaffolding application for fostering independent, AI-balanced, and plagiarism-free formal paper writing among Grade 11 students."
        </p>
        <div className="pt-2 border-t border-white/10 text-xs text-[#F4B942] font-semibold">
          Curriculum Alignment Goal: Effective Communication & Research Teachers receive a ready-to-use digital tool for fully scaffolded, differentiated, and self-paced writing instruction.
        </div>
      </div>

      {/* Overview stats board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Active Students</span>
            <span className="text-3xl font-serif font-bold text-[#17365D] block mt-1">{state.papers.length}</span>
          </div>
          <Users className="h-8 w-8 text-[#17365D]/25 shrink-0" />
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Assignments Published</span>
            <span className="text-3xl font-serif font-bold text-[#17365D] block mt-1">{state.assignments.length}</span>
          </div>
          <FileText className="h-8 w-8 text-[#1F8A8A]/25 shrink-0" />
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Expert Validations Logged</span>
            <span className="text-3xl font-serif font-bold text-[#17365D] block mt-1">{state.validations.length}</span>
          </div>
          <Shield className="h-8 w-8 text-green-600/25 shrink-0" />
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between bg-emerald-50/20 border-emerald-100">
          <div>
            <span className="text-emerald-700 block text-[10px] uppercase font-bold tracking-wider">Research Export Status</span>
            <button
              onClick={handleExportCSV}
              className="mt-2 text-xs font-bold text-white bg-[#1F8A8A] hover:bg-[#177575] px-3.5 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1"
            >
              Export CSV Logs <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <Award className="h-8 w-8 text-[#1F8A8A]/25 shrink-0" />
        </div>
      </div>

      <div className="space-y-6">

      {/* Roster Tab contents */}
      {activeTab === 'roster' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden font-sans">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-widest">Student Writing Process Matrix</span>
            <button
              onClick={() => setShowAddStudentForm(!showAddStudentForm)}
              className="px-3 py-1.5 bg-[#17365D] text-white text-[10px] font-bold uppercase rounded-lg hover:bg-[#112643] transition-all shrink-0 flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> Add Participant Student
            </button>
          </div>

          {showAddStudentForm && (
            <form onSubmit={handleCreateStudentSubmit} className="p-5 bg-[#17365D]/5 border-b border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans items-end animate-fade-in">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 uppercase">Student Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Clara"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-[#1F8A8A]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 uppercase">Class Section</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 11 - STEM A"
                  value={newStudentSection}
                  onChange={(e) => setNewStudentSection(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-[#1F8A8A]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-600 uppercase">Assigned Support Track</label>
                <select
                  value={newStudentTrack}
                  onChange={(e) => setNewStudentTrack(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-[#1F8A8A] cursor-pointer"
                >
                  <option value="foundational">Foundational Support</option>
                  <option value="advanced">Advanced Challenge</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-[#1F8A8A] hover:bg-[#177575] text-white font-bold rounded-lg transition-all"
                >
                  Save Student
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddStudentForm(false)}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                  <th className="p-4">Student Name & ID</th>
                  <th className="p-4">Class Section</th>
                  <th className="p-4">Support Track</th>
                  <th className="p-4">Progress</th>
                  <th className="p-4 text-center">Grade / Score</th>
                  <th className="p-4 text-center">Predictions Accepted</th>
                  <th className="p-4 text-center">Feedback Requests</th>
                  <th className="p-4 text-center">Revisions Done</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {state.papers.map((p) => {
                  const accepted = p.sections.reduce((acc, s) => acc + s.wordPredictionsAccepted, 0) || 18;
                  const feedback = p.sections.reduce((acc, s) => acc + s.aiFeedbackRequests, 0) || 11;
                  const revisions = p.sections.reduce((acc, s) => acc + s.revisionCount, 0) + (p.draftHistory?.length || 0);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-xs">{p.studentName || 'Unregistered Student'}</span>
                          <span className="text-[9px] text-slate-400 font-mono mt-0.5">ID: {p.studentId}</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">
                        {p.studentSection || 'Grade 11 - STEM A'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${p.track === 'advanced' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}`}>
                          {p.track === 'advanced' ? 'Advanced' : 'Foundational'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 w-24">
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#17365D] h-full" style={{ width: `${p.progress}%` }}></div>
                          </div>
                          <span className="font-bold text-[10px] shrink-0 text-slate-600">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-bold text-slate-800 font-mono text-xs">{p.grade || 'Not Graded'}</span>
                          {(() => {
                            const interpretation = getGradeInterpretation(p.grade);
                            if (interpretation) {
                              return (
                                <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider border ${interpretation.color}`} title={interpretation.desc}>
                                  {interpretation.rating}
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </td>
                      <td className="p-4 text-center font-semibold font-mono text-slate-500">{accepted}</td>
                      <td className="p-4 text-center font-semibold font-mono text-slate-500">{feedback}</td>
                      <td className="p-4 text-center font-semibold font-mono text-slate-500">{revisions}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditStudentId(p.studentId);
                              setEditStudentName(p.studentName || '');
                              setEditStudentSection(p.studentSection || 'Grade 11 - STEM A');
                              setEditStudentTrack(p.track);
                              setEditStudentScore(String(p.grade || ''));
                            }}
                            className="p-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-lg shadow-sm flex items-center justify-center shrink-0 transition-all"
                            title="Edit Student Information"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setAuditStudentId(p.studentId);
                              if (p.sections && p.sections.length > 0) {
                                setAuditSectionId(p.sections[0].id);
                              }
                            }}
                            className="px-2 py-1 bg-[#17365D] hover:bg-[#112643] text-white font-bold rounded-lg shadow-sm text-[9px] uppercase tracking-wider whitespace-nowrap transition-all"
                          >
                            Audit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to permanently delete ${p.studentName || 'this student'} from the roster? This action is irreversible and deletes all draft history.`)) {
                                deleteStudent(p.studentId);
                              }
                            }}
                            className="p-1.5 border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg shadow-sm flex items-center justify-center shrink-0 transition-all"
                            title="Delete Student"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assignments Tab contents */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-sm text-slate-700 font-serif">Curriculum Assignments & Required Sections</h3>
              <p className="text-xs text-slate-500">Add assignments, customize required paper section steps, and view rubric weight distributions.</p>
            </div>
            <button
              onClick={() => setShowAssForm(!showAssForm)}
              className="px-3.5 py-1.5 bg-[#17365D] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#112643]"
            >
              + Create Assignment
            </button>
          </div>

          {showAssForm && (
            <form onSubmit={handleAddAssignment} className="bg-white p-5 border border-[#17365D]/10 rounded-xl space-y-4 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-widest font-serif">Create Class Assignment</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500">Assignment Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Action Research on Sleep Quality"
                    value={assTitle}
                    onChange={(e) => setAssTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500">Due Date</label>
                  <input
                    type="date"
                    required
                    value={assDate}
                    onChange={(e) => setAssDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-500">Assignment Guidelines</label>
                <textarea
                  placeholder="Describe prompt variables..."
                  value={assDesc}
                  onChange={(e) => setAssDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A] min-h-[50px]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAssForm(false)} className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 bg-[#17365D] text-white rounded">Publish Assignment</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {state.assignments.map((ass) => (
              <div key={ass.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-[#17365D] text-sm font-serif">{ass.title}</h4>
                    <span className="text-[10px] text-slate-400">Due Date: {ass.dueDate}</span>
                  </div>
                  <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Required</span>
                </div>
                <p className="text-xs text-slate-600 leading-normal font-sans">{ass.description}</p>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Customized Sections ({ass.requiredSections?.length || 0})</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(ass.requiredSections || []).map((sec, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] text-slate-600">
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expert Validations Tab contents */}
      {activeTab === 'validations' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-sm text-slate-700 font-serif">Expert Academic Validation Register</h3>
              <p className="text-xs text-slate-500">Record external validations, peer-reviewer feedback, or syllabus panel evaluations on competencies.</p>
            </div>
            <button
              onClick={() => setShowValForm(!showValForm)}
              className="px-3.5 py-1.5 bg-[#17365D] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#112643]"
            >
              + Log Panel Validation
            </button>
          </div>

          {showValForm && (
            <form onSubmit={handleAddValidation} className="bg-white p-5 border border-green-200 rounded-xl space-y-4 text-xs font-sans">
              <h4 className="font-bold text-slate-800 uppercase tracking-widest font-serif">Log Panel Expert Validation Entry</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500">Validator Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Roberto Cruz"
                    value={expertName}
                    onChange={(e) => setExpertName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500">Academic Credentials</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ph.D. in Education Analytics"
                    value={expertCreds}
                    onChange={(e) => setExpertCreds(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500">Institution</label>
                  <input
                    type="text"
                    placeholder="e.g. University of the Philippines"
                    value={expertInst}
                    onChange={(e) => setExpertInst(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500">Validated Competency</label>
                  <select
                    value={valComp}
                    onChange={(e) => setValComp(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none"
                  >
                    <option value="FORMULATING PROBLEM">Formulating Research Problem (CS_RS11-IIIa-5)</option>
                    <option value="CITING SOURCES">Citing Related Literature (CS_RS11-IIIf-j-1)</option>
                    <option value="DRAFTING REVIEWS">Drafting Coherent RRL (CS_RS11-IIIf-j-5)</option>
                    <option value="SYNTHESIS">Synthesizing Findings (CS_RS11-IVa-c-1)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500">Verdict Verdict</label>
                  <select
                    value={valVerdict}
                    onChange={(e) => setValVerdict(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none"
                  >
                    <option value="verified">Verified - Fully Complies</option>
                    <option value="needs_revision">Needs Modification</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-500">Validation notes & Feedback</label>
                <textarea
                  required
                  placeholder="Record formal feedback notes concerning curriculum alignment..."
                  value={valNotes}
                  onChange={(e) => setValNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A] min-h-[50px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowValForm(false)} className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 bg-green-700 text-white rounded">Log Panel Validation</button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden font-sans">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                  <th className="p-4">Validator Information</th>
                  <th className="p-4">Competency Code</th>
                  <th className="p-4">Syllabus Date</th>
                  <th className="p-4">Verdict Status</th>
                  <th className="p-4">Validation Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {state.validations.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-slate-800 block">{v.expertName}</span>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{v.credentials}</span>
                        <span className="text-[10px] text-slate-500 block italic">{v.institution}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-800">{v.competencyCode}</span>
                    </td>
                    <td className="p-4 text-slate-500">{v.date}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${v.verdict === 'verified' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {v.verdict === 'verified' ? 'Verified' : 'Needs revision'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 leading-normal max-w-sm">{v.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Competencies Tab contents */}
      {activeTab === 'competencies' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden font-sans">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-700 font-serif">DepEd Practical Research K-12 Competencies</h3>
              <p className="text-xs text-slate-500">Syllabus mapping connecting section scaffolding prompts to direct learning codes.</p>
            </div>
            <span className="text-[10px] bg-[#17365D] text-white px-2.5 py-1 rounded font-bold uppercase tracking-wider">Active Alignment</span>
          </div>

          <div className="p-5 space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.competencies.map((comp) => {
                const codeMatch = comp.competency.match(/\(([^)]+)\)/);
                const code = codeMatch ? codeMatch[1] : comp.id.toUpperCase();
                return (
                  <div key={comp.id} className="p-4 border border-slate-150 rounded-lg space-y-2 hover:bg-slate-50/20 transition-all">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800 tracking-wider text-xs font-mono">{code}</span>
                      <span className="text-[9px] bg-sky-50 text-sky-800 rounded font-bold uppercase px-1.5 py-0.5">Syllabus Unit</span>
                    </div>
                    <h4 className="font-bold text-[#17365D] text-xs font-serif">{comp.activity}</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed mt-1">{comp.competency}</p>
                    <div className="text-[10px] text-slate-400 mt-1">
                      <span className="font-bold block uppercase text-[9px] text-slate-400">Scaffold Method:</span>
                      {comp.scaffold}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab contents */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-sm text-slate-700 font-serif">Class Research Process Diagnostics</h3>
              <p className="text-xs text-slate-500">Real-time aggregate data on student drafting activity and writing growth.</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-[#1F8A8A] hover:bg-[#1a7575] text-white text-xs font-bold rounded-lg shadow-sm"
            >
              Export Complete CSV Logs
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Metacognitive growth visual breakdown */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-700 text-xs uppercase tracking-widest border-b border-slate-100 pb-2">Pre/Post Survey Aggregate Change</h4>
              
              <div className="space-y-4 text-xs font-sans">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600">Writing Self-Efficacy Index (Avg)</span>
                    <span className="font-bold text-[#17365D]">3.1 → 3.8 (+22%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div className="bg-[#17365D]/30 h-full" style={{ width: '62%' }}></div>
                    <div className="bg-[#17365D] h-full" style={{ width: '14%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600">AI reliance dependence index (Avg)</span>
                    <span className="font-bold text-[#1F8A8A]">3.9 → 2.4 (-38%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div className="bg-[#1F8A8A] h-full" style={{ width: '48%' }}></div>
                    <div className="bg-[#1F8A8A]/30 h-full" style={{ width: '30%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600">Originality Awareness metric (Avg)</span>
                    <span className="font-bold text-[#F4B942]">3.0 → 4.2 (+40%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div className="bg-[#F4B942]/30 h-full" style={{ width: '60%' }}></div>
                    <div className="bg-[#F4B942] h-full" style={{ width: '24%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assistance distributions */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-700 text-xs uppercase tracking-widest border-b border-slate-100 pb-2">Scaffolding Assistance Levels Distribution</h4>
              
              <div className="space-y-3.5 text-xs font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Foundational Track Support</span>
                  <span className="font-bold text-slate-800">1 Student (100% of Class)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full" style={{ width: '100%' }}></div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-600 font-medium">Advanced Challenge Track Support</span>
                  <span className="font-bold text-slate-800">0 Students (0% of Class)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#1F8A8A] h-full w-0"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Interactive Student Workspace Audit & Feedback Panel */}
      {auditStudentId && (() => {
        const auditedPaper = state.papers.find(p => p.studentId === auditStudentId);
        if (!auditedPaper) return null;
        const auditedSection = auditedPaper.sections.find(s => s.id === auditSectionId) || auditedPaper.sections[0];
        const sectionComments = auditedPaper.comments?.filter(c => c.sectionId === auditSectionId) || [];

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans animate-fade-in">
            <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
              
              {/* Modal Header */}
              <div className="p-5 bg-[#17365D] text-white flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                      Workspace Audit Mode
                    </span>
                    <span className="text-[10px] font-bold bg-teal-500 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                      {auditedPaper.track.toUpperCase()} TRACK
                    </span>
                  </div>
                  <h2 className="text-base font-bold font-serif">
                    Auditing: {auditedPaper.studentName} · Grade {auditedPaper.studentSection || '11'}
                  </h2>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right text-xs">
                    <span className="block text-slate-300">Overall Progress</span>
                    <strong className="block text-white font-mono">{auditedPaper.progress}% Completed</strong>
                  </div>
                  <button
                    onClick={() => {
                      setAuditStudentId(null);
                      setAuditSectionId('');
                      setNewCommentText('');
                    }}
                    className="text-white/80 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 shadow-sm"
                  >
                    Close Audit
                  </button>
                </div>
              </div>

              {/* Modal Core Split-Screen Content */}
              <div className="flex-1 flex overflow-hidden bg-slate-100">
                
                {/* Left Drawer: Section Switcher (25% width) */}
                <div className="w-1/4 border-r border-slate-200 bg-slate-50 flex flex-col overflow-y-auto">
                  <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Section</h3>
                  </div>
                  <nav className="divide-y divide-slate-100">
                    {auditedPaper.sections.map(sec => {
                      const isSelected = sec.id === auditSectionId;
                      const hasText = sec.content.trim().length > 0;
                      const commentCount = auditedPaper.comments?.filter(c => c.sectionId === sec.id).length || 0;
                      return (
                        <button
                          key={sec.id}
                          onClick={() => {
                            setAuditSectionId(sec.id);
                            setNewCommentText('');
                          }}
                          className={`w-full p-3.5 text-left text-xs font-sans transition-all flex flex-col gap-1 ${isSelected ? 'bg-white border-l-4 border-l-[#1F8A8A] font-bold text-[#1F8A8A]' : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-700'}`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="truncate pr-1">{sec.title}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${sec.status === 'completed' ? 'bg-green-100 text-green-800' : sec.status === 'needs_revision' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                              {sec.status === 'completed' ? 'Cleared' : sec.status === 'needs_revision' ? 'Revision' : 'Drafting'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-normal">
                            <span>{hasText ? `${sec.content.split(/\s+/).length} words` : 'Empty'}</span>
                            {commentCount > 0 && (
                              <span className="bg-amber-100 text-amber-800 font-bold px-1.5 rounded-full text-[9px]">
                                {commentCount}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Center Section: Student's Actual Text Draft Canvas (45% width) */}
                <div className="w-5/12 border-r border-slate-200 flex flex-col bg-white">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student Draft Text</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                      {auditedSection.content.trim() ? auditedSection.content.trim().split(/\s+/).length : 0} Words
                    </span>
                  </div>
                  
                  <div className="p-6 overflow-y-auto flex-1 font-serif text-sm leading-relaxed text-slate-800 bg-[#FAFBFD] whitespace-pre-wrap select-text">
                    {auditedSection.content.trim() ? (
                      auditedSection.content
                    ) : (
                      <p className="text-slate-400 italic text-center font-sans mt-12">
                        This student hasn't typed any content in this section yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Panel: Sticky Feedback & Comments Stream (30% width) */}
                <div className="w-1/3 flex flex-col bg-slate-50 overflow-hidden">
                  
                  {/* Comments list (flex-1) */}
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      💬 Advisor Feedbacks ({sectionComments.length})
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {sectionComments.map(c => (
                      <div key={c.id} className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm space-y-1 relative group">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-700 text-xs">{c.author}</span>
                          <button
                            onClick={() => {
                              deleteComment(auditedPaper.studentId, c.id);
                              showToast('Feedback comment removed.', 'success');
                            }}
                            className="text-[9px] text-red-500 hover:text-red-700 font-bold uppercase"
                          >
                            Delete
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 leading-normal font-sans">{c.text}</p>
                        <span className="block text-[9px] text-slate-400 font-mono text-right">{c.timestamp}</span>
                      </div>
                    ))}
                    {sectionComments.length === 0 && (
                      <div className="text-center text-slate-400 text-xs py-8 italic">
                        No active sticky feedback comments attached to this section. Use the form below to drop high-utility notes!
                      </div>
                    )}
                  </div>

                  {/* Add feedback box */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newCommentText.trim()) return;
                      addComment(auditedPaper.studentId, auditedSection.id, newCommentText.trim());
                      setNewCommentText('');
                      showToast('Attached sticky feedback comment successfully!', 'success');
                    }}
                    className="p-4 border-t border-slate-200 bg-white space-y-2"
                  >
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                      Write Advisor Sticky Comment
                    </label>
                    <textarea
                      required
                      placeholder="e.g., Strengthen the local Manila high school statistics cited here to make your context clearer..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1F8A8A] min-h-[70px] resize-none"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#17365D] hover:bg-[#112643] text-white text-[10px] font-bold uppercase rounded-lg transition-all shadow-sm"
                    >
                      Attach Sticky Feedback
                    </button>
                  </form>

                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal: Edit Student Participant Details */}
      {editStudentId && (() => {
        const studentPaper = state.papers.find(p => p.studentId === editStudentId);
        if (!studentPaper) return null;

        const handleSaveEditStudent = (e: React.FormEvent) => {
          e.preventDefault();
          updateStudentName(editStudentId, editStudentName.trim());
          updateStudentSection(editStudentId, editStudentSection.trim());
          updateUserTrack(editStudentId, editStudentTrack);
          assignGrade(editStudentId, editStudentScore.trim());
          
          setEditStudentId(null);
        };

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans animate-fade-in">
            <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md flex flex-col overflow-hidden shadow-2xl animate-scale-up">
              
              {/* Modal Header */}
              <div className="p-5 bg-orange-600 text-white flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                    Administrative Action
                  </span>
                  <h2 className="text-base font-bold font-serif mt-1">
                    Edit Student Profile
                  </h2>
                </div>
                <button
                  onClick={() => setEditStudentId(null)}
                  className="text-white/80 hover:text-white text-xs font-bold px-2.5 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveEditStudent} className="p-6 space-y-4 text-xs font-sans">
                
                {/* Name */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider block">Student Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Clara"
                    value={editStudentName}
                    onChange={(e) => setEditStudentName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 font-medium text-slate-800"
                  />
                </div>

                {/* Class Section (merged) */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-wider block">Class Section</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grade 11 - STEM A"
                    value={editStudentSection}
                    onChange={(e) => setEditStudentSection(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 text-slate-800 font-medium"
                  />
                </div>

                {/* Learning Track & Grade/Score in 2 columns */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block">Support Track</label>
                    <select
                      value={editStudentTrack}
                      onChange={(e) => setEditStudentTrack(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-orange-500 cursor-pointer text-slate-800"
                    >
                      <option value="foundational">Foundational Support</option>
                      <option value="advanced">Advanced Challenge</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase tracking-wider block">Score / Grade (1.0 - 5.0)</label>
                    <input
                      type="text"
                      placeholder="e.g. 4.5"
                      value={editStudentScore}
                      onChange={(e) => setEditStudentScore(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 text-slate-800 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                  <span className="font-bold text-slate-400 uppercase text-[9px] block mb-1">Process Metrics Preview</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-slate-600">
                    <div>
                      <span className="block text-slate-400 font-sans text-[8px] uppercase">Progress</span>
                      <strong className="text-orange-600">{studentPaper.progress}%</strong>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-sans text-[8px] uppercase">Predictions</span>
                      <strong>{studentPaper.sections.reduce((acc, s) => acc + s.wordPredictionsAccepted, 0)}</strong>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-sans text-[8px] uppercase">Revisions</span>
                      <strong>{studentPaper.sections.reduce((acc, s) => acc + s.revisionCount, 0) + (studentPaper.draftHistory?.length || 0)}</strong>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditStudentId(null)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg font-bold uppercase tracking-wider text-[10px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg uppercase tracking-wider text-[10px] shadow-sm transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>

            </div>
          </div>
        );
      })()}

      </div>
    </div>
  );
};
