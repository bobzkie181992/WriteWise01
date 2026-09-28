/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Paper, 
  Source, 
  Assignment, 
  CompetencyMapping, 
  ExpertValidation, 
  Rubric, 
  AppState, 
  LearningTrack, 
  PaperSection, 
  DraftVersion,
  SystemSettings,
  AuditLogEntry,
  GradeSection
} from './types';
import { 
  DEMO_STUDENT, 
  DEMO_TEACHER, 
  DEMO_ADMIN,
  INITIAL_USERS,
  INITIAL_SECTIONS,
  DEFAULT_SYSTEM_SETTINGS,
  INITIAL_AUDIT_LOGS,
  DEFAULT_ASSIGNMENTS, 
  DEFAULT_RUBRIC, 
  DEFAULT_COMPETENCIES, 
  DEFAULT_VALIDATIONS, 
  INITIAL_PAPERS, 
  INITIAL_SOURCES 
} from './sampleData';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'warning';
}

interface WriteWiseContextType {
  state: AppState;
  toasts: ToastMessage[];
  showToast: (message: string, type: 'success' | 'warning') => void;
  removeToast: (id: string) => void;
  login: (email: string, role?: 'student' | 'teacher' | 'admin') => boolean;
  register: (name: string, email: string, role: 'student' | 'teacher' | 'admin', grade?: string, section?: string) => void;
  logout: () => void;
  updateUserTrack: (studentId: string, track: LearningTrack) => void;
  updatePaperSection: (sectionId: string, content: string, status?: PaperSection['status']) => void;
  submitSectionForReview: (sectionId: string) => {
    similarityFlags: { text: string; source: string; suggestion: string }[];
    processIndicator: {
      studentDrafting: 'HIGH' | 'MODERATE' | 'LOW';
      suggestionsAccepted: 'HIGH' | 'MODERATE' | 'LOW';
      feedbackRequests: 'HIGH' | 'MODERATE' | 'LOW';
      directAIGen: 'NONE RECORDED' | 'MINIMAL DETECTED';
    };
    rubricEvaluation: { criterionId: string; rating: 'beginning' | 'developing' | 'proficient' | 'advanced'; feedback: string }[];
    whatToDoNext: string[];
    canMoveToNext: boolean;
  };
  addSource: (source: Omit<Source, 'id'>) => void;
  verifySource: (sourceId: string, verified: boolean) => void;
  addAssignment: (assignment: Assignment) => void;
  addValidation: (validation: Omit<ExpertValidation, 'id' | 'date'>) => void;
  savePreSurvey: (answers: Record<string, number>) => void;
  savePostSurvey: (answers: Record<string, number>) => void;
  saveReflection: (reflections: { planning: string; monitoring: string; reflection: string; evaluation: string; adaptation: string }) => void;
  getWordSuggestions: (text: string) => string[];
  acceptWordSuggestion: (sectionId: string) => void;
  triggerAIFeedbackRequest: (sectionId: string) => void;
  addStudent: (name: string, section: string, track: LearningTrack, gradeLevel?: string, strand?: string) => void;
  updateStudentName: (studentId: string, name: string) => void;
  updateStudentSection: (studentId: string, section: string, gradeLevel?: string, strand?: string) => void;
  assignStudentSection: (studentId: string, section: string, gradeLevel?: string, strand?: string) => void;
  assignGrade: (studentId: string, grade: number | string) => void;
  deleteStudent: (studentId: string) => void;
  addComment: (studentId: string, sectionId: string, text: string, highlightText?: string) => void;
  deleteComment: (studentId: string, commentId: string) => void;
  updateMatrixCell: (studentId: string, rowSourceId: string, columnTheme: string, active: boolean, note?: string) => void;
  updateUserProfile: (profileData: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => { success: boolean; message: string };
  // Admin Features
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  adminCreateUser: (userData: Partial<User>) => void;
  adminUpdateUser: (userId: string, data: Partial<User>) => void;
  adminDeleteUser: (userId: string) => void;
  adminResetPassword: (userId: string, newPassword?: string) => string;
  adminAddSection: (sectionData: Omit<GradeSection, 'id'>) => void;
  adminUpdateSection: (sectionId: string, data: Partial<GradeSection>) => void;
  adminDeleteSection: (sectionId: string) => void;
  addAuditLog: (action: string, category: AuditLogEntry['category'], details: string, status?: AuditLogEntry['status']) => void;
  clearAuditLogs: () => void;
  exportSystemData: () => string;
  importSystemData: (jsonData: string) => boolean;
  resetData: () => void;
  submitAssessmentScore: (assessmentId: string, score: number, total: number) => { xpEarned: number; totalXp: number };
}

const WriteWiseContext = createContext<WriteWiseContextType | undefined>(undefined);

export const WriteWiseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'warning') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('writewise_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          users: parsed.users || INITIAL_USERS,
          systemSettings: parsed.systemSettings || DEFAULT_SYSTEM_SETTINGS,
          auditLogs: parsed.auditLogs || INITIAL_AUDIT_LOGS,
          sections: parsed.sections || INITIAL_SECTIONS
        };
      } catch (e) {
        console.error('Failed to parse saved state, loading defaults', e);
      }
    }
    return {
      currentUser: null,
      users: INITIAL_USERS,
      papers: INITIAL_PAPERS,
      sources: INITIAL_SOURCES,
      assignments: DEFAULT_ASSIGNMENTS,
      competencies: DEFAULT_COMPETENCIES,
      validations: DEFAULT_VALIDATIONS,
      rubric: DEFAULT_RUBRIC,
      systemSettings: DEFAULT_SYSTEM_SETTINGS,
      auditLogs: INITIAL_AUDIT_LOGS,
      sections: INITIAL_SECTIONS
    };
  });

  useEffect(() => {
    localStorage.setItem('writewise_state', JSON.stringify(state));
  }, [state]);

  const login = (email: string, role?: 'student' | 'teacher' | 'admin'): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check demo accounts first
    if (cleanEmail === 'admin@writewise.demo') {
      setState(prev => ({
        ...prev,
        currentUser: DEMO_ADMIN
      }));
      return true;
    }
    if (cleanEmail === 'student@writewise.demo') {
      setState(prev => ({
        ...prev,
        currentUser: { ...DEMO_STUDENT, id: 'student-1' }
      }));
      return true;
    }
    if (cleanEmail === 'teacher@writewise.demo') {
      setState(prev => ({
        ...prev,
        currentUser: DEMO_TEACHER
      }));
      return true;
    }

    if (role === 'admin') {
      const existingUser = (state.users || INITIAL_USERS).find(u => u.email.toLowerCase() === cleanEmail && u.role === 'admin');
      if (existingUser) {
        setState(prev => ({ ...prev, currentUser: existingUser }));
      } else {
        setState(prev => ({
          ...prev,
          currentUser: {
            ...DEMO_ADMIN,
            id: 'admin-' + Math.random().toString(36).substring(2, 9),
            name: email.split('@')[0],
            email: cleanEmail
          }
        }));
      }
      return true;
    }

    // Dynamic login for custom emails
    if (role === 'student') {
      const existingPaper = state.papers.find(p => p.studentId === cleanEmail || p.studentName?.toLowerCase() === cleanEmail);
      if (existingPaper) {
        setState(prev => ({
          ...prev,
          currentUser: {
            id: existingPaper.studentId,
            name: existingPaper.studentName || 'Student',
            email: cleanEmail,
            role: 'student',
            track: existingPaper.track,
            classId: 'class-g11'
          }
        }));
        return true;
      } else {
        const studentId = 'student-' + Math.random().toString(36).substring(2, 9);
        const paperId = 'paper-' + Math.random().toString(36).substring(2, 9);
        const basePaper = state.papers[0] || INITIAL_PAPERS[0];
        const newSections = basePaper.sections.map(sec => ({
          ...sec,
          status: 'not_started' as const,
          content: '',
          wordCount: 0,
          wordPredictionsAccepted: 0,
          aiFeedbackRequests: 0,
          revisionCount: 0,
          pastedContentDetected: false,
          lastSavedAt: ''
        }));
        const newPaper: Paper = {
          id: paperId,
          studentId,
          studentName: email.split('@')[0],
          studentSection: 'Grade 11 - STEM A',
          grade: '',
          title: 'Untitled Practical Research Paper',
          assignmentId: 'assign-1',
          progress: 0,
          sections: newSections,
          draftHistory: [],
          track: 'foundational',
          reflectionCompleted: false
        };
        setState(prev => ({
          ...prev,
          papers: [...prev.papers, newPaper],
          currentUser: {
            id: studentId,
            name: email.split('@')[0],
            email: cleanEmail,
            role: 'student',
            track: 'foundational',
            classId: 'class-g11'
          }
        }));
        return true;
      }
    } else {
      setState(prev => ({
        ...prev,
        currentUser: {
          id: 'teacher-' + Math.random().toString(36).substring(2, 9),
          name: email.split('@')[0],
          email: cleanEmail,
          role: 'teacher',
          classId: 'class-g11'
        }
      }));
      return true;
    }
  };

  const register = (name: string, email: string, role: 'student' | 'teacher' | 'admin', grade?: string, section?: string) => {
    const studentId = (role || 'student') + '-' + Math.random().toString(36).substring(2, 9);
    const paperId = 'paper-' + Math.random().toString(36).substring(2, 9);

    const basePaper = state.papers[0] || INITIAL_PAPERS[0];
    const newSections = basePaper.sections.map(sec => ({
      ...sec,
      status: 'not_started' as const,
      content: '',
      wordCount: 0,
      wordPredictionsAccepted: 0,
      aiFeedbackRequests: 0,
      revisionCount: 0,
      pastedContentDetected: false,
      lastSavedAt: ''
    }));

    const cleanSection = section && grade ? `${grade} - ${section}` : section || grade || (role === 'admin' ? 'Administration' : 'Grade 11 - STEM A');

    const newPaper: Paper = {
      id: paperId,
      studentId,
      studentName: name,
      studentSection: cleanSection,
      grade: '',
      title: 'Untitled Practical Research Paper',
      assignmentId: 'assign-1',
      progress: 0,
      sections: newSections,
      draftHistory: [],
      track: 'foundational',
      reflectionCompleted: false
    };

    const newUser: User = {
      id: studentId,
      name,
      email: email.trim().toLowerCase(),
      role,
      track: 'foundational' as const,
      classId: role === 'admin' ? 'admin-division' : 'class-g11',
      gradeLevel: grade || (role === 'student' ? 'Grade 11' : role === 'admin' ? 'Division Admin' : 'Faculty'),
      section: cleanSection,
      schoolName: state.systemSettings?.institutionName || 'Batangas National High School',
      password: 'password123',
      createdAt: new Date().toISOString()
    };

    setState(prev => {
      const updatedPapers = role === 'student' ? [...prev.papers, newPaper] : prev.papers;
      const updatedUsers = [newUser, ...(prev.users || INITIAL_USERS)];
      return {
        ...prev,
        users: updatedUsers,
        currentUser: newUser,
        papers: updatedPapers
      };
    });

    showToast(`Account successfully created for ${name}!`, 'success');
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const updateUserProfile = (profileData: Partial<User>) => {
    if (!state.currentUser) return;
    const currentId = state.currentUser.id;

    setState(prev => {
      if (!prev.currentUser) return prev;
      const updatedUser: User = {
        ...prev.currentUser,
        ...profileData,
        id: prev.currentUser.id,
        role: prev.currentUser.role
      };

      const updatedPapers = prev.papers.map(p => {
        if (p.studentId === currentId) {
          return {
            ...p,
            studentName: profileData.name !== undefined ? profileData.name : p.studentName,
            studentSection: profileData.section !== undefined 
              ? (profileData.gradeLevel ? `${profileData.gradeLevel} - ${profileData.section}` : profileData.section)
              : p.studentSection
          };
        }
        return p;
      });

      return {
        ...prev,
        currentUser: updatedUser,
        papers: updatedPapers
      };
    });

    showToast('Information profile successfully updated!', 'success');
  };

  const changePassword = (currentPassword: string, newPassword: string): { success: boolean; message: string } => {
    if (!state.currentUser) {
      return { success: false, message: 'You must be logged in to change your password.' };
    }

    const storedPassword = state.currentUser.password || 'password123';
    if (currentPassword !== storedPassword) {
      return { success: false, message: 'The current password you entered is incorrect.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    if (newPassword === currentPassword) {
      return { success: false, message: 'New password cannot be the same as your current password.' };
    }

    const now = new Date().toISOString();
    setState(prev => {
      if (!prev.currentUser) return prev;
      return {
        ...prev,
        currentUser: {
          ...prev.currentUser,
          password: newPassword,
          passwordLastChanged: now
        }
      };
    });

    showToast('Your password has been changed successfully!', 'success');
    return { success: true, message: 'Password changed successfully.' };
  };

  // Admin Features Implementation
  const addAuditLog = (
    action: string, 
    category: AuditLogEntry['category'], 
    details: string, 
    status: AuditLogEntry['status'] = 'info'
  ) => {
    const actorName = state.currentUser?.name || 'Administrator';
    const actorRole = state.currentUser?.role || 'admin';
    const newEntry: AuditLogEntry = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      actor: actorName,
      actorRole,
      action,
      category,
      details,
      status
    };

    setState(prev => ({
      ...prev,
      auditLogs: [newEntry, ...(prev.auditLogs || INITIAL_AUDIT_LOGS)]
    }));
  };

  const clearAuditLogs = () => {
    const resetEntry: AuditLogEntry = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      actor: state.currentUser?.name || 'System Admin',
      actorRole: 'admin',
      action: 'AUDIT_LOGS_PURGED',
      category: 'system',
      details: 'Audit log archives cleared by administrator.',
      status: 'warning'
    };

    setState(prev => ({
      ...prev,
      auditLogs: [resetEntry]
    }));
    showToast('Audit log history cleared.', 'warning');
  };

  const updateSystemSettings = (settings: Partial<SystemSettings>) => {
    setState(prev => {
      const merged = {
        ...(prev.systemSettings || DEFAULT_SYSTEM_SETTINGS),
        ...settings
      };
      return {
        ...prev,
        systemSettings: merged
      };
    });

    addAuditLog(
      'SETTINGS_UPDATED',
      'system',
      `Updated institutional configuration: ${Object.keys(settings).join(', ')}`,
      'info'
    );
    showToast('System settings successfully saved!', 'success');
  };

  const adminCreateUser = (userData: Partial<User>) => {
    const newId = (userData.role || 'student') + '-' + Math.random().toString(36).substring(2, 9);
    const newUser: User = {
      id: newId,
      name: userData.name || 'New User',
      email: userData.email || `user-${Date.now()}@writewise.demo`,
      role: userData.role || 'student',
      track: userData.track || 'foundational',
      classId: userData.classId || 'class-g11',
      gradeLevel: userData.gradeLevel || (userData.role === 'student' ? 'Grade 11' : userData.role === 'admin' ? 'Division Administration' : 'Faculty'),
      section: userData.section || (userData.role === 'student' ? 'STEM A' : 'Research Dept'),
      strand: userData.strand || 'Science, Technology, Engineering, and Mathematics (STEM)',
      studentIdNumber: userData.studentIdNumber || (userData.role === 'student' ? 'LRN-' + Math.floor(100000000000 + Math.random() * 900000000000) : 'EMP-' + Math.floor(1000 + Math.random() * 9000)),
      schoolName: userData.schoolName || state.systemSettings?.institutionName || 'Batangas National High School',
      phone: userData.phone || '+63 917 000 0000',
      bio: userData.bio || `${userData.role === 'student' ? 'Student researcher' : userData.role === 'admin' ? 'Research Administrator' : 'Faculty instructor'} at WriteWise.`,
      password: userData.password || 'password123',
      createdAt: new Date().toISOString()
    };

    setState(prev => {
      const existingUsers = prev.users || INITIAL_USERS;
      let newPapers = prev.papers;

      if (newUser.role === 'student') {
        const paperId = 'paper-' + Math.random().toString(36).substring(2, 9);
        const basePaper = prev.papers[0] || INITIAL_PAPERS[0];
        const newSections = basePaper.sections.map(sec => ({
          ...sec,
          status: 'not_started' as const,
          content: '',
          wordCount: 0,
          wordPredictionsAccepted: 0,
          aiFeedbackRequests: 0,
          revisionCount: 0,
          pastedContentDetected: false,
          lastSavedAt: ''
        }));

        const newPaper: Paper = {
          id: paperId,
          studentId: newId,
          studentName: newUser.name,
          studentSection: newUser.section || 'Grade 11 - STEM A',
          grade: '',
          title: 'Untitled Practical Research Paper',
          assignmentId: 'assign-1',
          progress: 0,
          sections: newSections,
          draftHistory: [],
          track: newUser.track || 'foundational',
          reflectionCompleted: false
        };

        newPapers = [...prev.papers, newPaper];
      }

      return {
        ...prev,
        users: [newUser, ...existingUsers],
        papers: newPapers
      };
    });

    addAuditLog(
      'USER_PROVISIONED',
      'user_management',
      `Admin provisioned ${newUser.role} account for ${newUser.name} (${newUser.email})`,
      'success'
    );
    showToast(`Account successfully created for ${newUser.name}!`, 'success');
  };

  const adminUpdateUser = (userId: string, data: Partial<User>) => {
    setState(prev => {
      const existingUsers = prev.users || INITIAL_USERS;
      const updatedUsers = existingUsers.map(u => {
        if (u.id === userId) {
          return { ...u, ...data, id: u.id };
        }
        return u;
      });

      // Sync papers if student
      const updatedPapers = prev.papers.map(p => {
        if (p.studentId === userId) {
          return {
            ...p,
            studentName: data.name !== undefined ? data.name : p.studentName,
            studentSection: data.section !== undefined ? data.section : p.studentSection,
            track: data.track !== undefined ? data.track : p.track
          };
        }
        return p;
      });

      const updatedCurrentUser = prev.currentUser?.id === userId
        ? { ...prev.currentUser, ...data }
        : prev.currentUser;

      return {
        ...prev,
        currentUser: updatedCurrentUser,
        users: updatedUsers,
        papers: updatedPapers
      };
    });

    addAuditLog(
      'USER_MODIFIED',
      'user_management',
      `Admin updated profile records for user ID: ${userId}`,
      'info'
    );
    showToast('User account successfully updated!', 'success');
  };

  const adminDeleteUser = (userId: string) => {
    if (state.currentUser?.id === userId) {
      showToast('Cannot delete the currently logged in account.', 'warning');
      return;
    }

    setState(prev => {
      const existingUsers = prev.users || INITIAL_USERS;
      const filteredUsers = existingUsers.filter(u => u.id !== userId);
      const filteredPapers = prev.papers.filter(p => p.studentId !== userId);

      return {
        ...prev,
        users: filteredUsers,
        papers: filteredPapers
      };
    });

    addAuditLog(
      'USER_DELETED',
      'user_management',
      `Admin permanently removed user ID: ${userId}`,
      'warning'
    );
    showToast('User account removed.', 'warning');
  };

  const adminResetPassword = (userId: string, newPassword = 'password123'): string => {
    setState(prev => {
      const existingUsers = prev.users || INITIAL_USERS;
      const updatedUsers = existingUsers.map(u => {
        if (u.id === userId) {
          return { ...u, password: newPassword, passwordLastChanged: new Date().toISOString() };
        }
        return u;
      });

      const updatedCurrentUser = prev.currentUser?.id === userId
        ? { ...prev.currentUser, password: newPassword, passwordLastChanged: new Date().toISOString() }
        : prev.currentUser;

      return {
        ...prev,
        currentUser: updatedCurrentUser,
        users: updatedUsers
      };
    });

    addAuditLog(
      'PASSWORD_OVERRIDE',
      'security',
      `Admin reset password for user ID: ${userId}`,
      'warning'
    );
    showToast(`Password reset to "${newPassword}"`, 'success');
    return newPassword;
  };

  const adminAddSection = (sectionData: Omit<GradeSection, 'id'>) => {
    const newId = 'sec-' + Math.random().toString(36).substring(2, 9);
    const newSection: GradeSection = {
      ...sectionData,
      id: newId
    };

    setState(prev => ({
      ...prev,
      sections: [...(prev.sections || INITIAL_SECTIONS), newSection]
    }));

    addAuditLog(
      'SECTION_CREATED',
      'curriculum',
      `Admin created new section "${sectionData.gradeLevel} - ${sectionData.sectionName}" (${sectionData.strand})`,
      'success'
    );
    showToast(`Section "${sectionData.gradeLevel} - ${sectionData.sectionName}" successfully created!`, 'success');
  };

  const adminUpdateSection = (sectionId: string, data: Partial<GradeSection>) => {
    setState(prev => {
      const existingSections = prev.sections || INITIAL_SECTIONS;
      const updated = existingSections.map(s => s.id === sectionId ? { ...s, ...data } : s);
      return {
        ...prev,
        sections: updated
      };
    });

    addAuditLog(
      'SECTION_UPDATED',
      'curriculum',
      `Admin updated section configuration for ID: ${sectionId}`,
      'info'
    );
    showToast('Section details successfully updated!', 'success');
  };

  const adminDeleteSection = (sectionId: string) => {
    setState(prev => {
      const existingSections = prev.sections || INITIAL_SECTIONS;
      return {
        ...prev,
        sections: existingSections.filter(s => s.id !== sectionId)
      };
    });

    addAuditLog(
      'SECTION_DELETED',
      'curriculum',
      `Admin removed section record with ID: ${sectionId}`,
      'warning'
    );
    showToast('Section removed.', 'warning');
  };

  const exportSystemData = (): string => {
    return JSON.stringify(state, null, 2);
  };

  const importSystemData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed && Array.isArray(parsed.papers)) {
        setState(parsed);
        showToast('System database restored successfully!', 'success');
        return true;
      }
      showToast('Invalid backup file format.', 'warning');
      return false;
    } catch {
      showToast('Failed to parse database backup.', 'warning');
      return false;
    }
  };

  const updateUserTrack = (studentId: string, track: LearningTrack) => {
    setState(prev => {
      const updatedPapers = prev.papers.map(p => {
        if (p.studentId === studentId) {
          return { ...p, track };
        }
        return p;
      });
      return { ...prev, papers: updatedPapers };
    });
  };

  const addStudent = (name: string, section: string, track: LearningTrack, gradeLevel = 'Grade 11', strand?: string) => {
    const studentId = 'student-' + Math.random().toString(36).substring(2, 9);
    const paperId = 'paper-' + Math.random().toString(36).substring(2, 9);

    const basePaper = state.papers[0] || INITIAL_PAPERS[0];
    const newSections = basePaper.sections.map(sec => ({
      ...sec,
      status: 'not_started' as const,
      content: '',
      wordCount: 0,
      wordPredictionsAccepted: 0,
      aiFeedbackRequests: 0,
      revisionCount: 0,
      pastedContentDetected: false,
      lastSavedAt: ''
    }));

    const cleanSection = section.includes(gradeLevel) ? section : `${gradeLevel} - ${section}`;

    const newPaper: Paper = {
      id: paperId,
      studentId,
      studentName: name,
      studentSection: cleanSection,
      grade: '',
      title: 'Untitled Practical Research Paper',
      assignmentId: 'assign-1',
      progress: 0,
      sections: newSections,
      draftHistory: [],
      track,
      reflectionCompleted: false
    };

    const newUser: User = {
      id: studentId,
      name,
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@deped.demo`,
      role: 'student',
      track,
      classId: 'class-g11',
      gradeLevel,
      section,
      strand: strand || 'Science, Technology, Engineering, and Mathematics (STEM)',
      studentIdNumber: 'LRN-' + Math.floor(100000000000 + Math.random() * 900000000000),
      schoolName: state.systemSettings?.institutionName || 'Batangas National High School',
      password: 'password123',
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      users: [newUser, ...(prev.users || INITIAL_USERS)],
      papers: [...prev.papers, newPaper]
    }));

    addAuditLog(
      'STUDENT_ENROLLED',
      'user_management',
      `Student ${name} enrolled in ${cleanSection} (${track.toUpperCase()} track)`,
      'success'
    );
    showToast(`Student ${name} successfully enrolled in ${cleanSection}!`, 'success');
  };

  const updateStudentName = (studentId: string, name: string) => {
    setState(prev => {
      const updatedPapers = prev.papers.map(p => {
        if (p.studentId === studentId) {
          return { ...p, studentName: name };
        }
        return p;
      });

      const updatedUsers = (prev.users || INITIAL_USERS).map(u => {
        if (u.id === studentId) {
          return { ...u, name };
        }
        return u;
      });

      return { ...prev, papers: updatedPapers, users: updatedUsers };
    });
  };

  const assignStudentSection = (studentId: string, section: string, gradeLevel?: string, strand?: string) => {
    let studentName = 'Student';

    setState(prev => {
      // Find current user data
      const existingUser = (prev.users || INITIAL_USERS).find(u => u.id === studentId);
      if (existingUser?.name) {
        studentName = existingUser.name;
      }
      const effectiveGrade = gradeLevel || existingUser?.gradeLevel || 'Grade 11';
      const formattedLabel = section.includes(effectiveGrade) ? section : `${effectiveGrade} - ${section}`;

      let hasPaper = false;
      let updatedPapers = prev.papers.map(p => {
        if (p.studentId === studentId) {
          hasPaper = true;
          return { 
            ...p, 
            studentSection: formattedLabel,
            studentName: existingUser?.name || p.studentName
          };
        }
        return p;
      });

      if (!hasPaper && existingUser && existingUser.role === 'student') {
        const basePaper = prev.papers[0] || INITIAL_PAPERS[0];
        const newSections = (basePaper.sections || []).map(sec => ({
          ...sec,
          status: 'not_started' as const,
          content: '',
          wordCount: 0,
          wordPredictionsAccepted: 0,
          aiFeedbackRequests: 0,
          revisionCount: 0,
          pastedContentDetected: false,
          lastSavedAt: ''
        }));

        const newPaper: Paper = {
          id: 'paper-' + Math.random().toString(36).substring(2, 9),
          studentId: studentId,
          studentName: existingUser.name,
          studentSection: formattedLabel,
          grade: '',
          title: 'Untitled Practical Research Paper',
          assignmentId: 'assign-1',
          progress: 0,
          sections: newSections,
          draftHistory: [],
          track: existingUser.track || 'foundational',
          reflectionCompleted: false
        };
        updatedPapers = [...updatedPapers, newPaper];
      }

      const updatedUsers = (prev.users || INITIAL_USERS).map(u => {
        if (u.id === studentId) {
          return {
            ...u,
            section,
            gradeLevel: effectiveGrade,
            strand: strand || u.strand
          };
        }
        return u;
      });

      const updatedCurrentUser = prev.currentUser?.id === studentId
        ? {
            ...prev.currentUser,
            section,
            gradeLevel: effectiveGrade,
            strand: strand || prev.currentUser.strand
          }
        : prev.currentUser;

      return {
        ...prev,
        currentUser: updatedCurrentUser,
        papers: updatedPapers,
        users: updatedUsers
      };
    });

    const targetPaper = state.papers.find(p => p.studentId === studentId);
    const finalName = targetPaper?.studentName || studentName;
    const effectiveGrade = gradeLevel || 'Grade 11';

    addAuditLog(
      'SECTION_ASSIGNED',
      'curriculum',
      `Assigned student ${finalName} to ${effectiveGrade} - ${section}`,
      'info'
    );
    showToast(`${finalName} assigned to ${effectiveGrade} - ${section}!`, 'success');
  };

  const updateStudentSection = (studentId: string, section: string, gradeLevel?: string, strand?: string) => {
    assignStudentSection(studentId, section, gradeLevel, strand);
  };

  const assignGrade = (studentId: string, grade: number | string) => {
    setState(prev => {
      const updated = prev.papers.map(p => {
        if (p.studentId === studentId) {
          return { ...p, grade };
        }
        return p;
      });
      return { ...prev, papers: updated };
    });
    showToast('Student grade successfully recorded!', 'success');
  };

  const deleteStudent = (studentId: string) => {
    setState(prev => {
      const studentPaper = prev.papers.find(p => p.studentId === studentId);
      const studentName = studentPaper?.studentName || 'Student';
      const updatedPapers = prev.papers.filter(p => p.studentId !== studentId);
      const updatedUsers = (prev.users || INITIAL_USERS).filter(u => u.id !== studentId);
      return { ...prev, papers: updatedPapers, users: updatedUsers };
    });
    showToast('Student record deleted successfully.', 'warning');
  };

  const updatePaperSection = (sectionId: string, content: string, status?: PaperSection['status']) => {
    if (!state.currentUser || state.currentUser.role !== 'student') return;
    const studentId = state.currentUser.id;

    setState(prev => {
      const paper = prev.papers.find(p => p.studentId === studentId);
      if (!paper) return prev;

      const updatedSections = paper.sections.map(sec => {
        if (sec.id === sectionId) {
          const words = content.trim() ? content.trim().split(/\s+/).length : 0;
          return {
            ...sec,
            content,
            wordCount: words,
            status: status || sec.status,
            lastSavedAt: new Date().toISOString()
          };
        }
        return sec;
      });

      // Recalculate paper overall progress (completed sections / total sections)
      const completedCount = updatedSections.filter(s => s.status === 'completed').length;
      const progress = Math.round((completedCount / updatedSections.length) * 100);

      const updatedPapers = prev.papers.map(p => {
        if (p.studentId === studentId) {
          return { ...p, sections: updatedSections, progress };
        }
        return p;
      });

      return { ...prev, papers: updatedPapers };
    });
  };

  const acceptWordSuggestion = (sectionId: string) => {
    if (!state.currentUser || state.currentUser.role !== 'student') return;
    const studentId = state.currentUser.id;
    setState(prev => {
      const paper = prev.papers.find(p => p.studentId === studentId);
      if (!paper) return prev;

      const updatedSections = paper.sections.map(sec => {
        if (sec.id === sectionId) {
          return { ...sec, wordPredictionsAccepted: sec.wordPredictionsAccepted + 1 };
        }
        return sec;
      });

      return {
        ...prev,
        papers: prev.papers.map(p => p.studentId === studentId ? { ...p, sections: updatedSections } : p)
      };
    });
  };

  const triggerAIFeedbackRequest = (sectionId: string) => {
    if (!state.currentUser || state.currentUser.role !== 'student') return;
    const studentId = state.currentUser.id;
    setState(prev => {
      const paper = prev.papers.find(p => p.studentId === studentId);
      if (!paper) return prev;

      const updatedSections = paper.sections.map(sec => {
        if (sec.id === sectionId) {
          return { ...sec, aiFeedbackRequests: sec.aiFeedbackRequests + 1 };
        }
        return sec;
      });

      return {
        ...prev,
        papers: prev.papers.map(p => p.studentId === studentId ? { ...p, sections: updatedSections } : p)
      };
    });
  };

  const submitSectionForReview = (sectionId: string) => {
    const studentId = state.currentUser?.id || 'student-1';
    const paper = state.papers.find(p => p.studentId === studentId);
    const sec = paper?.sections.find(s => s.id === sectionId);
    const content = sec?.content || '';

    // A. Originality check algorithms
    const similarityFlags: { text: string; source: string; suggestion: string }[] = [];
    if (content.toLowerCase().includes('study while checking facebook notifications') || content.toLowerCase().includes('82% of students')) {
      similarityFlags.push({
        text: 'study while checking Facebook notifications',
        source: 'Santos, M. (2025) - Fractured Attention',
        suggestion: 'This matches a core finding in Santos (2025). Ensure you use quotation marks for verbatim phrases, or paraphrase this in your own words while retaining the in-text citation.'
      });
    }
    if (content.toLowerCase().includes('cruz (2024)') && !content.toLowerCase().includes('asserts') && content.toLowerCase().includes('online academic groups help learners')) {
      similarityFlags.push({
        text: 'online academic groups help learners share notes',
        source: 'Cruz, J. (2024) - Digital Communities',
        suggestion: 'This sentence closely mimics the language in Cruz (2024). Paraphrase to show your unique understanding of the digital communities concept.'
      });
    }

    // B. AI-use Process Tracker metrics
    const acceptedCount = sec?.wordPredictionsAccepted || 0;
    const feedbackCount = sec?.aiFeedbackRequests || 0;
    const wordCount = sec?.wordCount || 0;

    const studentDrafting: 'HIGH' | 'MODERATE' | 'LOW' = wordCount > 50 ? 'HIGH' : wordCount > 20 ? 'MODERATE' : 'LOW';
    const suggestionsAccepted: 'HIGH' | 'MODERATE' | 'LOW' = acceptedCount > 7 ? 'HIGH' : acceptedCount > 2 ? 'MODERATE' : 'LOW';
    const feedbackRequests: 'HIGH' | 'MODERATE' | 'LOW' = feedbackCount > 3 ? 'HIGH' : feedbackCount > 0 ? 'MODERATE' : 'LOW';
    const directAIGen: 'NONE RECORDED' | 'MINIMAL DETECTED' = 'NONE RECORDED';

    // C. Rubric check algorithms
    const rubricEvaluation: { criterionId: string; rating: 'beginning' | 'developing' | 'proficient' | 'advanced'; feedback: string }[] = [];
    const whatToDoNext: string[] = [];

    // Let's check academic tone
    const hasIThink = content.toLowerCase().includes('i think') || content.toLowerCase().includes('in my opinion') || content.toLowerCase().includes('i believe');
    
    // Evaluate organization
    if (!content.trim()) {
      rubricEvaluation.push({
        criterionId: 'crit-org',
        rating: 'beginning',
        feedback: 'No writing found in this section yet.'
      });
      whatToDoNext.push('Begin drafting this section using the scaffolding templates.');
    } else {
      rubricEvaluation.push({
        criterionId: 'crit-org',
        rating: wordCount > 40 ? 'advanced' : 'proficient',
        feedback: 'Section layout is correct and flows structurally.'
      });
    }

    // Evaluate Academic language & Coherence
    if (content.trim()) {
      if (hasIThink) {
        rubricEvaluation.push({
          criterionId: 'crit-coh',
          rating: 'developing',
          feedback: 'Coherence is interrupted by subjective phrasing (e.g., "I think").'
        });
        whatToDoNext.push('Remove conversational expressions like "I think" or "I believe" to maintain a formal academic tone.');
      } else {
        rubricEvaluation.push({
          criterionId: 'crit-coh',
          rating: 'proficient',
          feedback: 'Clear academic tone with logical transitions between findings.'
        });
      }

      // Thesis or claim specifics
      if (sectionId === 'sec-thesis') {
        if (content.toLowerCase().includes('although') && content.toLowerCase().includes('argues')) {
          rubricEvaluation.push({
            criterionId: 'crit-thesis',
            rating: 'advanced',
            feedback: 'Excellent thesis structure with clear concession, core claim, and organizing reasons.'
          });
        } else {
          rubricEvaluation.push({
            criterionId: 'crit-thesis',
            rating: 'developing',
            feedback: 'Thesis provides a general stance but would benefit from a concession and specific organizing points.'
          });
          whatToDoNext.push('Strengthen your thesis statement by adding organizing reasons (e.g., "Although [concession], this paper argues that... because [Reason A] and [Reason B]").');
        }
      }

      // Evidence synthesis evaluation
      if (sectionId === 'sec-litreview') {
        const hasCruz = content.toLowerCase().includes('cruz');
        const hasSantos = content.toLowerCase().includes('santos');
        const hasDelaCruz = content.toLowerCase().includes('dela cruz');

        if (hasCruz && hasSantos && hasDelaCruz) {
          rubricEvaluation.push({
            criterionId: 'crit-evidence',
            rating: 'proficient',
            feedback: 'Great job citing three distinct local sources to synthesize the context!'
          });
        } else if (hasCruz || hasSantos) {
          rubricEvaluation.push({
            criterionId: 'crit-evidence',
            rating: 'developing',
            feedback: 'You have cited source material, but need to synthesize multiple sources to show different perspectives.'
          });
          whatToDoNext.push('Strengthen literature synthesis. Try integrating Dela Cruz (2023) or Santos (2025) alongside Cruz (2024) to compare positive and negative impacts.');
        } else {
          rubricEvaluation.push({
            criterionId: 'crit-evidence',
            rating: 'beginning',
            feedback: 'No verified citations or academic sources integrated.'
          });
          whatToDoNext.push('Integrate evidence from your Source Bank to support your claims in this literature review.');
        }
      }

      // Citation Evaluation
      const containsYear = /\(\d{4}\)/.test(content);
      if (content.trim() && !containsYear && sectionId !== 'sec-title') {
        rubricEvaluation.push({
          criterionId: 'crit-cite',
          rating: 'developing',
          feedback: 'Some claims are presented as facts without academic source citation.'
        });
        whatToDoNext.push('Add proper parenthetical in-text citations (e.g., Santos, 2025) to avoid presenting research findings as uncredited facts.');
      } else {
        rubricEvaluation.push({
          criterionId: 'crit-cite',
          rating: 'proficient',
          feedback: 'In-text citation styles comply with standard scholarly formats.'
        });
      }

      // Originality check rating
      if (similarityFlags.length > 0) {
        rubricEvaluation.push({
          criterionId: 'crit-orig',
          rating: 'developing',
          feedback: 'Potential similarity markers flags on exact wording matching source documents.'
        });
        whatToDoNext.push('Revise flagged matching sentences to use your own wording and structure rather than copying exact phrases.');
      } else {
        rubricEvaluation.push({
          criterionId: 'crit-orig',
          rating: 'proficient',
          feedback: 'High original composition with clear individual student voice.'
        });
      }
    }

    const canMoveToNext = content.trim().length > 30 && whatToDoNext.length === 0 && similarityFlags.length === 0;
    if (canMoveToNext) {
      whatToDoNext.push('Excellent! All core rubric standards have been fully met for this section. You can now finalize this section.');
    } else if (whatToDoNext.length === 0) {
      whatToDoNext.push('Review your draft wording to ensure it is clear, comprehensive, and cohesive before submitting.');
    }

    // Save this draft version into history
    setState(prev => {
      const activePaper = prev.papers.find(p => p.studentId === studentId);
      if (!activePaper) return prev;

      const newDraft: DraftVersion = {
        id: 'df-' + Date.now(),
        sectionId,
        content,
        wordCount,
        timestamp: new Date().toISOString(),
        feedbackSummary: whatToDoNext.join(' '),
        processMetrics: {
          studentDrafting,
          wordSuggestionsAccepted: suggestionsAccepted,
          feedbackRequests,
          directAIGeneration: directAIGen
        }
      };

      const updatedSections = activePaper.sections.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            status: canMoveToNext ? 'completed' as const : 'needs_revision' as const,
            revisionCount: s.revisionCount + 1
          };
        }
        return s;
      });

      const completedCount = updatedSections.filter(s => s.status === 'completed').length;
      const progress = Math.round((completedCount / updatedSections.length) * 100);

      const updatedPapers = prev.papers.map(p => {
        if (p.studentId === studentId) {
          return {
            ...p,
            sections: updatedSections,
            progress,
            draftHistory: [newDraft, ...p.draftHistory]
          };
        }
        return p;
      });

      return { ...prev, papers: updatedPapers };
    });

    return {
      similarityFlags,
      processIndicator: {
        studentDrafting,
        suggestionsAccepted,
        feedbackRequests,
        directAIGen
      },
      rubricEvaluation,
      whatToDoNext,
      canMoveToNext
    };
  };

  const addSource = (source: Omit<Source, 'id'>) => {
    setState(prev => {
      const newSource: Source = {
        ...source,
        id: 'src-' + Date.now()
      };
      return { ...prev, sources: [...prev.sources, newSource] };
    });
  };

  const verifySource = (sourceId: string, verified: boolean) => {
    setState(prev => {
      const updatedSources = prev.sources.map(s => s.id === sourceId ? { ...s, verified } : s);
      return { ...prev, sources: updatedSources };
    });
  };

  const addAssignment = (assignment: Assignment) => {
    setState(prev => ({ ...prev, assignments: [...prev.assignments, assignment] }));
  };

  const addValidation = (validation: Omit<ExpertValidation, 'id' | 'date'>) => {
    setState(prev => {
      const newVal: ExpertValidation = {
        ...validation,
        id: 'val-' + Date.now(),
        date: new Date().toISOString().split('T')[0]
      };
      return { ...prev, validations: [...prev.validations, newVal] };
    });
  };

  const savePreSurvey = (answers: Record<string, number>) => {
    if (!state.currentUser || state.currentUser.role !== 'student') return;
    const studentId = state.currentUser.id;

    // Calculate sub-scores (average of answers on 1-4 scale)
    // Efficacy questions prefix: sews_
    // AI Reliance: ailq_
    // Plagiarism/Originality: atp_
    const getAvg = (prefix: string) => {
      const vals = Object.keys(answers).filter(k => k.startsWith(prefix)).map(k => answers[k]);
      return vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : 2.5;
    };

    const writingSelfEfficacy = getAvg('sews_');
    const aiReliance = getAvg('ailq_');
    const originalityAttitudes = getAvg('atp_');

    // Auto-placement track logic: on 1-4 scale, 2.5 is midpoint. Foundational if high AI reliance (>= 2.5) or lower efficacy (< 2.5)
    const track: LearningTrack = (aiReliance >= 2.5 || writingSelfEfficacy < 2.5) ? 'foundational' : 'advanced';

    setState(prev => {
      const updatedPapers = prev.papers.map(p => {
        if (p.studentId === studentId) {
          return {
            ...p,
            track,
            preSurvey: {
              writingSelfEfficacy,
              aiReliance,
              originalityAttitudes,
              answers
            }
          };
        }
        return p;
      });

      const updatedUser: User = state.currentUser ? { ...state.currentUser, track } : null as any;

      return {
        ...prev,
        currentUser: updatedUser,
        papers: updatedPapers
      };
    });
  };

  const savePostSurvey = (answers: Record<string, number>) => {
    if (!state.currentUser || state.currentUser.role !== 'student') return;
    const studentId = state.currentUser.id;

    const getAvg = (prefix: string) => {
      const vals = Object.keys(answers).filter(k => k.startsWith(prefix)).map(k => answers[k]);
      return vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : 3.0;
    };

    const writingSelfEfficacy = getAvg('sews_');
    const aiReliance = getAvg('ailq_');
    const originalityAttitudes = getAvg('atp_');

    setState(prev => {
      const updatedPapers = prev.papers.map(p => {
        if (p.studentId === studentId) {
          return {
            ...p,
            postSurvey: {
              writingSelfEfficacy,
              aiReliance,
              originalityAttitudes,
              answers
            }
          };
        }
        return p;
      });
      return { ...prev, papers: updatedPapers };
    });
  };

  const saveReflection = (reflections: { planning: string; monitoring: string; reflection: string; evaluation: string; adaptation: string }) => {
    if (!state.currentUser || state.currentUser.role !== 'student') return;
    const studentId = state.currentUser.id;

    setState(prev => {
      const updatedPapers = prev.papers.map(p => {
        if (p.studentId === studentId) {
          return {
            ...p,
            reflectionCompleted: true,
            reflectionText: reflections
          };
        }
        return p;
      });
      return { ...prev, papers: updatedPapers };
    });
  };

  const getWordSuggestions = (text: string): string[] => {
    if (!text) return [];
    
    // Look at the last words typed
    const trimmed = text.trim();
    const lastWordMatch = trimmed.match(/([a-zA-Z]+)$/);
    const lastWord = lastWordMatch ? lastWordMatch[1].toLowerCase() : '';

    const wordPredictions: Record<string, string[]> = {
      'encour': ['encouraged', 'encourage', 'encouraging'],
      'influenc': ['influenced', 'influence', 'influential'],
      'affect': ['affected', 'affecting', 'affects'],
      'studi': ['studies', 'studying', 'studied'],
      'researc': ['research', 'researchers', 'researched'],
      'evaluat': ['evaluate', 'evaluation', 'evaluating'],
      'synthes': ['synthesize', 'synthesis', 'synthesizing'],
      'argum': ['argument', 'arguments', 'argumentation'],
      'educat': ['education', 'educational', 'educators'],
      'perform': ['performance', 'performances', 'performing'],
      'literat': ['literature', 'literary'],
      'context': ['contextualize', 'contextualization', 'contexts'],
      'academ': ['academic', 'academics', 'academically'],
      'coher': ['coherence', 'coherent', 'coherently'],
      'signific': ['significant', 'significance', 'significantly'],
      'complet': ['completed', 'completion', 'completely']
    };

    // Check partial typing
    for (const key in wordPredictions) {
      if (key.startsWith(lastWord) && lastWord.length >= 3) {
        return wordPredictions[key];
      }
    }

    // Check preceding phrases for contextual continuation suggestions
    const lowercaseText = trimmed.toLowerCase();
    if (lowercaseText.endsWith('social media has')) {
      return ['influenced', 'affected', 'changed', 'transformed'];
    }
    if (lowercaseText.endsWith('the purpose of this')) {
      return ['study', 'paper', 'research', 'inquiry'];
    }
    if (lowercaseText.endsWith('according to local')) {
      return ['scholars', 'researchers', 'experts', 'studies'];
    }
    if (lowercaseText.endsWith('as demonstrated in the')) {
      return ['evidence', 'findings', 'literature', 'survey'];
    }
    if (lowercaseText.endsWith('there is a clear need to')) {
      return ['examine', 'investigate', 'analyze', 'strengthen'];
    }
    if (lowercaseText.endsWith('academic per')) {
      return ['performance', 'perspectives', 'personality'];
    }

    return [];
  };

  const addComment = (studentId: string, sectionId: string, text: string, highlightText?: string) => {
    setState(prev => {
      const updatedPapers = prev.papers.map(p => {
        if (p.studentId === studentId) {
          const currentComments = p.comments || [];
          const newComment = {
            id: 'comment-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
            sectionId,
            text,
            author: prev.currentUser?.name || 'Advisor',
            timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            highlightText
          };
          return {
            ...p,
            comments: [...currentComments, newComment]
          };
        }
        return p;
      });
      return { ...prev, papers: updatedPapers };
    });
  };

  const deleteComment = (studentId: string, commentId: string) => {
    setState(prev => {
      const updatedPapers = prev.papers.map(p => {
        if (p.studentId === studentId) {
          const currentComments = p.comments || [];
          return {
            ...p,
            comments: currentComments.filter(c => c.id !== commentId)
          };
        }
        return p;
      });
      return { ...prev, papers: updatedPapers };
    });
  };

  const updateMatrixCell = (studentId: string, rowSourceId: string, columnTheme: string, active: boolean, note?: string) => {
    setState(prev => {
      const updatedPapers = prev.papers.map(p => {
        if (p.studentId === studentId) {
          const matrix = p.synthesisMatrix || [];
          const filtered = matrix.filter(cell => !(cell.rowSourceId === rowSourceId && cell.columnTheme === columnTheme));
          const updatedMatrix = active 
            ? [...filtered, { rowSourceId, columnTheme, active, note }]
            : filtered;
          return {
            ...p,
            synthesisMatrix: updatedMatrix
          };
        }
        return p;
      });
      return { ...prev, papers: updatedPapers };
    });
  };

  const resetData = () => {
    localStorage.removeItem('writewise_state');
    setState({
      currentUser: null,
      papers: INITIAL_PAPERS,
      sources: INITIAL_SOURCES,
      assignments: DEFAULT_ASSIGNMENTS,
      competencies: DEFAULT_COMPETENCIES,
      validations: DEFAULT_VALIDATIONS,
      rubric: DEFAULT_RUBRIC
    });
  };

  const submitAssessmentScore = (assessmentId: string, score: number, total: number) => {
    if (!state.currentUser) return { xpEarned: 0, totalXp: 0 };
    
    // Total XP for the assessment is 30.
    // If score is perfect (score === total), student gets 30 XP.
    // Otherwise, calculate how many points they get prorated: (score / total) * 30.
    const xpEarned = Math.round((score / total) * 30);
    
    const currentCompleted = state.currentUser.completedAssessments || [];
    const completedAssessments = currentCompleted.includes(assessmentId)
      ? currentCompleted
      : [...currentCompleted, assessmentId];
      
    const currentScores = state.currentUser.assessmentScores || {};
    const previousScoreEntry = currentScores[assessmentId];
    
    // Only add new XP or update if they got a higher score or did it for the first time
    const previousXp = previousScoreEntry ? previousScoreEntry.xpEarned : 0;
    const xpDiff = Math.max(0, xpEarned - previousXp); // Ensure non-negative contribution
    
    const updatedScores = {
      ...currentScores,
      [assessmentId]: {
        score,
        total,
        xpEarned: Math.max(previousXp, xpEarned),
        submittedAt: new Date().toISOString()
      }
    };
    
    const newTotalXp = (state.currentUser.xp || 0) + xpDiff;
    
    setState(prev => {
      if (!prev.currentUser) return prev;
      const updatedUser = {
        ...prev.currentUser,
        xp: newTotalXp,
        completedAssessments,
        assessmentScores: updatedScores
      };
      
      const updatedUsers = (prev.users || []).map(u => {
        if (u.id === updatedUser.id) return updatedUser;
        return u;
      });
      
      return {
        ...prev,
        currentUser: updatedUser,
        users: updatedUsers
      };
    });
    
    return { xpEarned, totalXp: newTotalXp };
  };

  return (
    <WriteWiseContext.Provider
      value={{
        state,
        toasts,
        showToast,
        removeToast,
        login,
        register,
        logout,
        updateUserTrack,
        updatePaperSection,
        submitSectionForReview,
        addSource,
        verifySource,
        addAssignment,
        addValidation,
        savePreSurvey,
        savePostSurvey,
        saveReflection,
        getWordSuggestions,
        acceptWordSuggestion,
        triggerAIFeedbackRequest,
        addStudent,
        updateStudentName,
        updateStudentSection,
        assignStudentSection,
        assignGrade,
        deleteStudent,
        addComment,
        deleteComment,
        updateMatrixCell,
        updateUserProfile,
        changePassword,
        updateSystemSettings,
        adminCreateUser,
        adminUpdateUser,
        adminDeleteUser,
        adminResetPassword,
        adminAddSection,
        adminUpdateSection,
        adminDeleteSection,
        addAuditLog,
        clearAuditLogs,
        exportSystemData,
        importSystemData,
        resetData,
        submitAssessmentScore
      }}
    >
      {children}
    </WriteWiseContext.Provider>
  );
};

export const useWriteWise = () => {
  const context = useContext(WriteWiseContext);
  if (context === undefined) {
    throw new Error('useWriteWise must be used within a WriteWiseProvider');
  }
  return context;
};
