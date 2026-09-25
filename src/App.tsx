/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WriteWiseProvider, useWriteWise } from './WriteWiseContext';
import { LandingPage } from './components/LandingPage';
import { PreSurvey } from './components/PreSurvey';
import { StudentDashboard } from './components/StudentDashboard';
import { WritingWorkspace } from './components/WritingWorkspace';
import { ResearchSources } from './components/ResearchSources';
import { WritingSkills } from './components/WritingSkills';
import { StudentProgress } from './components/StudentProgress';
import { AIUseProfile } from './components/AIUseProfile';
import { Reflection } from './components/Reflection';
import { PostSurvey } from './components/PostSurvey';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AutocompletePlayground } from './components/AutocompletePlayground';
import { BookOpen, LogOut, LayoutDashboard, PenTool, BookMarked, Layers, Compass, ShieldCheck, FileSignature, Award, Settings, User, Menu, X, CheckCircle, AlertTriangle, Users, FileText, Shield, Sparkles } from 'lucide-react';

function WriteWiseAppContent() {
  const { state, logout, toasts, removeToast } = useWriteWise();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const user = state.currentUser;

  React.useEffect(() => {
    if (user && user.role === 'teacher') {
      const teacherTabs = ['roster', 'assignments', 'validations', 'competencies', 'analytics', 'autocomplete'];
      if (!teacherTabs.includes(activeTab)) {
        setActiveTab('roster');
      }
    }
  }, [user, activeTab]);
  
  // 1. Not Authenticated: Show Landing Page
  if (!user) {
    return <LandingPage onSuccess={() => setActiveTab('dashboard')} />;
  }

  // Find paper for student logged in
  const paper = state.papers.find(p => p.studentId === user.id) || state.papers[0];

  // 2. Student Role: Check Pre-Survey Requirement
  if (user.role === 'student' && (!paper || !paper.preSurvey)) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] py-8 px-4 flex items-center justify-center">
        <PreSurvey onComplete={() => setActiveTab('dashboard')} />
      </div>
    );
  }

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to log out and clear all local writing process state? This is useful for demo resets.')) {
      logout();
      localStorage.removeItem('writewise_state');
      window.location.reload();
    }
  };

  return (
    <div className={`min-h-screen bg-[#F7F9FC] flex flex-col font-sans text-slate-800 ${user.role === 'student' ? 'theme-student' : 'theme-teacher'}`}>
      {/* 3-Zone Global Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          {/* Hamburger button for smaller screens */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
          </button>

          <BookOpen className="h-6 w-6 text-[#17365D]" />
          <span className="text-lg sm:text-xl font-bold tracking-tight text-[#17365D] font-serif uppercase">WRITEWISE</span>
          <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#17365D]/10 text-[#17365D] uppercase tracking-wide">
            {user.role} workspace
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-800 block">{user.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {user.role === 'student' ? `Scaffolding: ${paper.track.toUpperCase()}` : user.email}
            </span>
          </div>
          
          <button
            onClick={() => logout()}
            className="px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1"
            title="Log out of current account"
          >
            <LogOut className="h-3.5 w-3.5" /> <span className="hidden xs:inline">Logout</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 border border-transparent rounded-lg transition-all text-xs font-semibold"
            title="Full Sandbox Reset & Logout (Clear all saved work)"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Main Body Grid Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden relative">
        
        {/* Backdrop for mobile drawer */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Navigation Sidebar Zone (3 cols) */}
        <aside className={`
          fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 p-4 space-y-6 z-40 transition-transform duration-300 transform 
          lg:static lg:translate-x-0 lg:w-auto lg:col-span-3 lg:z-auto lg:block
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-3">Workspace Portal</span>
            <div className="space-y-1">
              {user.role === 'student' ? (
                <>
                  <button
                    onClick={() => handleNavigate('dashboard')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'dashboard' ? 'bg-[#17365D] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50/50'}`}
                  >
                    <LayoutDashboard className="h-4 w-4 shrink-0" /> Dashboard
                  </button>
                  <button
                    onClick={() => handleNavigate('workspace')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'workspace' ? 'bg-[#17365D] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50/50'}`}
                  >
                    <PenTool className="h-4 w-4 shrink-0" /> Writing Workspace
                  </button>
                  <button
                    onClick={() => handleNavigate('sources')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'sources' ? 'bg-[#17365D] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50/50'}`}
                  >
                    <BookMarked className="h-4 w-4 shrink-0" /> Source Bank
                  </button>
                  <button
                    onClick={() => handleNavigate('skills')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'skills' ? 'bg-[#17365D] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50/50'}`}
                  >
                    <Layers className="h-4 w-4 shrink-0" /> Writing Modules
                  </button>
                  <button
                    onClick={() => handleNavigate('progress')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'progress' ? 'bg-[#17365D] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50/50'}`}
                  >
                    <Compass className="h-4 w-4 shrink-0" /> Progress & Efficacy
                  </button>
                  <button
                    onClick={() => handleNavigate('aiprofile')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'aiprofile' ? 'bg-[#17365D] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50/50'}`}
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0" /> AI Use Profile
                  </button>
                  <button
                    onClick={() => handleNavigate('reflection')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'reflection' ? 'bg-[#17365D] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50/50'}`}
                  >
                    <FileSignature className="h-4 w-4 shrink-0" /> Metacognitive Logs
                  </button>
                  <button
                    onClick={() => handleNavigate('postsurvey')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'postsurvey' ? 'bg-[#17365D] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50/50'}`}
                  >
                    <Award className="h-4 w-4 shrink-0" /> Finalized Paper
                  </button>
                  <button
                    onClick={() => handleNavigate('autocomplete')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'autocomplete' ? 'bg-[#17365D] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50/50'}`}
                  >
                    <Sparkles className="h-4 w-4 shrink-0 text-amber-400" /> Autocomplete Suite
                  </button>
                </>
              ) : (
                <>
                  {[
                    { id: 'roster', name: 'Class Roster & Tracks', icon: Users },
                    { id: 'assignments', name: 'Assignments & Rubrics', icon: FileText },
                    { id: 'validations', name: 'Expert Validation Register', icon: Shield },
                    { id: 'competencies', name: 'DepEd Competency Map', icon: Award },
                    { id: 'analytics', name: 'Research & Writing Analytics', icon: Compass },
                    { id: 'autocomplete', name: 'Intelligent Autocomplete', icon: Sparkles }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleNavigate(tab.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                          activeTab === tab.id
                            ? 'bg-[#17365D] text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50/50'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" /> {tab.name}
                      </button>
                    );
                  })}
                </>
              )}
            </div>

            <div className="space-y-1 pt-4 border-t border-slate-100 mt-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-3">Session Management</span>
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all text-slate-600 hover:bg-red-50 hover:text-red-600"
                title="Log out of current account"
              >
                <LogOut className="h-4 w-4 shrink-0" /> Logout
              </button>
            </div>
          </div>

          {/* Quick Info Box (No Slop, Unboxed) */}
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] text-slate-400 font-sans leading-relaxed">
            <span className="font-bold text-slate-600 block uppercase mb-1">K-12 Syllabus Map</span>
            WriteWise matches Grade 11 Practical Research competencies. Every prompt encourages independent authorial decisions.
          </div>
        </aside>

        {/* Primary Workspace Stage (9 cols) */}
        <main className="lg:col-span-9 p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-73px)]">
          
          {user.role === 'student' ? (
            <>
              {activeTab === 'dashboard' && <StudentDashboard onNavigate={handleNavigate} />}
              {activeTab === 'workspace' && <WritingWorkspace />}
              {activeTab === 'autocomplete' && <AutocompletePlayground onNavigateToWorkspace={() => handleNavigate('workspace')} />}
              {activeTab === 'sources' && <ResearchSources />}
              {activeTab === 'skills' && <WritingSkills />}
              {activeTab === 'progress' && <StudentProgress />}
              {activeTab === 'aiprofile' && <AIUseProfile />}
              {activeTab === 'reflection' && <Reflection />}
              {activeTab === 'postsurvey' && <PostSurvey />}
              {activeTab === 'settings' && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-xs font-sans space-y-4">
                  <h3 className="font-bold text-sm text-slate-800 font-serif border-b border-slate-100 pb-2">Support Track Settings</h3>
                  <p className="text-slate-600">Your writing support track is automatically set to <strong>{paper.track.toUpperCase()}</strong> based on your pre-survey writing confidence and habits.</p>
                  <p className="text-slate-500 leading-normal">If you feel you need different scaffolding parameters, please discuss with your teacher Mrs. Santos, who possesses authorization to promote or demote learning levels directly from the teacher interface.</p>
                  <button onClick={() => handleNavigate('dashboard')} className="px-4 py-2 bg-[#17365D] text-white font-semibold rounded shadow-sm hover:bg-[#112643]">Return to Dashboard</button>
                </div>
              )}
            </>
          ) : (
            activeTab === 'autocomplete' ? (
              <AutocompletePlayground />
            ) : (
              <TeacherDashboard activeTab={activeTab} />
            )
          )}

        </main>
      </div>

      {/* Floating Toast Notification Overlay */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-lg flex items-start gap-3 transition-all duration-300 animate-bounce-in ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              )}
            </div>
            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <WriteWiseProvider>
      <WriteWiseAppContent />
    </WriteWiseProvider>
  );
}
