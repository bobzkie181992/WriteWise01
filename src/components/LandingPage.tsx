/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useWriteWise } from '../WriteWiseContext';
import { 
  BookOpen, 
  CheckCircle, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Shield, 
  Layers, 
  HelpCircle, 
  School, 
  Compass, 
  Check, 
  Award, 
  AlertCircle,
  X,
  FileText
} from 'lucide-react';
import { LearningTrack } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { NetworkStatusIndicator } from './NetworkStatusIndicator';

interface LandingPageProps {
  onSuccess: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSuccess }) => {
  const { state, login, register } = useWriteWise();
  
  // Tab Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Credentials State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Registration State
  const [registerName, setRegisterName] = useState('');
  const [registerRole, setRegisterRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [registerGradeLevel, setRegisterGradeLevel] = useState('Grade 11');
  const [registerSection, setRegisterSection] = useState('STEM A');
  const [registerTrack, setRegisterTrack] = useState<LearningTrack>('foundational');

  // Modals & Active Visual Tabs in Hero
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [activePathwayStep, setActivePathwayStep] = useState(0);

  const sectionsList = state.sections || [];
  const availableGradeLevels = useMemo(() => {
    const set = new Set(['Grade 11', 'Grade 12']);
    sectionsList.forEach(s => {
      if (s.gradeLevel) set.add(s.gradeLevel);
    });
    return Array.from(set);
  }, [sectionsList]);

  // Section options matching the selected grade level
  const sectionsForGrade = useMemo(() => {
    return sectionsList.filter(s => s.gradeLevel === registerGradeLevel);
  }, [sectionsList, registerGradeLevel]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your institutional email or username.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const isStudent = cleanEmail === 'student@writewise.demo';
      const isTeacher = cleanEmail === 'teacher@writewise.demo';
      const isAdmin = cleanEmail === 'admin@writewise.demo';

      if (isAdmin) {
        login(cleanEmail, 'admin');
        setIsLoading(false);
        onSuccess();
      } else if (isTeacher) {
        login(cleanEmail, 'teacher');
        setIsLoading(false);
        onSuccess();
      } else if (isStudent) {
        login(cleanEmail, 'student');
        setIsLoading(false);
        onSuccess();
      } else {
        // Dynamic match against registered user accounts
        const userMatch = (state.users || []).find(u => u.email.toLowerCase() === cleanEmail);
        const resolvedRole = userMatch?.role === 'admin' ? 'admin' : userMatch?.role === 'teacher' ? 'teacher' : 'student';
        const success = login(cleanEmail, resolvedRole);
        setIsLoading(false);
        if (success) {
          onSuccess();
        } else {
          setError('Invalid institutional credentials. Please verify your email and password, or use one of the interactive demo accounts.');
        }
      }
    }, 250);
  };

  const handleDemoLogin = (role: 'student' | 'teacher' | 'admin') => {
    setIsLoading(true);
    const demoEmail = role === 'student' 
      ? 'student@writewise.demo' 
      : role === 'teacher' 
      ? 'teacher@writewise.demo' 
      : 'admin@writewise.demo';

    setTimeout(() => {
      login(demoEmail, role);
      setIsLoading(false);
      onSuccess();
    }, 150);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!registerName.trim() || !email.trim() || !password) {
      setError('All required fields must be completed.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const formattedSection = registerRole === 'student' 
        ? (registerSection.includes(registerGradeLevel) ? registerSection : `${registerGradeLevel} - ${registerSection}`)
        : 'Senior High Faculty';

      register(registerName.trim(), cleanEmail, registerRole, registerGradeLevel, formattedSection);
      setIsLoading(false);
      onSuccess();
    }, 300);
  };

  const pathwaySteps = [
    {
      num: '01',
      title: 'Problem & Inquiry Plan',
      tag: 'Metacognitive Baseline',
      desc: 'Formulate research questions and set hypothesis parameters aligned with DepEd PR 1 & 2 competencies.'
    },
    {
      num: '02',
      title: 'Literature Synthesis',
      tag: 'Tiered Scaffolding',
      desc: 'Organize citation matrices and synthesize peer-reviewed evidence without copying verbatim texts.'
    },
    {
      num: '03',
      title: 'Predictive Autocomplete',
      tag: 'Academic Tone Assistant',
      desc: 'Accept granular vocabulary and sentence-level transitions while preserving full student authorship.'
    },
    {
      num: '04',
      title: 'Originality & Traceability',
      tag: 'Defensible Verification',
      desc: 'Audit writing process metrics, verify citation sources, and generate submission-ready formal papers.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-[#1F8A8A]/20 text-slate-800">
      
      {/* 1. Global Navigation Bar */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-4 bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#17365D] to-[#1F8A8A] text-white rounded-xl shadow-xs">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#17365D] font-serif block leading-none">
              WRITEWISE
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#1F8A8A] mt-0.5 block">
              Tiered Academic Writing Scaffolder
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
          <NetworkStatusIndicator />
          <PWAInstallButton variant="header" />
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700">
            <School className="h-3.5 w-3.5 text-[#17365D]" />
            <span>DepEd Senior High Practical Research 1 & 2</span>
          </div>
          <span className="text-slate-300 hidden sm:inline" aria-hidden="true">|</span>
          <span className="font-mono text-[11px] text-slate-500 font-medium">S.Y. 2026-2027</span>
        </div>
      </header>

      {/* 2. Main Content Split Stage */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* Left Editorial Hero (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#0B1B32] via-[#122B4D] to-[#17365D] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle image overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-20 pointer-events-none" 
            style={{ backgroundImage: `url('/src/assets/images/writewise_landing_hero_1790229019923.jpg')` }}
          />

          {/* Decorative Glow */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#1F8A8A]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#F4B942]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Hero Pitch */}
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-[#F4B942] text-xs font-bold tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5 text-[#F4B942]" />
              <span>Independent Academic Authorship</span>
            </div>

            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-serif font-bold text-white leading-tight tracking-tight">
              Think. Plan. Write. Revise. <br className="hidden sm:inline" />
              <span className="text-[#F4B942]">Own Your Work.</span>
            </h1>

            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-sans font-normal max-w-lg">
              A tiered scaffolding environment engineered for senior high school researchers. WriteWise guides student inquiry through structured chapters, real-time citation matrices, and balanced AI assistance—ensuring plagiarism-free, independently authored formal papers.
            </p>
          </div>

          {/* Interactive Pathway Steps */}
          <div className="relative z-10 my-8 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-white/10 text-xs">
              <span className="font-bold uppercase tracking-widest text-[#F4B942] text-[10px]">
                Four-Stage Research Scaffolding
              </span>
              <span className="text-[10px] text-slate-400">Curriculum Progression</span>
            </div>

            <div className="space-y-2">
              {pathwaySteps.map((step, idx) => {
                const isSelected = activePathwayStep === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePathwayStep(idx)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-white/15 border-[#F4B942]/60 shadow-xs backdrop-blur-xs' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md shrink-0 ${
                        isSelected ? 'bg-[#F4B942] text-slate-950' : 'bg-white/10 text-slate-300'
                      }`}>
                        {step.num}
                      </span>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{step.title}</span>
                          <span className="text-[9px] uppercase tracking-wider text-slate-300 font-medium">· {step.tag}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-normal font-sans">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Accreditation Badge */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#1F8A8A]" />
              <span>DepEd PR 1 & 2 Standards Verified</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">v2.4 LTS</span>
          </div>
        </div>

        {/* Right Authentication & Sandbox Stage (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
          
          <div className="w-full max-w-xl space-y-6">

            {/* Main Form Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-8 space-y-6">
              
              {/* Segmented Mode Switcher */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setError(''); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white text-[#17365D] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In to Account
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setError(''); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white text-[#17365D] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create New Account
                </button>
              </div>

              {/* Form Title */}
              <div className="space-y-1">
                <h2 className="text-xl font-serif font-bold text-slate-900">
                  {authMode === 'login' ? 'Institutional Sign In' : 'Create Researcher Account'}
                </h2>
                <p className="text-xs text-slate-500">
                  {authMode === 'login' 
                    ? 'Access your Practical Research draft workspace, citation matrix, and coaching tools.' 
                    : 'Register to begin your scaffolded senior high school research writing journey.'}
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* ----------------- SIGN IN FORM ----------------- */}
              {authMode === 'login' && (
                <form onSubmit={handleSignIn} className="space-y-4 text-xs font-sans">
                  
                  {/* Email Input */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase tracking-wider block" htmlFor="email-input">
                      Institutional Email / LRN
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        id="email-input"
                        required
                        placeholder="e.g. student@writewise.demo or student LRN"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10 transition-all bg-white"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-slate-700 uppercase tracking-wider block" htmlFor="password-input">
                        Account Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsForgotModalOpen(true)}
                        className="text-[11px] font-semibold text-[#1F8A8A] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password-input"
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10 transition-all bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-[#17365D] focus:ring-[#17365D]"
                      />
                      <span>Remember this workstation</span>
                    </label>

                    <span className="text-[11px] text-slate-400">Encrypted DepEd Session</span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#17365D] hover:bg-[#112643] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    {isLoading ? (
                      <span>Authenticating credentials...</span>
                    ) : (
                      <>
                        <span>Sign In to Writing Workspace</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                </form>
              )}

              {/* ----------------- REGISTRATION FORM ----------------- */}
              {authMode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4 text-xs font-sans">
                  
                  {/* Full Legal Name */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase tracking-wider block" htmlFor="reg-name">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        id="reg-name"
                        required
                        placeholder="e.g. Maria Clara Santos"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10 transition-all bg-white"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase tracking-wider block" htmlFor="reg-email">
                      Institutional Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        id="reg-email"
                        required
                        placeholder="e.g. mclara@deped.demo"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10 transition-all bg-white"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase tracking-wider block" htmlFor="reg-pwd">
                      Create Password (min. 6 characters) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="reg-pwd"
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#17365D] focus:ring-2 focus:ring-[#17365D]/10 transition-all bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Role Selector */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase tracking-wider block">
                      Select Academic Role *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegisterRole('student')}
                        className={`p-2.5 border rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          registerRole === 'student'
                            ? 'bg-[#17365D] text-white border-[#17365D] shadow-xs'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <User className="h-4 w-4" />
                        <span>Student</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegisterRole('teacher')}
                        className={`p-2.5 border rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          registerRole === 'teacher'
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <GraduationCap className="h-4 w-4" />
                        <span>Teacher</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegisterRole('admin')}
                        className={`p-2.5 border rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          registerRole === 'admin'
                            ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Shield className="h-4 w-4" />
                        <span>Admin</span>
                      </button>
                    </div>
                  </div>

                  {/* Student Specific Placement */}
                  {registerRole === 'student' && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 space-y-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Senior High Academic Placement
                      </span>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Grade Level</label>
                          <select
                            value={registerGradeLevel}
                            onChange={(e) => {
                              const newGrade = e.target.value;
                              setRegisterGradeLevel(newGrade);
                              const firstSec = sectionsList.find(s => s.gradeLevel === newGrade);
                              if (firstSec) setRegisterSection(firstSec.sectionName);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:outline-none focus:border-[#17365D]"
                          >
                            {availableGradeLevels.map(lvl => (
                              <option key={lvl} value={lvl}>{lvl}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Class Section</label>
                          <select
                            value={registerSection}
                            onChange={(e) => setRegisterSection(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:outline-none focus:border-[#17365D]"
                          >
                            {sectionsForGrade.map(sec => (
                              <option key={sec.id} value={sec.sectionName}>
                                {sec.sectionName} ({sec.strand.split(' ')[0]})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Initial Scaffolding Track</label>
                        <select
                          value={registerTrack}
                          onChange={(e) => setRegisterTrack(e.target.value as LearningTrack)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:outline-none focus:border-[#17365D]"
                        >
                          <option value="foundational">Foundational Support Track (Tiered Sentence Prompts)</option>
                          <option value="advanced">Advanced Challenge Track (Autonomous Synthesis)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Register Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#1F8A8A] hover:bg-[#177575] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    {isLoading ? (
                      <span>Creating academic account...</span>
                    ) : (
                      <>
                        <span>Complete Registration & Open Portal</span>
                        <CheckCircle className="h-4 w-4" />
                      </>
                    )}
                  </button>

                </form>
              )}

              {/* Bottom Mode Switch Link */}
              <div className="text-center pt-2 text-xs text-slate-500">
                {authMode === 'login' ? (
                  <span>
                    Need a new researcher account?{' '}
                    <button
                      type="button"
                      onClick={() => { setAuthMode('register'); setError(''); }}
                      className="text-[#1F8A8A] font-bold hover:underline cursor-pointer"
                    >
                      Register here
                    </button>
                  </span>
                ) : (
                  <span>
                    Already registered in the system?{' '}
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setError(''); }}
                      className="text-[#17365D] font-bold hover:underline cursor-pointer"
                    >
                      Sign In instead
                    </button>
                  </span>
                )}
              </div>

            </div>

            {/* Quick Sandbox Access Card (Placed at the bottom) */}
            <div className="bg-gradient-to-br from-slate-900 to-[#17365D] text-white rounded-2xl p-5 shadow-lg border border-slate-700/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#F4B942] text-slate-950 rounded-lg">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      Interactive Sandbox Demo Accounts
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Explore WriteWise from any user perspective with 1-click authentication
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full text-slate-200 font-mono font-medium">
                  Instant Access
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                
                {/* Student Demo Button */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin('student')}
                  disabled={isLoading}
                  className="p-3 bg-white/10 hover:bg-white/20 border border-white/15 hover:border-[#1F8A8A] rounded-xl text-left transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#F4B942]">Student</span>
                      <User className="h-3.5 w-3.5 text-slate-300 group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-bold text-white text-xs block">Alex Marasigan</span>
                    <span className="text-[10px] text-slate-300 block">Grade 11 STEM A</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-bold text-[#1F8A8A] group-hover:text-[#F4B942]">
                    <span>Enter Student View</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* Teacher Demo Button */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin('teacher')}
                  disabled={isLoading}
                  className="p-3 bg-white/10 hover:bg-white/20 border border-white/15 hover:border-[#1F8A8A] rounded-xl text-left transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Teacher</span>
                      <GraduationCap className="h-3.5 w-3.5 text-slate-300 group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-bold text-white text-xs block">Mrs. Maria Santos</span>
                    <span className="text-[10px] text-slate-300 block">Research Master Mentor</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-bold text-emerald-300 group-hover:text-white">
                    <span>Enter Teacher View</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* Admin Demo Button */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  disabled={isLoading}
                  className="p-3 bg-white/10 hover:bg-white/20 border border-white/15 hover:border-purple-400 rounded-xl text-left transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Administrator</span>
                      <Shield className="h-3.5 w-3.5 text-slate-300 group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-bold text-white text-xs block">Dr. Roberto Mendoza</span>
                    <span className="text-[10px] text-slate-300 block">Division Directorate</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-bold text-purple-300 group-hover:text-white">
                    <span>Enter Admin View</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

              </div>
            </div>

            {/* Trust and DepEd Standards Seal */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>FERPA & DepEd Privacy Compliant</span>
              </span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[#17365D]" />
                <span>SSL Encrypted</span>
              </span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-[#F4B942]" />
                <span>Grade 11 Practical Research</span>
              </span>
            </div>

          </div>

        </div>

      </main>

      {/* Forgot Password Helper Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fade-in font-sans">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-serif">Account Recovery & Demo Credentials</h3>
                  <p className="text-[11px] text-slate-400">Institutional Access Assistance</p>
                </div>
              </div>
              <button onClick={() => setIsForgotModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                For sandbox evaluation and prototype sessions, default credentials for all standard accounts are set to:
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 space-y-1">
                <div><strong>Default Password:</strong> <code className="text-[#17365D] font-bold">password123</code></div>
                <div><strong>Student Demo:</strong> student@writewise.demo</div>
                <div><strong>Teacher Demo:</strong> teacher@writewise.demo</div>
                <div><strong>Admin Demo:</strong> admin@writewise.demo</div>
              </div>

              <p className="text-[11px] text-slate-500">
                If you created a custom account and forgot your password, your research teacher or division administrator can reset it instantly from the <strong>User Directory</strong> tab.
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="px-4 py-2 bg-[#17365D] hover:bg-[#112643] text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
              >
                Close & Return to Sign In
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
