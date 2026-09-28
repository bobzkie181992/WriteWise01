/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UserProfile Component
 * 
 * Comprehensive Information Profile for WriteWise students and teachers.
 * Features:
 * - Full Academic & Personal Information Profile display
 * - In-place Profile Editing with live validation
 * - Secure Password Change with strength checker & confirmation
 * - Synchronized across papers, rosters, and exports
 */

import React, { useState } from 'react';
import { useWriteWise } from '../WriteWiseContext';
import { 
  User as UserIcon, 
  Mail, 
  School, 
  BookOpen, 
  Shield, 
  Lock, 
  KeyRound, 
  Edit3, 
  Check, 
  X, 
  Phone, 
  GraduationCap, 
  Calendar, 
  Award, 
  Eye, 
  EyeOff, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface UserProfileProps {
  onNavigateToWorkspace?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onNavigateToWorkspace }) => {
  const { state, updateUserProfile, changePassword, showToast } = useWriteWise();
  const user = state.currentUser;

  // Active view tab: 'overview' | 'edit' | 'password'
  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'password'>('overview');

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    gradeLevel: user?.gradeLevel || (user?.role === 'student' ? 'Grade 11' : 'Senior High Department'),
    section: user?.section || (user?.role === 'student' ? 'STEM A' : 'Practical Research Lead'),
    strand: user?.strand || 'Science, Technology, Engineering, and Mathematics (STEM)',
    studentIdNumber: user?.studentIdNumber || (user?.role === 'student' ? 'LRN-109482910394' : 'EMP-2018-0492'),
    schoolName: user?.schoolName || 'Batangas National High School - Senior High Department',
    bio: user?.bio || (user?.role === 'student' 
      ? 'Senior High School student specializing in STEM. Currently conducting practical research on digital distraction and student attention span during blended learning.'
      : 'DepEd Senior High School Practical Research Master Teacher and Research Coordinator.')
  });

  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  if (!user) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-sm max-w-xl mx-auto my-8">
        <UserIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-700">No Active Session Found</h3>
        <p className="text-xs text-slate-500 mt-1">Please sign in to view and manage your profile information.</p>
      </div>
    );
  }

  // Get active student paper if user is a student
  const studentPaper = state.papers.find(p => p.studentId === user.id) || state.papers[0];

  // Helper for password strength calculation
  const getPasswordStrength = (pwd: string): { label: string; score: number; color: string } => {
    if (!pwd) return { label: 'None', score: 0, color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { label: 'Weak', score: 25, color: 'bg-red-500' };
    if (score === 3) return { label: 'Fair', score: 50, color: 'bg-amber-500' };
    if (score === 4) return { label: 'Good', score: 75, color: 'bg-blue-500' };
    return { label: 'Strong', score: 100, color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(passwordForm.newPassword);

  // Handle Edit Form Submission
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!editForm.name.trim()) {
      errors.name = 'Full name is required';
    }
    if (!editForm.schoolName.trim()) {
      errors.schoolName = 'School name is required';
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setIsSubmittingEdit(true);
    setEditErrors({});

    setTimeout(() => {
      updateUserProfile({
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        gradeLevel: editForm.gradeLevel.trim(),
        section: editForm.section.trim(),
        strand: editForm.strand.trim(),
        studentIdNumber: editForm.studentIdNumber.trim(),
        schoolName: editForm.schoolName.trim(),
        bio: editForm.bio.trim()
      });

      setIsSubmittingEdit(false);
      setActiveTab('overview');
    }, 300);
  };

  // Handle Password Change Submission
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordError('New password cannot be the same as your current password.');
      return;
    }

    setIsSubmittingPassword(true);

    setTimeout(() => {
      const result = changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setIsSubmittingPassword(false);

      if (result.success) {
        setPasswordSuccess('Your password has been updated successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPasswordError(result.message);
      }
    }, 400);
  };

  // Formatted date helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Not yet modified';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans pb-12 animate-fade-in">
      
      {/* Profile Header Banner Card */}
      <div className="bg-gradient-to-r from-[#17365D] via-[#1c4273] to-[#1F8A8A] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Initials Avatar Box */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white text-[#17365D] flex items-center justify-center font-serif text-2xl sm:text-3xl font-bold shadow-lg border-2 border-white/20 shrink-0">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'WW'}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight">
                  {user.name}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                  {user.role}
                </span>
                {user.role === 'student' && studentPaper && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/25 text-emerald-200 border border-emerald-300/30">
                    {studentPaper.track} Track
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-200 flex items-center gap-1.5 font-sans">
                <Mail className="h-3.5 w-3.5 opacity-80" />
                {user.email}
              </p>

              <p className="text-xs text-slate-300 flex items-center gap-1.5 font-sans">
                <School className="h-3.5 w-3.5 opacity-80" />
                {user.schoolName || editForm.schoolName}
              </p>
            </div>
          </div>

          {/* Quick Tab Selector in Header */}
          <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-white text-[#17365D] shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Information Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'edit'
                  ? 'bg-white text-[#17365D] shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('password')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'password'
                  ? 'bg-white text-[#17365D] shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Change Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW / INFORMATION PROFILE                          */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column (8 cols): Detailed Academic & Personal Fields */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Academic Information Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#17365D]/10 text-[#17365D] rounded-lg">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 font-serif">Academic Identity & Classification</h2>
                    <p className="text-[11px] text-slate-400">Institutional and DepEd Senior High School records</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('edit')}
                  className="text-xs font-bold text-[#17365D] hover:underline flex items-center gap-1"
                >
                  <Edit3 className="h-3 w-3" /> Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Full Legal Name
                  </span>
                  <span className="font-semibold text-slate-800 text-sm">{user.name}</span>
                </div>

                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {user.role === 'student' ? 'Learner Reference Number (LRN)' : 'DepEd Employee ID'}
                  </span>
                  <span className="font-semibold text-slate-800 text-sm font-mono">
                    {user.studentIdNumber || editForm.studentIdNumber}
                  </span>
                </div>

                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Grade Level & Section
                  </span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {user.gradeLevel || editForm.gradeLevel} — {user.section || editForm.section}
                  </span>
                </div>

                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Senior High Track & Strand
                  </span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {user.strand || editForm.strand}
                  </span>
                </div>

                <div className="sm:col-span-2 p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Educational Institution
                  </span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {user.schoolName || editForm.schoolName}
                  </span>
                </div>
              </div>
            </div>

            {/* Research Paper Status Card (For Students) */}
            {user.role === 'student' && studentPaper && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#1F8A8A]/10 text-[#1F8A8A] rounded-lg">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 font-serif">Current Practical Research Project</h2>
                      <p className="text-[11px] text-slate-400">Formal paper enrolled under DepEd curriculum</p>
                    </div>
                  </div>

                  {onNavigateToWorkspace && (
                    <button
                      onClick={onNavigateToWorkspace}
                      className="text-xs font-bold text-[#1F8A8A] hover:underline flex items-center gap-1"
                    >
                      Open Workspace &rarr;
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-blue-50/40 border border-blue-100 rounded-xl">
                    <span className="text-[10px] font-bold text-[#17365D] uppercase tracking-wider block">
                      Assigned Research Paper Title
                    </span>
                    <p className="text-xs font-serif font-bold text-slate-900 mt-1">
                      &quot;{studentPaper.title}&quot;
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Assistance Track</span>
                      <span className="font-bold text-slate-800 uppercase tracking-wide">
                        {studentPaper.track}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Progress</span>
                      <span className="font-bold text-emerald-700">
                        {studentPaper.progress}% Complete
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Research Advisor</span>
                      <span className="font-bold text-slate-800">
                        Mrs. Maria Santos
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Academic Biography & Research Interests */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-800 font-serif">Academic Biography & Research Focus</h3>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                {user.bio || editForm.bio}
              </p>
            </div>

          </div>

          {/* Right Column (4 cols): Account Security & Meta Summary */}
          <div className="md:col-span-4 space-y-6">
            
            {/* Account Security Widget */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Shield className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Account Security</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Password Status</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                    <CheckCircle2 className="h-3 w-3" /> Active & Protected
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Last Changed</span>
                  <span className="font-mono text-slate-600 text-[11px]">
                    {formatDate(user.passwordLastChanged)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Member Since</span>
                  <span className="font-mono text-slate-600 text-[11px]">
                    {formatDate(user.createdAt || '2026-06-01T08:00:00Z')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('password')}
                className="w-full py-2.5 px-3 bg-[#17365D]/5 hover:bg-[#17365D]/10 text-[#17365D] border border-[#17365D]/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Update Password</span>
              </button>
            </div>

            {/* Contact Details Widget */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Phone className="h-4 w-4 text-[#17365D]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Contact Channels</h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Official Email</span>
                  <span className="font-medium text-slate-800">{user.email}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Contact Number</span>
                  <span className="font-medium text-slate-800">{user.phone || editForm.phone}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('edit')}
                className="w-full py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all text-center"
              >
                Edit Contact Info
              </button>
            </div>

            {/* DepEd K-12 Compliance Badge */}
            <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200/70 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <Award className="h-4 w-4 text-[#17365D]" />
                <span>DepEd Senior High School</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Profile records are calibrated for Practical Research 1 (Qualitative) and Practical Research 2 (Quantitative) competencies.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: EDIT PROFILE FORM                                       */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'edit' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800 font-serif">Edit Information Profile</h2>
              <p className="text-xs text-slate-500">Update your academic classification, contact info, and bio.</p>
            </div>

            <button
              onClick={() => setActiveTab('overview')}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-800 focus:outline-none transition-all ${
                  editErrors.name 
                    ? 'border-red-400 focus:ring-2 focus:ring-red-200' 
                    : 'border-slate-300 focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10'
                }`}
                placeholder="e.g. Alex Marasigan"
              />
              {editErrors.name && (
                <p className="text-[11px] text-red-500 mt-1 font-semibold">{editErrors.name}</p>
              )}
            </div>

            {/* Grid for LRN and Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {user.role === 'student' ? 'Learner Reference Number (LRN)' : 'Employee ID'}
                </label>
                <input
                  type="text"
                  value={editForm.studentIdNumber}
                  onChange={e => setEditForm({ ...editForm, studentIdNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10 focus:outline-none"
                  placeholder="e.g. LRN-109482910394"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact / Mobile Number
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10 focus:outline-none"
                  placeholder="e.g. +63 917 555 4321"
                />
              </div>
            </div>

            {/* Grid for Grade Level and Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Grade Level
                </label>
                <select
                  value={editForm.gradeLevel}
                  onChange={e => setEditForm({ ...editForm, gradeLevel: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10 focus:outline-none bg-white"
                >
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                  <option value="Faculty / Teacher">Faculty / Teacher</option>
                  <option value="Research Coordinator">Research Coordinator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Section Name
                </label>
                <input
                  type="text"
                  value={editForm.section}
                  onChange={e => setEditForm({ ...editForm, section: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10 focus:outline-none"
                  placeholder="e.g. STEM A, Rizal, Mabini"
                />
              </div>
            </div>

            {/* Senior High School Strand */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Senior High School Academic Strand
              </label>
              <select
                value={editForm.strand}
                onChange={e => setEditForm({ ...editForm, strand: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10 focus:outline-none bg-white"
              >
                <option value="Science, Technology, Engineering, and Mathematics (STEM)">
                  STEM — Science, Technology, Engineering, and Mathematics
                </option>
                <option value="Accountancy, Business, and Management (ABM)">
                  ABM — Accountancy, Business, and Management
                </option>
                <option value="Humanities and Social Sciences (HUMSS)">
                  HUMSS — Humanities and Social Sciences
                </option>
                <option value="General Academic Strand (GAS)">
                  GAS — General Academic Strand
                </option>
                <option value="Technical-Vocational-Livelihood (TVL) - ICT">
                  TVL — Information and Communications Technology (ICT)
                </option>
                <option value="Technical-Vocational-Livelihood (TVL) - Home Economics">
                  TVL — Home Economics (HE)
                </option>
                <option value="Senior High School Faculty">
                  Senior High School Faculty
                </option>
              </select>
            </div>

            {/* School Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                School / Institution Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.schoolName}
                onChange={e => setEditForm({ ...editForm, schoolName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10 focus:outline-none"
                placeholder="e.g. Batangas National High School - Senior High Department"
              />
            </div>

            {/* Academic Bio / Research Interests */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Academic Biography & Research Focus
              </label>
              <textarea
                rows={3}
                value={editForm.bio}
                onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10 focus:outline-none leading-relaxed resize-y"
                placeholder="Brief summary of your academic interests and research topic..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmittingEdit}
                className="px-5 py-2.5 bg-[#17365D] hover:bg-[#112643] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>{isSubmittingEdit ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: CHANGE PASSWORD PANEL                                  */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 max-w-xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 font-serif">Change Account Password</h2>
                <p className="text-xs text-slate-500">Protect your academic work and student credentials</p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('overview')}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Feedback messages */}
          {passwordError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10 focus:outline-none"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Default sandbox password for demo accounts is: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-600">password123</code>
              </p>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10 focus:outline-none"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              {passwordForm.newPassword.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">Strength:</span>
                    <span className="font-bold text-slate-700">{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${strength.color}`} 
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10 focus:outline-none"
                  placeholder="Re-type new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {passwordForm.confirmPassword && passwordForm.newPassword && (
                <p className={`text-[10px] mt-1 font-semibold flex items-center gap-1 ${
                  passwordForm.confirmPassword === passwordForm.newPassword ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {passwordForm.confirmPassword === passwordForm.newPassword ? (
                    <><Check className="h-3 w-3" /> Passwords match</>
                  ) : (
                    <><X className="h-3 w-3" /> Passwords do not match</>
                  )}
                </p>
              )}
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 leading-relaxed">
              <strong>Security Recommendation:</strong> Use a combination of uppercase letters, numbers, and symbols. Never share your WriteWise password with fellow classmates.
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmittingPassword || !passwordForm.newPassword || !passwordForm.currentPassword}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>{isSubmittingPassword ? 'Updating Password...' : 'Save New Password'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
