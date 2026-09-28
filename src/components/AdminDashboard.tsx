/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AdminDashboard Component
 * 
 * Comprehensive Division & Institutional Administration Hub for WriteWise.
 * Features:
 * - Institutional Research Progress & Cohort KPIs
 * - Dedicated Student & Teacher Provisioning (Add Student, Add Teacher)
 * - Section & Grade Level Management (Create, Edit, Delete Class Sections)
 * - Real-time Section Enrollment Counts & Adviser Allocations
 * - Scaffolding & AI Assistance Policy Configuration
 * - System-wide Announcement Broadcast
 * - Live Metacognitive Traceability & System Audit Logs
 * - Master Database Backup Export & Import
 */

import React, { useState, useMemo } from 'react';
import { useWriteWise } from '../WriteWiseContext';
import { User, UserRole, LearningTrack, AIAssistancePolicy, AuditLogEntry, GradeSection } from '../types';
import { 
  Shield, 
  Users, 
  FileText, 
  Sliders, 
  History, 
  Database, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  KeyRound, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  BookOpen, 
  Sparkles, 
  School, 
  Award, 
  Compass, 
  Bell, 
  Check, 
  X,
  GraduationCap,
  Layers,
  Calendar,
  UserCheck,
  UserPlus
} from 'lucide-react';

