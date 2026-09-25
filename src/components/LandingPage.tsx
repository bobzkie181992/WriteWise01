/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useWriteWise } from '../WriteWiseContext';
import { BookOpen, CheckCircle, ArrowRight, ShieldCheck, Lock, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onSuccess: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSuccess }) => {
  const { login, register } = useWriteWise();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerRole, setRegisterRole] = useState<'student' | 'teacher'>('student');
  const [registerName, setRegisterName] = useState('');
  const [registerSection, setRegisterSection] = useState('Grade 11 - STEM A');
  const [error, setError] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    // Simple demo auth
    const isStudent = email.trim().toLowerCase() === 'student@writewise.demo';
    const isTeacher = email.trim().toLowerCase() === 'teacher@writewise.demo';

    if (isStudent) {
      login(email, 'student');
      onSuccess();
    } else if (isTeacher) {
      login(email, 'teacher');
      onSuccess();
    } else {
      // Dynamic login for custom emails
      const success = login(email, 'student'); // Default to student login if unregistered
      if (success) {
        onSuccess();
      } else {
        setError('Incorrect email or password.');
      }
    }
  };

  const handleDemoLogin = (role: 'student' | 'teacher') => {
    const demoEmail = role === 'student' ? 'student@writewise.demo' : 'teacher@writewise.demo';
    login(demoEmail, role);
    onSuccess();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !email || !password) {
      setError('All fields are required.');
      return;
    }
    setError('');
    register(registerName, email, registerRole, '', registerSection);
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans selection:bg-[#1F8A8A]/20">
      {/* 1. Header Zone (Top Bar Contract) */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-[#17365D]" />
          <span className="text-xl font-bold tracking-tight text-[#17365D] font-serif">WRITEWISE</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="#about" className="hover:text-[#17365D] transition-colors">Philosophy</a>
          <a href="#scaffolding" className="hover:text-[#17365D] transition-colors">Scaffolding Pathway</a>
          <a href="#deped" className="hover:text-[#17365D] transition-colors">DepEd Alignment</a>
        </nav>
      </header>

      {/* 2. Main Content Split Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left column: Visionary / Scholarly Visual Pitch (5 cols) */}
        <div className="lg:col-span-5 bg-[#17365D] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden min-h-[400px] lg:min-h-0">
          {/* Subtle geometric overlay background */}
          <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-25" style={{ backgroundImage: `url('/src/assets/images/writewise_landing_hero_1790229019923.jpg')` }}></div>
          
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#F4B942] text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="h-3 w-3" /> Grade 11 Research Scaffolder
            </div>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
              Think. Plan. Write. Revise. Own Your Work.
            </h1>
            <p className="text-slate-200 text-sm leading-relaxed font-sans">
              This study aims to develop and evaluate <strong>WriteWise</strong>, a tiered scaffolding application for fostering independent, AI-balanced, and plagiarism-free formal paper writing among Grade 11 students. Our guided framework supports original authorship without relying on AI-generated block text.
            </p>
          </div>

          {/* Visual Pathway Map */}
          <div className="relative z-10 space-y-4 my-8">
            <h3 className="text-xs uppercase font-semibold text-[#F4B942] tracking-widest">The WriteWise Pathway</h3>
            <div className="space-y-3">
              {[
                { step: '1', name: 'PLAN', desc: 'Pre-survey & baseline diagnostics' },
                { step: '2', name: 'WRITE', desc: 'Guided section drafting & autocomplete' },
                { step: '3', name: 'CHECK', desc: 'Originality check & process assessment' },
                { step: '4', name: 'REVISE', desc: '"What to Do Next?" personalized coaching' },
                { step: '5', name: 'INDEPENDENT', desc: 'Finalized original formal paper & post-survey' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-[#F4B942]">
                    {item.step}
                  </div>
                  <div>
                    <span className="font-semibold text-xs tracking-wider text-white">{item.name}</span>
                    <p className="text-slate-300 text-xs font-sans leading-none mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 text-xs text-slate-400">
            © 2026 WriteWise. Built to align with DepEd K-12 Practical Research Competencies.
          </div>
        </div>

        {/* Right column: Beautiful Form (7 cols) */}
        <div className="lg:col-span-7 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-slate-200/80 p-8 space-y-6">
            <div className="space-y-1 text-center lg:text-left">
              <h2 className="text-2xl font-bold text-slate-900 font-serif">
                {isRegistering ? 'Create Your Account' : 'Welcome back'}
              </h2>
              <p className="text-sm text-slate-500">
                {isRegistering 
                  ? 'Sign up to start drafting your formal Grade 11 paper.' 
                  : 'Let’s continue building your writing independence.'}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium">
                {error}
              </div>
            )}

            {!isRegistering ? (
              <form onSubmit={handleSignIn} className="space-y-4 font-sans">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1" htmlFor="email">
                    Email / Username
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#1F8A8A] focus:ring-1 focus:ring-[#1F8A8A]"
                    placeholder="student@writewise.demo or teacher@writewise.demo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="block text-xs font-semibold uppercase text-slate-500" htmlFor="password">
                      Password
                    </label>
                    <a href="#forgot" className="text-xs text-[#1F8A8A] hover:underline" onClick={(e) => { e.preventDefault(); alert('For the prototype demo, please use the direct Student Demo or Teacher Demo buttons!'); }}>
                      Forgot Password?
                    </a>
                  </div>
                  <input
                    type="password"
                    id="password"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#1F8A8A] focus:ring-1 focus:ring-[#1F8A8A]"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#17365D] text-white text-sm font-semibold rounded-lg hover:bg-[#112643] transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  Sign In <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4 font-sans">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#1F8A8A] focus:ring-1 focus:ring-[#1F8A8A]"
                    placeholder="e.g. Alex Marasigan"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1" htmlFor="reg-email">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="reg-email"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#1F8A8A] focus:ring-1 focus:ring-[#1F8A8A]"
                    placeholder="student@writewise.demo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1" htmlFor="reg-password">
                    Password
                  </label>
                  <input
                    type="password"
                    id="reg-password"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#1F8A8A] focus:ring-1 focus:ring-[#1F8A8A]"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Select Your Role
                  </label>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => setRegisterRole('student')}
                      className={`py-2 px-3 text-xs font-semibold border rounded-lg transition-all flex items-center justify-center gap-2 ${registerRole === 'student' ? 'border-[#17365D] bg-slate-50 text-[#17365D]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      I am a Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterRole('teacher')}
                      className={`py-2 px-3 text-xs font-semibold border rounded-lg transition-all flex items-center justify-center gap-2 ${registerRole === 'teacher' ? 'border-[#17365D] bg-slate-50 text-[#17365D]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      I am a Teacher
                    </button>
                  </div>
                </div>

                {registerRole === 'student' && (
                  <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-lg space-y-1">
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1" htmlFor="reg-section">
                      Class Section
                    </label>
                    <input
                      type="text"
                      id="reg-section"
                      required
                      placeholder="e.g. Grade 11 - STEM A"
                      value={registerSection}
                      onChange={(e) => setRegisterSection(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-xs focus:outline-none focus:border-[#1F8A8A]"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1F8A8A] text-white text-sm font-semibold rounded-lg hover:bg-[#1a7575] transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  Create Account <CheckCircle className="h-4 w-4" />
                </button>
              </form>
            )}

            <div className="text-center text-xs font-sans text-slate-500 pt-2">
              {isRegistering ? (
                <span>
                  Already have an account?{' '}
                  <button onClick={() => setIsRegistering(false)} className="text-[#1F8A8A] font-semibold hover:underline">
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  Don’t have an account?{' '}
                  <button onClick={() => setIsRegistering(true)} className="text-[#1F8A8A] font-semibold hover:underline">
                    Create Account
                  </button>
                </span>
              )}
            </div>

            {/* Quick Demo Selector Card */}
            <div className="bg-[#F7F9FC] border border-slate-200/60 rounded-lg p-4 space-y-3.5 font-sans">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200/60 rounded text-[10px] text-emerald-800 leading-normal font-sans">
                <strong>Attention Effective Communication & Research Teachers:</strong>
                <p className="mt-0.5 font-normal">Receive a ready-to-use, curriculum-aligned digital tool for scaffolded, differentiated, and largely self-paced writing instruction.</p>
              </div>

              <span className="text-xs font-bold text-[#17365D] uppercase tracking-wider block text-center">Interactive Sandbox Accounts</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleDemoLogin('student')}
                  className="flex flex-col items-center p-2.5 bg-white hover:bg-[#F1F5F9] border border-slate-200 hover:border-[#1F8A8A] rounded-md transition-all text-center"
                >
                  <span className="font-bold text-[#17365D]">STUDENT DEMO</span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">student@writewise.demo</span>
                  <span className="text-[9px] bg-slate-100 text-[#17365D] font-bold px-1.5 py-0.5 rounded mt-1.5">Try Student View</span>
                </button>
                <button
                  onClick={() => handleDemoLogin('teacher')}
                  className="flex flex-col items-center p-2.5 bg-white hover:bg-[#F1F5F9] border border-slate-200 hover:border-[#17365D] rounded-md transition-all text-center"
                >
                  <span className="font-bold text-[#1F8A8A]">TEACHER DEMO</span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">teacher@writewise.demo</span>
                  <span className="text-[9px] bg-slate-100 text-[#1F8A8A] font-bold px-1.5 py-0.5 rounded mt-1.5">Try Teacher View</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