interface AdminDashboardProps {
  activeTab?: string;
  onNavigate?: (tabId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab = 'admin_users', onNavigate }) => {
  const { 
    state, 
    updateSystemSettings, 
    adminCreateUser, 
    adminUpdateUser, 
    adminDeleteUser, 
    adminResetPassword,
    adminAddSection,
    adminUpdateSection,
    adminDeleteSection,
    assignStudentSection,
    addAuditLog,
    clearAuditLogs,
    exportSystemData,
    importSystemData,
    showToast,
    resetData
  } = useWriteWise();

  // Helper to normalize the active tab from sidebar
  const getNormalizedTab = (tab: string): 'analytics' | 'users' | 'sections' | 'policy' | 'audit' | 'database' => {
    if (tab === 'admin_sections' || tab === 'sections') return 'sections';
    if (tab === 'admin_analytics' || tab === 'analytics') return 'analytics';
    if (tab === 'admin_policy' || tab === 'policy') return 'policy';
    if (tab === 'admin_audit' || tab === 'audit') return 'audit';
    if (tab === 'admin_database' || tab === 'database') return 'database';
    return 'users';
  };

  // Navigation tab within Admin Dashboard (synced with activeTab prop)
  const [adminTab, setAdminTabState] = useState<'analytics' | 'users' | 'sections' | 'policy' | 'audit' | 'database'>(() => getNormalizedTab(activeTab));

  React.useEffect(() => {
    setAdminTabState(getNormalizedTab(activeTab));
  }, [activeTab]);

  const setAdminTab = (tabId: 'analytics' | 'users' | 'sections' | 'policy' | 'audit' | 'database') => {
    setAdminTabState(tabId);
    if (onNavigate) {
      onNavigate(`admin_${tabId}`);
    }
  };

  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');

  // Modals state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isSectionEnrollModalOpen, setIsSectionEnrollModalOpen] = useState<GradeSection | null>(null);
  const [assigningStudent, setAssigningStudent] = useState<{
    id: string;
    name: string;
    currentSection: string;
    currentGrade: string;
    track?: LearningTrack;
  } | null>(null);
  const [assignGradeLevel, setAssignGradeLevel] = useState('Grade 11');
  const [assignSectionName, setAssignSectionName] = useState('STEM A');
  const [assignCustomSection, setAssignCustomSection] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingSection, setEditingSection] = useState<GradeSection | null>(null);

  // Add Student Form State
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    gradeLevel: 'Grade 11',
    section: 'STEM A',
    strand: 'Science, Technology, Engineering, and Mathematics (STEM)',
    studentIdNumber: '',
    track: 'foundational' as LearningTrack,
    phone: '',
    password: 'password123'
  });

  // Add Teacher Form State
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    gradeLevel: 'Grade 11 & 12',
    section: 'STEM A & Practical Research Lead',
    strand: 'Senior High School Research Department',
    studentIdNumber: '',
    phone: '',
    bio: 'DepEd Practical Research Faculty Mentor & Research Adviser.',
    password: 'password123'
  });

  // Add Section & Grade Level Form State
  const [sectionForm, setSectionForm] = useState({
    gradeLevel: 'Grade 11',
    sectionName: '',
    strand: 'Science, Technology, Engineering, and Mathematics (STEM)',
    room: '',
    adviserName: 'Mrs. Maria Santos',
    schedule: 'MWF 8:00 AM - 10:00 AM',
    description: ''
  });

  // Policy Settings Form State (copied from context state)
  const currentSettings = state.systemSettings || {
    institutionName: 'Batangas National High School - Senior High Department',
    academicYear: 'S.Y. 2026-2027',
    aiPolicy: 'guided' as AIAssistancePolicy,
    autocompleteEnabled: true,
    strictSimilarityCheck: true,
    allowStudentTrackChange: false,
    maxDailyAIRequestsPerStudent: 15,
    maintenanceNotice: '',
    broadcastAlert: 'Midterm Research Synthesis Checkpoint: Chapters 1 to 3 submissions due this Friday.'
  };

  const [policyForm, setPolicyForm] = useState(currentSettings);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

  // Audit Logs Filter
  const [auditSearch, setAuditSearch] = useState('');
  const [auditCategory, setAuditCategory] = useState<string>('all');

  // Compute Metrics & Lists
  const usersList: User[] = state.users || [];
  const papers = state.papers || [];
  const sectionsList: GradeSection[] = state.sections || [];

  const totalStudents = usersList.filter(u => u.role === 'student').length;
  const totalTeachers = usersList.filter(u => u.role === 'teacher').length;
  const totalAdmins = usersList.filter(u => u.role === 'admin').length;
  
  const foundationalCount = papers.filter(p => p.track === 'foundational').length;
  const advancedCount = papers.filter(p => p.track === 'advanced').length;
  const avgProgress = papers.length > 0
    ? Math.round(papers.reduce((sum, p) => sum + (p.progress || 0), 0) / papers.length)
    : 0;

  // Grade level options (dynamic from sections plus defaults)
  const availableGradeLevels = useMemo(() => {
    const set = new Set(['Grade 11', 'Grade 12']);
    sectionsList.forEach(s => {
      if (s.gradeLevel) set.add(s.gradeLevel);
    });
    return Array.from(set);
  }, [sectionsList]);

  // Section options for current selected grade level in student form
  const availableSectionsForGrade = useMemo(() => {
    return sectionsList.filter(s => s.gradeLevel === studentForm.gradeLevel);
  }, [sectionsList, studentForm.gradeLevel]);

  // Map student counts per section
  const sectionStudentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    usersList.filter(u => u.role === 'student').forEach(u => {
      const secKey = u.section?.trim() || 'Unassigned';
      counts[secKey] = (counts[secKey] || 0) + 1;
    });
    return counts;
  }, [usersList]);

  // Filter Users
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.studentIdNumber && u.studentIdNumber.toLowerCase().includes(userSearch.toLowerCase())) ||
        (u.section && u.section.toLowerCase().includes(userSearch.toLowerCase()));
      
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesGrade = gradeFilter === 'all' || u.gradeLevel === gradeFilter;
      const matchesSection = sectionFilter === 'all' || (u.section && u.section.includes(sectionFilter));

      return matchesSearch && matchesRole && matchesGrade && matchesSection;
    });
  }, [usersList, userSearch, roleFilter, gradeFilter, sectionFilter]);

  // Filter Audit Logs
  const auditLogs: AuditLogEntry[] = state.auditLogs || [];
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = 
        log.actor.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.details.toLowerCase().includes(auditSearch.toLowerCase());
      
      const matchesCategory = auditCategory === 'all' || log.category === auditCategory;
      return matchesSearch && matchesCategory;
    });
  }, [auditLogs, auditSearch, auditCategory]);

  // Handle Add Student Submit
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name.trim() || !studentForm.email.trim()) {
      showToast('Name and email are required.', 'warning');
      return;
    }

    adminCreateUser({
      name: studentForm.name.trim(),
      email: studentForm.email.trim().toLowerCase(),
      role: 'student',
      gradeLevel: studentForm.gradeLevel,
      section: studentForm.section,
      strand: studentForm.strand,
      studentIdNumber: studentForm.studentIdNumber.trim() || `LRN-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      track: studentForm.track,
      phone: studentForm.phone.trim(),
      password: studentForm.password || 'password123'
    });

    setIsAddStudentOpen(false);
    setStudentForm({
      name: '',
      email: '',
      gradeLevel: 'Grade 11',
      section: 'STEM A',
      strand: 'Science, Technology, Engineering, and Mathematics (STEM)',
      studentIdNumber: '',
      track: 'foundational',
      phone: '',
      password: 'password123'
    });
  };

  // Handle Add Teacher Submit
  const handleAddTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.name.trim() || !teacherForm.email.trim()) {
      showToast('Name and email are required.', 'warning');
      return;
    }

    adminCreateUser({
      name: teacherForm.name.trim(),
      email: teacherForm.email.trim().toLowerCase(),
      role: 'teacher',
      gradeLevel: teacherForm.gradeLevel,
      section: teacherForm.section,
      strand: teacherForm.strand,
      studentIdNumber: teacherForm.studentIdNumber.trim() || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      phone: teacherForm.phone.trim(),
      bio: teacherForm.bio.trim(),
      password: teacherForm.password || 'password123'
    });

    setIsAddTeacherOpen(false);
    setTeacherForm({
      name: '',
      email: '',
      gradeLevel: 'Grade 11 & 12',
      section: 'STEM A & Practical Research Lead',
      strand: 'Senior High School Research Department',
      studentIdNumber: '',
      phone: '',
      bio: 'DepEd Practical Research Faculty Mentor & Research Adviser.',
      password: 'password123'
    });
  };

  // Handle Add Section Submit
  const handleAddSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionForm.sectionName.trim()) {
      showToast('Section name is required (e.g. STEM C, Rizal, Mabini).', 'warning');
      return;
    }

    adminAddSection({
      gradeLevel: sectionForm.gradeLevel,
      sectionName: sectionForm.sectionName.trim(),
      strand: sectionForm.strand,
      room: sectionForm.room.trim() || 'Room 301',
      adviserName: sectionForm.adviserName.trim() || 'Unassigned',
      schedule: sectionForm.schedule.trim() || 'MWF 8:00 AM - 10:00 AM',
      description: sectionForm.description.trim() || `Grade ${sectionForm.gradeLevel} Senior High Practical Research class.`
    });

    setIsAddSectionOpen(false);
    setSectionForm({
      gradeLevel: 'Grade 11',
      sectionName: '',
      strand: 'Science, Technology, Engineering, and Mathematics (STEM)',
      room: '',
      adviserName: 'Mrs. Maria Santos',
      schedule: 'MWF 8:00 AM - 10:00 AM',
      description: ''
    });
  };

  // Handle Edit User Submit
  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    adminUpdateUser(editingUser.id, editingUser);
    setEditingUser(null);
  };

  // Handle Edit Section Submit
  const handleEditSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;
    adminUpdateSection(editingSection.id, editingSection);
    setEditingSection(null);
  };

  // Handle Confirm Student Section & Grade Level Assignment
  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningStudent) return;
    const finalSection = assignSectionName === 'custom'
      ? (assignCustomSection.trim() || 'STEM A')
      : assignSectionName;
    const matchingSec = sectionsList.find(s => s.gradeLevel === assignGradeLevel && s.sectionName === finalSection);

    assignStudentSection(assigningStudent.id, finalSection, assignGradeLevel, matchingSec?.strand);
    setAssigningStudent(null);
  };

  // Handle Quick Enroll Student into Section
  const handleEnrollStudentToSection = (studentId: string, sectionObj: GradeSection) => {
    assignStudentSection(studentId, sectionObj.sectionName, sectionObj.gradeLevel, sectionObj.strand);
  };

  // Handle Save Policy
  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPolicy(true);
    setTimeout(() => {
      updateSystemSettings(policyForm);
      setIsSavingPolicy(false);
    }, 300);
  };

  // Handle Export Database
  const handleExportData = () => {
    const jsonStr = exportSystemData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `writewise_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Database export downloaded successfully.', 'success');
  };

  // Handle Import File
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importSystemData(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12 animate-fade-in">
      
      {/* Top Admin Banner */}
      <div className="bg-gradient-to-r from-[#17365D] via-[#1b4375] to-[#1F8A8A] rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-white/20 text-white rounded-lg backdrop-blur-xs">
                <Shield className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-200">
                Institutional Division Directorate
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
              Institutional Admin Dashboard
            </h1>
            <p className="text-xs text-slate-300 font-sans">
              {currentSettings.institutionName} • {currentSettings.academicYear} • Practical Research 1 & 2 Governance
            </p>
          </div>

          {/* Quick Direct Actions in Header */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="px-3.5 py-2 bg-white text-[#17365D] hover:bg-slate-100 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="h-4 w-4 text-[#1F8A8A]" />
              <span>+ Add Student</span>
            </button>

            <button
              onClick={() => setIsAddTeacherOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <GraduationCap className="h-4 w-4" />
              <span>+ Add Teacher</span>
            </button>

            <button
              onClick={() => setIsAddSectionOpen(true)}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="h-4 w-4" />
              <span>+ Add Section</span>
            </button>
          </div>
        </div>

        {/* Broadcast Banner Announcement Preview */}
        {currentSettings.broadcastAlert && (
          <div className="mt-4 pt-3 border-t border-white/15 flex items-center gap-2.5 text-xs text-slate-100">
            <Bell className="h-4 w-4 text-amber-300 shrink-0" />
            <span className="font-bold text-amber-300">Active Campus Broadcast:</span>
            <span className="truncate">{currentSettings.broadcastAlert}</span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: USER & ROLE DIRECTORY (STUDENTS, TEACHERS, ADMINS)     */}
      {/* ------------------------------------------------------------- */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by student/teacher name, email, LRN, or section..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#17365D] focus:ring-1 focus:ring-[#17365D]"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value as any)}
                  className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none"
                >
                  <option value="all">All Roles ({usersList.length})</option>
                  <option value="student">Students ({totalStudents})</option>
                  <option value="teacher">Teachers ({totalTeachers})</option>
                  <option value="admin">Administrators ({totalAdmins})</option>
                </select>

                <select
                  value={gradeFilter}
                  onChange={e => setGradeFilter(e.target.value)}
                  className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none"
                >
                  <option value="all">All Grade Levels</option>
                  {availableGradeLevels.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              {/* Direct Creation Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsAddStudentOpen(true)}
                  className="px-3.5 py-2 bg-[#17365D] hover:bg-[#112643] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>+ Add Student</span>
                </button>

                <button
                  onClick={() => setIsAddTeacherOpen(true)}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <GraduationCap className="h-4 w-4" />
                  <span>+ Add Teacher</span>
                </button>
              </div>
            </div>

            {/* Quick Filter Counts */}
            <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-bold uppercase">Quick view:</span>
              <button 
                onClick={() => setRoleFilter('student')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  roleFilter === 'student' ? 'bg-[#17365D] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Students ({totalStudents})
              </button>
              <button 
                onClick={() => setRoleFilter('teacher')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  roleFilter === 'teacher' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Teachers & Mentors ({totalTeachers})
              </button>
              <button 
                onClick={() => setRoleFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  roleFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Show All
              </button>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">User Identity</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">LRN / ID</th>
                    <th className="py-3.5 px-4">Grade & Section</th>
                    <th className="py-3.5 px-4">Track</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No users found matching &quot;{userSearch}&quot;
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#17365D]/10 text-[#17365D] font-bold flex items-center justify-center text-xs shrink-0">
                              {u.name.slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-slate-800 block leading-tight">{u.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono leading-tight">{u.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'teacher'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                          {u.studentIdNumber || '—'}
                        </td>

                        <td className="py-3 px-4 text-slate-600">
                          <div className="font-semibold text-slate-800">
                            {u.gradeLevel || 'Grade 11'}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {u.section || 'Unassigned'}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {u.role === 'student' ? (
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              u.track === 'advanced' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {u.track || 'foundational'}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {u.role === 'student' && (
                              <button
                                onClick={() => {
                                  setAssigningStudent({
                                    id: u.id,
                                    name: u.name,
                                    currentSection: u.section || 'Unassigned',
                                    currentGrade: u.gradeLevel || 'Grade 11',
                                    track: u.track
                                  });
                                  setAssignGradeLevel(u.gradeLevel || 'Grade 11');
                                  setAssignSectionName(u.section || 'STEM A');
                                  setAssignCustomSection('');
                                }}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                                title="Assign Section & Grade Level"
                              >
                                <Layers className="h-3 w-3 text-emerald-700" />
                                <span>Assign Section</span>
                              </button>
                            )}

                            <button
                              onClick={() => adminResetPassword(u.id)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Reset Password to default (password123)"
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => setEditingUser(u)}
                              className="p-1.5 text-slate-400 hover:text-[#17365D] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit user details"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to permanently delete user ${u.name}?`)) {
                                  adminDeleteUser(u.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete user"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: SECTIONS & GRADE LEVELS MANAGEMENT                     */}
      {/* ------------------------------------------------------------- */}
      {adminTab === 'sections' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 font-serif">
                Grade Levels & Practical Research Class Sections
              </h2>
              <p className="text-xs text-slate-500">
                Organize academic cohorts, assigned research advisers, and track student enrollment.
              </p>
            </div>

            <button
              onClick={() => setIsAddSectionOpen(true)}
              className="px-4 py-2.5 bg-[#17365D] hover:bg-[#112643] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add New Section & Grade Level</span>
            </button>
          </div>

          {/* Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectionsList.map(sec => {
              const enrolledCount = sectionStudentCounts[sec.sectionName] || 0;

              return (
                <div 
                  key={sec.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#17365D] bg-[#17365D]/10 px-2 py-0.5 rounded-full">
                          {sec.gradeLevel}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">
                          {sec.sectionName}
                        </h3>
                      </div>

                      <span className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold rounded-lg shrink-0">
                        {enrolledCount} {enrolledCount === 1 ? 'Student' : 'Students'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-normal">
                      <strong>Strand:</strong> {sec.strand}
                    </p>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Research Adviser:</span>
                        <span className="font-bold text-slate-800">{sec.adviserName || 'Unassigned'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Room / Lab:</span>
                        <span className="font-mono text-slate-700">{sec.room || 'Room 304'}</span>
                      </div>
                      {sec.schedule && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Schedule:</span>
                          <span className="text-slate-700">{sec.schedule}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setUserSearch(sec.sectionName);
                          setRoleFilter('student');
                          setAdminTab('users');
                        }}
                        className="text-xs font-bold text-[#1F8A8A] hover:underline"
                      >
                        View ({enrolledCount}) &rarr;
                      </button>

                      <button
                        onClick={() => setIsSectionEnrollModalOpen(sec)}
                        className="px-2.5 py-1 bg-[#17365D] hover:bg-[#112643] text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        title={`Assign or enroll students into ${sec.gradeLevel} - ${sec.sectionName}`}
                      >
                        <UserPlus className="h-3 w-3" />
                        <span>Assign Students</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingSection(sec)}
                        className="p-1.5 text-slate-400 hover:text-[#17365D] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit section"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove section "${sec.gradeLevel} - ${sec.sectionName}"?`)) {
                            adminDeleteSection(sec.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete section"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: INSTITUTIONAL ANALYTICS & RESEARCH PROGRESS             */}
      {/* ------------------------------------------------------------- */}
      {adminTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Enrolled Students
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-serif text-[#17365D]">{totalStudents}</span>
                <span className="text-xs text-slate-500">Learners</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                {foundationalCount} Foundational • {advancedCount} Advanced
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Active Research Papers
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-serif text-[#1F8A8A]">{papers.length}</span>
                <span className="text-xs text-emerald-600 font-semibold">{avgProgress}% avg progress</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                {papers.filter(p => p.progress >= 90).length} Finalized Manuscripts
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Faculty & Mentors
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-serif text-slate-800">{totalTeachers}</span>
                <span className="text-xs text-slate-500">Teachers</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                {sectionsList.length} Active Class Sections
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Verified Source Bank
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-serif text-emerald-700">{state.sources.length}</span>
                <span className="text-xs text-slate-500">Citations</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                100% APA 7th Compliant Citations
              </p>
            </div>
          </div>

          {/* Research Chapter Pipeline Progression */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-serif">
                  Senior High Practical Research Manuscript Completion Funnel
                </h3>
                <p className="text-xs text-slate-400">Cohort progression across DepEd prescribed formal research sections</p>
              </div>
              <span className="text-xs font-semibold text-[#17365D] bg-[#17365D]/10 px-2.5 py-1 rounded-lg">
                Grade 11 & 12 Cohorts
              </span>
            </div>

            <div className="space-y-3">
              {[
                { section: 'Chapter 1: Title & Background', completePct: 95, color: 'bg-emerald-500' },
                { section: 'Chapter 1: Problem Statement & Objectives', completePct: 88, color: 'bg-emerald-500' },
                { section: 'Chapter 2: Review of Related Literature (RRL)', completePct: 74, color: 'bg-[#1F8A8A]' },
                { section: 'Chapter 3: Research Methodology & Sampling', completePct: 62, color: 'bg-[#17365D]' },
                { section: 'Chapter 4: Results Presentation & Discussion', completePct: 45, color: 'bg-amber-500' },
                { section: 'Chapter 5: Conclusions & Recommendations', completePct: 35, color: 'bg-slate-400' }
              ].map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{step.section}</span>
                    <span className="font-mono text-slate-500">{step.completePct}% of students</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${step.color}`} 
                      style={{ width: `${step.completePct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: CURRICULUM & AI POLICIES                                */}
      {/* ------------------------------------------------------------- */}
      {adminTab === 'policy' && (
        <form onSubmit={handleSavePolicy} className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 font-serif">
                Institutional AI Assistance & Scaffolding Policy
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure systemic policies for AI assistance and authorship verification across all research classrooms.
              </p>
            </div>

            {/* AI Policy Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { 
                  id: 'minimal', 
                  title: 'Minimal Assistance', 
                  desc: 'High originality constraints. AI restricted strictly to spell check and glossary lookup.',
                  badge: 'Strict'
                },
                { 
                  id: 'guided', 
                  title: 'Guided Scaffolding', 
                  desc: 'Standard tiered prompts, academic sentence starters, and structured clause templates.',
                  badge: 'Recommended'
                },
                { 
                  id: 'supported', 
                  title: 'Supported Autocomplete', 
                  desc: 'Full predictive ghost-text phrasing, methodology suggestions, and in-line academic suggestions.',
                  badge: 'Standard'
                },
                { 
                  id: 'declared_ai_use', 
                  title: 'Declared AI Use', 
                  desc: 'Permits assistive rewriting with mandatory explicit student metacognitive disclosure logs.',
                  badge: 'Advanced'
                }
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setPolicyForm({ ...policyForm, aiPolicy: opt.id as any })}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    policyForm.aiPolicy === opt.id
                      ? 'border-[#17365D] bg-[#17365D]/5 ring-2 ring-[#17365D]/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-800">{opt.title}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      policyForm.aiPolicy === opt.id ? 'bg-[#17365D] text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">{opt.desc}</p>
                </div>
              ))}
            </div>

            {/* System Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Predictive Ghost-Text Autocomplete</span>
                  <input
                    type="checkbox"
                    checked={policyForm.autocompleteEnabled}
                    onChange={e => setPolicyForm({ ...policyForm, autocompleteEnabled: e.target.checked })}
                    className="h-4 w-4 rounded text-[#17365D] focus:ring-[#17365D]"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Enable scholarly sentence stem prediction and academic phrase completions in the student drafting workspace.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Strict Originality & Similarity Check</span>
                  <input
                    type="checkbox"
                    checked={policyForm.strictSimilarityCheck}
                    onChange={e => setPolicyForm({ ...policyForm, strictSimilarityCheck: e.target.checked })}
                    className="h-4 w-4 rounded text-[#17365D] focus:ring-[#17365D]"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Flags verbatim quotes and uncredited literature excerpts when students submit sections for review.
                </p>
              </div>
            </div>

            {/* Broadcast Alert Message */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Division Announcement / Broadcast Banner
              </label>
              <input
                type="text"
                value={policyForm.broadcastAlert || ''}
                onChange={e => setPolicyForm({ ...policyForm, broadcastAlert: e.target.value })}
                placeholder="e.g. Midterm research draft submission deadline this Friday at 5:00 PM."
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#17365D] focus:ring-1 focus:ring-[#17365D]"
              />
              <p className="text-[10px] text-slate-400">
                This banner will appear prominently at the top of all student and teacher dashboards.
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSavingPolicy}
                className="px-5 py-2.5 bg-[#17365D] hover:bg-[#112643] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>{isSavingPolicy ? 'Saving Configuration...' : 'Save Curriculum Policy'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: SYSTEM AUDIT LOGS                                      */}
      {/* ------------------------------------------------------------- */}
      {adminTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search logs by actor, action, or details..."
                  value={auditSearch}
                  onChange={e => setAuditSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#17365D] focus:ring-1 focus:ring-[#17365D]"
                />
              </div>

              <select
                value={auditCategory}
                onChange={e => setAuditCategory(e.target.value)}
                className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="auth">Authentication</option>
                <option value="submission">Submissions</option>
                <option value="curriculum">Curriculum & Sections</option>
                <option value="security">Security</option>
                <option value="user_management">User Management</option>
                <option value="grading">Grading</option>
              </select>
            </div>

            <button
              onClick={() => {
                if (confirm('Clear audit log history?')) {
                  clearAuditLogs();
                }
              }}
              className="px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Clear Logs
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs divide-y divide-slate-100 overflow-hidden">
            {filteredAuditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No audit entries found matching search criteria.
              </div>
            ) : (
              filteredAuditLogs.map(log => (
                <div key={log.id} className="p-4 flex items-start justify-between gap-4 text-xs hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                      log.status === 'warning' 
                        ? 'bg-amber-100 text-amber-800'
                        : log.status === 'success'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {log.status === 'warning' ? <AlertTriangle className="h-3.5 w-3.5" /> : <Info className="h-3.5 w-3.5" />}
                    </span>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{log.action}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                          {log.category}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{log.details}</p>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        Actor: {log.actor} ({log.actorRole.toUpperCase()})
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: DATABASE & BACKUP                                      */}
      {/* ------------------------------------------------------------- */}
      {adminTab === 'database' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 font-serif">
              Master System Database & Data Integrity
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Export complete institutional state for DepEd accreditation reporting, or restore from a previous JSON backup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-[#17365D]" />
                <h4 className="text-xs font-bold text-slate-800">Export Institutional Database</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Download a complete snapshot containing all user records, research drafts, class sections, literature sources, and audit logs.
              </p>
              <button
                onClick={handleExportData}
                className="w-full py-2.5 px-4 bg-[#17365D] hover:bg-[#112643] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download Master Backup JSON</span>
              </button>
            </div>

            <div className="p-5 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-[#1F8A8A]" />
                <h4 className="text-xs font-bold text-slate-800">Restore System Database</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Restore student papers, faculty rosters, and section configurations from a previously exported WriteWise JSON backup file.
              </p>
              <label className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:border-[#1F8A8A] text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs">
                <Upload className="h-4 w-4 text-[#1F8A8A]" />
                <span>Upload & Restore JSON File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-red-600 block">Reset All Sandbox Data</span>
              <span className="text-[11px] text-slate-400">Restores all student drafts, class sections, and rosters back to pristine default demo state.</span>
            </div>
            <button
              onClick={() => {
                if (confirm('Warning: This will clear all changes and reload default demo data. Proceed?')) {
                  resetData();
                }
              }}
              className="px-3.5 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: ADD STUDENT                                          */}
      {/* ------------------------------------------------------------- */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#17365D]/10 text-[#17365D] rounded-xl">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-serif">Enroll New Student</h3>
                  <p className="text-[11px] text-slate-400">Creates student account and initializes Practical Research manuscript</p>
                </div>
              </div>
              <button onClick={() => setIsAddStudentOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={studentForm.name}
                  onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="e.g. Juan dela Cruz"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#17365D]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Student Email Address *</label>
                <input
                  type="email"
                  required
                  value={studentForm.email}
                  onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
                  placeholder="jdelacruz@writewise.demo"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#17365D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Grade Level</label>
                  <select
                    value={studentForm.gradeLevel}
                    onChange={e => setStudentForm({ ...studentForm, gradeLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#17365D]"
                  >
                    {availableGradeLevels.map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Class Section</label>
                  <select
                    value={studentForm.section}
                    onChange={e => setStudentForm({ ...studentForm, section: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#17365D]"
                  >
                    {availableSectionsForGrade.map(sec => (
                      <option key={sec.id} value={sec.sectionName}>{sec.sectionName}</option>
                    ))}
                    {/* Fallback general options */}
                    {availableSectionsForGrade.length === 0 && (
                      <>
                        <option value="STEM A">STEM A</option>
                        <option value="STEM B">STEM B</option>
                        <option value="HUMSS A">HUMSS A</option>
                        <option value="HUMSS B">HUMSS B</option>
                        <option value="ABM A">ABM A</option>
                        <option value="TVL - ICT">TVL - ICT</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Senior High Academic Strand</label>
                <select
                  value={studentForm.strand}
                  onChange={e => setStudentForm({ ...studentForm, strand: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#17365D]"
                >
                  <option value="Science, Technology, Engineering, and Mathematics (STEM)">STEM — Science, Tech, Engg & Math</option>
                  <option value="Humanities and Social Sciences (HUMSS)">HUMSS — Humanities & Social Sciences</option>
                  <option value="Accountancy, Business, and Management (ABM)">ABM — Accountancy, Business & Management</option>
                  <option value="General Academic Strand (GAS)">GAS — General Academic Strand</option>
                  <option value="Technical-Vocational-Livelihood (TVL) - ICT">TVL — Information & Communications Tech</option>
                  <option value="Technical-Vocational-Livelihood (TVL) - Home Economics">TVL — Home Economics</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Learner Reference Number (LRN)</label>
                  <input
                    type="text"
                    value={studentForm.studentIdNumber}
                    onChange={e => setStudentForm({ ...studentForm, studentIdNumber: e.target.value })}
                    placeholder="LRN-10948291..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#17365D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Scaffolding Assistance Track</label>
                  <select
                    value={studentForm.track}
                    onChange={e => setStudentForm({ ...studentForm, track: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#17365D]"
                  >
                    <option value="foundational">Foundational Track (Guided sentence templates)</option>
                    <option value="advanced">Advanced Track (Independent synthesis)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Initial Password</label>
                <input
                  type="text"
                  value={studentForm.password}
                  onChange={e => setStudentForm({ ...studentForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:border-[#17365D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#17365D] hover:bg-[#112643] text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: ADD TEACHER                                          */}
      {/* ------------------------------------------------------------- */}
      {isAddTeacherOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-serif">Add Teacher / Faculty Mentor</h3>
                  <p className="text-[11px] text-slate-400">Grants research advising, rubric grading, and class roster access</p>
                </div>
              </div>
              <button onClick={() => setIsAddTeacherOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeacherSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Teacher Full Name *</label>
                <input
                  type="text"
                  required
                  value={teacherForm.name}
                  onChange={e => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  placeholder="e.g. Mr. Eric Bautista"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#17365D]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Teacher Email Address *</label>
                <input
                  type="email"
                  required
                  value={teacherForm.email}
                  onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value })}
                  placeholder="ebautista@writewise.demo"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#17365D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Grade Levels Taught</label>
                  <input
                    type="text"
                    value={teacherForm.gradeLevel}
                    onChange={e => setTeacherForm({ ...teacherForm, gradeLevel: e.target.value })}
                    placeholder="e.g. Grade 11 & 12"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#17365D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Assigned Section / Advisorship</label>
                  <input
                    type="text"
                    value={teacherForm.section}
                    onChange={e => setTeacherForm({ ...teacherForm, section: e.target.value })}
                    placeholder="e.g. STEM B & HUMSS A"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#17365D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">DepEd Employee ID</label>
                  <input
                    type="text"
                    value={teacherForm.studentIdNumber}
                    onChange={e => setTeacherForm({ ...teacherForm, studentIdNumber: e.target.value })}
                    placeholder="EMP-2024-..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#17365D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Department / Strand</label>
                  <input
                    type="text"
                    value={teacherForm.strand}
                    onChange={e => setTeacherForm({ ...teacherForm, strand: e.target.value })}
                    placeholder="Senior High Research Dept"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#17365D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Professional Bio / Specialty</label>
                <textarea
                  rows={2}
                  value={teacherForm.bio}
                  onChange={e => setTeacherForm({ ...teacherForm, bio: e.target.value })}
                  placeholder="Specialization in Qualitative/Quantitative research..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#17365D]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Initial Password</label>
                <input
                  type="text"
                  value={teacherForm.password}
                  onChange={e => setTeacherForm({ ...teacherForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:border-[#17365D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Add Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: ADD SECTION & GRADE LEVEL                            */}
      {/* ------------------------------------------------------------- */}
      {isAddSectionOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#17365D]/10 text-[#17365D] rounded-xl">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-serif">Create New Section & Grade Level</h3>
                  <p className="text-[11px] text-slate-400">Sets up a class cohort for student enrollment and research advising</p>
                </div>
              </div>
              <button onClick={() => setIsAddSectionOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSectionSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Grade Level *</label>
                  <select
                    value={sectionForm.gradeLevel}
                    onChange={e => setSectionForm({ ...sectionForm, gradeLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#17365D]"
                  >
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Section Name *</label>
                  <input
                    type="text"
                    required
                    value={sectionForm.sectionName}
                    onChange={e => setSectionForm({ ...sectionForm, sectionName: e.target.value })}
                    placeholder="e.g. STEM C or Rizal"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#17365D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Academic Strand</label>
                <select
                  value={sectionForm.strand}
                  onChange={e => setSectionForm({ ...sectionForm, strand: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#17365D]"
                >
                  <option value="Science, Technology, Engineering, and Mathematics (STEM)">STEM — Science, Tech, Engg & Math</option>
                  <option value="Humanities and Social Sciences (HUMSS)">HUMSS — Humanities & Social Sciences</option>
                  <option value="Accountancy, Business, and Management (ABM)">ABM — Accountancy, Business & Management</option>
                  <option value="General Academic Strand (GAS)">GAS — General Academic Strand</option>
                  <option value="Technical-Vocational-Livelihood (TVL) - ICT">TVL — Information & Communications Tech</option>
                  <option value="Technical-Vocational-Livelihood (TVL) - Home Economics">TVL — Home Economics</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Research Adviser</label>
                  <input
                    type="text"
                    value={sectionForm.adviserName}
                    onChange={e => setSectionForm({ ...sectionForm, adviserName: e.target.value })}
                    placeholder="Mrs. Maria Santos"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#17365D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Classroom / Laboratory</label>
                  <input
                    type="text"
                    value={sectionForm.room}
                    onChange={e => setSectionForm({ ...sectionForm, room: e.target.value })}
                    placeholder="Room 304 - Science Wing"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#17365D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Schedule</label>
                <input
                  type="text"
                  value={sectionForm.schedule}
                  onChange={e => setSectionForm({ ...sectionForm, schedule: e.target.value })}
                  placeholder="MWF 8:00 AM - 10:00 AM"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#17365D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSectionOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#17365D] hover:bg-[#112643] text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: EDIT USER                                            */}
      {/* ------------------------------------------------------------- */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 font-serif">Edit User: {editingUser.name}</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#17365D]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#17365D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">LRN / ID</label>
                  <input
                    type="text"
                    value={editingUser.studentIdNumber || ''}
                    onChange={e => setEditingUser({ ...editingUser, studentIdNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Grade Level</label>
                  <select
                    value={editingUser.gradeLevel || 'Grade 11'}
                    onChange={e => setEditingUser({ ...editingUser, gradeLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none"
                  >
                    {availableGradeLevels.map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                    <option value="Senior High Faculty">Senior High Faculty</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Section</label>
                  <input
                    type="text"
                    value={editingUser.section || ''}
                    onChange={e => setEditingUser({ ...editingUser, section: e.target.value })}
                    placeholder="e.g. STEM A"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {editingUser.role === 'student' && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Scaffolding Assistance Track</label>
                  <select
                    value={editingUser.track || 'foundational'}
                    onChange={e => setEditingUser({ ...editingUser, track: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="foundational">Foundational Track</option>
                    <option value="advanced">Advanced Track</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#17365D] text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 5: EDIT SECTION                                         */}
      {/* ------------------------------------------------------------- */}
      {editingSection && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 font-serif">Edit Section: {editingSection.sectionName}</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSectionSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Grade Level</label>
                  <select
                    value={editingSection.gradeLevel}
                    onChange={e => setEditingSection({ ...editingSection, gradeLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Section Name</label>
                  <input
                    type="text"
                    required
                    value={editingSection.sectionName}
                    onChange={e => setEditingSection({ ...editingSection, sectionName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Strand</label>
                <input
                  type="text"
                  value={editingSection.strand}
                  onChange={e => setEditingSection({ ...editingSection, strand: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Research Adviser</label>
                  <input
                    type="text"
                    value={editingSection.adviserName || ''}
                    onChange={e => setEditingSection({ ...editingSection, adviserName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Room / Location</label>
                  <input
                    type="text"
                    value={editingSection.room || ''}
                    onChange={e => setEditingSection({ ...editingSection, room: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#17365D] text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 6: ASSIGN STUDENT SECTION & GRADE LEVEL                 */}
      {/* ------------------------------------------------------------- */}
      {assigningStudent && (() => {
        const matchingSec = sectionsList.find(s => s.gradeLevel === assignGradeLevel && s.sectionName === assignSectionName);

        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fade-in max-h-[90vh] overflow-y-auto font-sans">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 font-serif">Assign Section & Grade Level</h3>
                    <p className="text-[11px] text-slate-400">Institutional Curriculum & Roster Placement</p>
                  </div>
                </div>
                <button onClick={() => setAssigningStudent(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmAssignment} className="space-y-3.5 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student Researcher</span>
                  <span className="text-sm font-bold text-slate-900 block">{assigningStudent.name}</span>
                  <span className="text-[11px] text-slate-500">
                    Current Placement: <strong className="text-slate-700">{assigningStudent.currentGrade}</strong> • <strong className="text-slate-700">{assigningStudent.currentSection}</strong>
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider block">Target Grade Level *</label>
                  <select
                    value={assignGradeLevel}
                    onChange={(e) => {
                      const newGrade = e.target.value;
                      setAssignGradeLevel(newGrade);
                      const firstSec = sectionsList.find(s => s.gradeLevel === newGrade);
                      if (firstSec) setAssignSectionName(firstSec.sectionName);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium text-slate-800 focus:outline-none focus:border-[#17365D] cursor-pointer"
                  >
                    {availableGradeLevels.map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider block">Target Class Section *</label>
                  <select
                    value={assignSectionName}
                    onChange={(e) => setAssignSectionName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium text-slate-800 focus:outline-none focus:border-[#17365D] cursor-pointer"
                  >
                    {sectionsList
                      .filter(s => s.gradeLevel === assignGradeLevel)
                      .map(sec => (
                        <option key={sec.id} value={sec.sectionName}>
                          {sec.sectionName} — {sec.strand} {sec.adviserName ? `(Adviser: ${sec.adviserName})` : ''}
                        </option>
                      ))}
                    <option value="custom">Other / Custom Section...</option>
                  </select>
                </div>

                {assignSectionName === 'custom' && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase tracking-wider block">Custom Section Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. STEM C or Mabini"
                      value={assignCustomSection}
                      onChange={(e) => setAssignCustomSection(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#17365D]"
                    />
                  </div>
                )}

                {matchingSec && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-950 font-bold">{matchingSec.gradeLevel} - {matchingSec.sectionName}</span>
                      <span className="text-emerald-700 font-mono text-[10px]">{matchingSec.room || 'Room 304'}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      <strong>Strand:</strong> {matchingSec.strand}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      <strong>Research Adviser:</strong> {matchingSec.adviserName || 'Mrs. Maria Santos'}
                    </p>
                    {matchingSec.schedule && (
                      <p className="text-[10px] text-slate-500">
                        <strong>Schedule:</strong> {matchingSec.schedule}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAssigningStudent(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                  >
                    Confirm & Save Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 7: SECTION COHORT STUDENT ENROLLMENT (SECTION CARD)     */}
      {/* ------------------------------------------------------------- */}
      {isSectionEnrollModalOpen && (() => {
        const targetSec = isSectionEnrollModalOpen;
        const allStudents = usersList.filter(u => u.role === 'student');
        const enrolledStudents = allStudents.filter(s => s.section === targetSec.sectionName && s.gradeLevel === targetSec.gradeLevel);
        const otherStudents = allStudents.filter(s => !(s.section === targetSec.sectionName && s.gradeLevel === targetSec.gradeLevel));

        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fade-in max-h-[90vh] overflow-y-auto font-sans">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#17365D]/10 text-[#17365D] rounded-xl">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 font-serif">
                      Manage Roster: {targetSec.gradeLevel} - {targetSec.sectionName}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Adviser: {targetSec.adviserName || 'Unassigned'} • Room: {targetSec.room || 'Room 304'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsSectionEnrollModalOpen(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Section Details Summary */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">{targetSec.strand}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                    {enrolledStudents.length} Students Currently Enrolled
                  </span>
                </div>
                {targetSec.schedule && (
                  <p className="text-[11px] text-slate-500">
                    Schedule: {targetSec.schedule}
                  </p>
                )}
              </div>

              {/* Currently Enrolled List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Enrolled Students in this Section ({enrolledStudents.length})
                </h4>
                {enrolledStudents.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                    No students currently assigned to this section. Use the list below to assign learners.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    {enrolledStudents.map(st => (
                      <div key={st.id} className="p-2.5 bg-white flex items-center justify-between text-xs hover:bg-slate-50">
                        <div>
                          <span className="font-bold text-slate-800 block">{st.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{st.studentIdNumber || st.email}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          st.track === 'advanced' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {st.track || 'foundational'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assign Other Students into this Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Assign Students to {targetSec.sectionName}
                </h4>
                {otherStudents.length === 0 ? (
                  <div className="p-3 bg-emerald-50 rounded-xl text-center text-xs text-emerald-800">
                    All students are already enrolled in this section!
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    {otherStudents.map(st => (
                      <div key={st.id} className="p-2.5 bg-white flex items-center justify-between text-xs hover:bg-slate-50">
                        <div>
                          <span className="font-bold text-slate-800 block">{st.name}</span>
                          <span className="text-[10px] text-slate-500">
                            Currently: {st.gradeLevel || 'Grade 11'} - {st.section || 'Unassigned'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleEnrollStudentToSection(st.id, targetSec)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Assign Here</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSectionEnrollModalOpen(null)}
                  className="px-4 py-2 bg-[#17365D] hover:bg-[#112643] text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
