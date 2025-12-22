import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TeacherHero } from './components/TeacherHero';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';
import { TeacherLoginPage } from './components/TeacherLoginPage';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';

import { CheckCircle2, X, Bot, Trash2, Loader2 } from 'lucide-react';
import { supabase } from './src/lib/supabase';

// --- CONSTANTS ---
export const SUBJECTS = [
  "اللغة العربية",
  "اللغة الإنجليزية",
  "الرياضيات",
  "العلوم",
  "الدراسات الاجتماعية",
  "التربية الدينية",
  "الحاسب الآلي",
  "التربية الفنية"
] as const;

export const GRADES = [
  "الاول الإعدادي",
  "الثاني الإعدادي",
  "الثالث الإعدادي"
] as const;

// --- TYPES ---
export interface Assessment {
  id: string;
  subject: string; // Added subject
  title: string;
  score: number;
  maxScore: number;
  status: 'present' | 'absent' | 'excused' | 'late';
  note?: string;
  date?: string;
}

export interface MonthlyExam {
  id: string;
  subject: string;
  score: number;
  maxScore: number;
  status: 'present' | 'absent' | 'excused';
  note?: string;
  date?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  lessonName?: string;
  note?: string;
  lateTime?: string; // Time of arrival if late
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  importance: 'normal' | 'high';
  targetGrade: string; // Added target grade
}

export interface StudentData {
  id: string;
  name: string;
  grade: string;
  weeklyAssessments: Assessment[];
  monthlyExams: MonthlyExam[];
  attendanceRecords: AttendanceRecord[];
  announcements: Announcement[];
  _uuid?: string; // Internal Supabase ID
}

// --- MOCK DATA GENERATOR ---
const generateWeeklyForSubjects = (weeksCount: number): Assessment[] => {
  const assessments: Assessment[] = [];

  for (let w = 1; w <= weeksCount; w++) {
    SUBJECTS.forEach((subj, sIdx) => {
      assessments.push({
        id: `w-${w}-${sIdx}`,
        subject: subj,
        title: `أسبوع ${w}`,
        score: 8 + Math.floor(Math.random() * 3), // Random score 8-10
        maxScore: 10,
        status: Math.random() > 0.9 ? 'absent' : 'present', // 10% chance of absence
        note: '',
        date: new Date(Date.now() - (10 - w) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    });
  }
  return assessments;
};

// Toast Component
const Toast = ({ message, onClose, type = 'success' }: { message: string; onClose: () => void, type?: 'success' | 'info' | 'error' }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none">
    <div className={`
      backdrop-blur-md px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border pointer-events-auto
      ${type === 'success' ? 'bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 border-slate-700 dark:border-slate-200' : ''}
      ${type === 'info' ? 'bg-blue-600/90 text-white border-blue-500' : ''}
    `}>
      <div className={`rounded-full p-1 ${type === 'success' ? 'bg-green-500' : 'bg-white/20'}`}>
        {type === 'success' ? <CheckCircle2 className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-white" />}
      </div>
      <span className="font-medium text-sm">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 ml-2 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// --- BACKGROUND COMPONENT (OPTIMIZED) ---
const DynamicBackground = React.memo(({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none transition-colors duration-700 bg-slate-50 dark:bg-slate-950">
    {/* Light Mode Grid */}
    <div className={`absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] transition-opacity duration-700 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}></div>

    {/* Dark Mode Stars */}
    <div className={`absolute inset-0 transition-opacity duration-700 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute w-1 h-1 bg-white rounded-full top-1/4 left-1/4 animate-pulse"></div>
      <div className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full top-3/4 right-1/3 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute w-1 h-1 bg-white rounded-full top-10 right-10 opacity-50"></div>
      <div className="absolute w-1 h-1 bg-indigo-300 rounded-full bottom-20 left-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>

    {/* Moving Blobs (Optimized with will-change and transform-gpu) */}
    <div className={`absolute top-0 -left-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob transition-colors duration-700 will-change-transform transform-gpu ${isDarkMode ? 'bg-purple-900/40' : 'bg-purple-300'}`}></div>
    <div className={`absolute top-0 -right-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 transition-colors duration-700 will-change-transform transform-gpu ${isDarkMode ? 'bg-indigo-900/40' : 'bg-cyan-300'}`}></div>
    <div className={`absolute -bottom-32 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 transition-colors duration-700 will-change-transform transform-gpu ${isDarkMode ? 'bg-blue-900/40' : 'bg-pink-300'}`}></div>
  </div>
));

export default function App() {
  // Theme State with persistence
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark';
    }
    return false;
  });

  // Views: 'student-landing' | 'teacher-landing' | 'login' | 'teacher-login' | 'dashboard' | 'teacher-dashboard'
  const [currentView, setCurrentView] = useState<'student-landing' | 'teacher-landing' | 'login' | 'teacher-login' | 'dashboard' | 'teacher-dashboard'>('student-landing');

  // Auto-route based on URL or Hash
  useEffect(() => {
    const isTeacherUrl = window.location.pathname.includes('teacher-portal') || window.location.hash === '#teacher';
    const isStudentUrl = window.location.hash === '#student';

    if (isTeacherUrl) {
      setCurrentView('teacher-landing');
    } else if (isStudentUrl) {
      setCurrentView('student-landing');
    }
  }, []);

  // Teacher Session State
  const [teacherSubject, setTeacherSubject] = useState<string>('الرياضيات');

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  // We keep history for session-based undo/redo, but initialization is now async
  const [history, setHistory] = useState<StudentData[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const students = history[historyIndex];

  // --- SUPABASE FETCHING ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch core tables
      const { data: studentsData, error: studentError } = await supabase.from('students').select('*');
      const { data: assessmentsData, error: assessError } = await supabase.from('assessments').select('*');
      const { data: examsData, error: examError } = await supabase.from('monthly_exams').select('*');
      const { data: attendanceData, error: attError } = await supabase.from('attendance_records').select('*');
      const { data: announcementsData, error: annError } = await supabase.from('announcements').select('*');

      if (studentError) throw studentError;
      if (assessError) throw assessError;
      if (examError) throw examError;
      if (attError) throw attError;
      if (annError) throw annError;

      // Map relational data to nested StudentData structure
      const mappedStudents: StudentData[] = (studentsData || []).map(student => {
        // Find related data
        const studentAssessments = (assessmentsData || [])
          .filter(a => a.student_id === student.id)
          .map(a => ({
            id: a.id,
            subject: a.subject,
            title: a.title,
            score: Number(a.score),
            maxScore: Number(a.max_score),
            status: a.status as any,
            note: a.note,
            date: a.date
          }));

        const studentExams = (examsData || [])
          .filter(e => e.student_id === student.id)
          .map(e => ({
            id: e.id,
            subject: e.subject,
            score: Number(e.score),
            maxScore: Number(e.max_score),
            status: e.status as any,
            note: e.note,
            date: e.date
          }));

        const studentAttendance = (attendanceData || [])
          .filter(a => a.student_id === student.id)
          .map(a => ({
            id: a.id,
            date: a.date,
            status: a.status as any,
            lessonName: a.lesson_name,
            note: a.note,
            lateTime: a.late_time
          }));

        // Announcements are global but filtered by grade usually, or 'all'. 
        // Here we just attach relevant ones.
        const relevantAnnouncements = (announcementsData || [])
          .filter(a => a.target_grade === 'الكل' || a.target_grade === student.grade)
          .map(a => ({
            id: a.id,
            title: a.title,
            content: a.content,
            date: a.date,
            author: a.author,
            importance: a.importance as any,
            targetGrade: a.target_grade
          }));

        return {
          id: student.national_id, // We use national_id as the App's ID for simplicity based on existing data
          _uuid: student.id, // Keep internal UUID
          name: student.name,
          grade: student.grade,
          weeklyAssessments: studentAssessments,
          monthlyExams: studentExams,
          attendanceRecords: studentAttendance,
          announcements: relevantAnnouncements
        };
      });

      setHistory([mappedStudents]);
      setHistoryIndex(0);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      // Fallback to local storage or mock if critical failure (optional)
      // triggerToast(`خطأ في تحميل البيانات: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // UseEffect to fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Theme Effect: Apply class to <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // No longer syncing to localStorage continuously
  // useEffect(() => { ... }, [students]);

  const setStudents = useCallback((newStudentsOrUpdater: StudentData[] | ((prev: StudentData[]) => StudentData[])) => {
    setHistory(prevHistory => {
      const current = prevHistory[historyIndex];
      const newStudents = typeof newStudentsOrUpdater === 'function'
        ? newStudentsOrUpdater(current)
        : newStudentsOrUpdater;

      if (JSON.stringify(current) === JSON.stringify(newStudents)) return prevHistory;

      const newHistory = prevHistory.slice(0, historyIndex + 1);
      newHistory.push(newStudents);
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => {
      const nextIndex = prev + 1;
      return nextIndex > 50 ? 50 : nextIndex;
    });
  }, [historyIndex]);

  const undo = useCallback(() => {
    setHistoryIndex(prev => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setHistoryIndex(prev => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string, type?: 'success' | 'info' | 'error' } | null>(null);

  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // --- SUPABASE WRITES ---

  const handleUpdateStudent = useCallback(async (nationalId: string, data: Partial<StudentData>) => {
    // 1. Find the student's internal UUID
    const student = students.find(s => s.id === nationalId);
    if (!student || !student._uuid) {
      console.error("Unknown student or missing UUID:", nationalId);
      triggerToast("خطأ: تعذر العثور على سجل الطالب", 'error');
      return;
    }
    const studentUuid = student._uuid;

    setLoading(true);
    try {
      const promises = [];

      // Update Assessments
      if (data.weeklyAssessments) {
        for (const item of data.weeklyAssessments) {
          // Determine if we need to insert or update.
          // If it's a new item generated locally without valid UUID, we omit ID to let DB generate it.
          // Assuming existing items have valid UUIDs from fetch.
          const isNew = item.id.startsWith('w-') || item.id.length < 20;

          const payload: any = {
            student_id: studentUuid,
            subject: item.subject,
            title: item.title,
            score: item.score,
            max_score: item.maxScore,
            status: item.status,
            note: item.note,
            date: item.date
          };

          if (!isNew) {
            payload.id = item.id;
          }

          promises.push(supabase.from('assessments').upsert(payload));
        }
      }

      // Update Monthly Exams
      if (data.monthlyExams) {
        for (const item of data.monthlyExams) {
          const isNew = item.id.startsWith('m') || item.id.length < 20;
          const payload: any = {
            student_id: studentUuid,
            subject: item.subject,
            score: item.score,
            max_score: item.maxScore,
            status: item.status,
            note: item.note,
            date: item.date
          };
          if (!isNew) payload.id = item.id;
          promises.push(supabase.from('monthly_exams').upsert(payload));
        }
      }

      // Update Attendance
      if (data.attendanceRecords) {
        for (const item of data.attendanceRecords) {
          const isNew = item.id.startsWith('a') || item.id.length < 20;
          const payload: any = {
            student_id: studentUuid,
            date: item.date,
            status: item.status,
            lesson_name: item.lessonName,
            note: item.note,
            late_time: item.lateTime
          };
          if (!isNew) payload.id = item.id;
          promises.push(supabase.from('attendance_records').upsert(payload));
        }
      }

      // Update Announcements
      // Note: Announcements are usually global, but if we are "updating a student's announcements", 
      // it might mean we are creating a targeted announcement? 
      // For now, let's assume we are just updating the student table itself if name/grade changed.
      if (data.name || data.grade) {
        promises.push(supabase.from('students').update({
          name: data.name,
          grade: data.grade
        }).eq('id', studentUuid));
      }

      await Promise.all(promises);

      // Refresh local state
      await fetchData();
      triggerToast("تم حفظ التغييرات بنجاح", 'success');

    } catch (err: any) {
      console.error("Update failed:", err);
      triggerToast(`فشل الحفظ: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [students, fetchData]);

  const handleDeleteStudent = useCallback(async (nationalId: string) => {
    const student = students.find(s => s.id === nationalId);
    if (!student || !student._uuid) return;

    if (!window.confirm("هل أنت متأكد من حذف هذا الطالب؟ لا يمكن التراجع عن هذا الإجراء.")) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('students').delete().eq('id', student._uuid);
      if (error) throw error;

      await fetchData();
      triggerToast("تم حذف سجل الطالب بنجاح", 'info');
    } catch (err: any) {
      console.error("Delete failed:", err);
      triggerToast(`فشل الحذف: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [students, fetchData]);

  const handleBulkUpdate = useCallback(async (updates: { id: string, data: Partial<StudentData> }[]) => {
    setLoading(true);
    try {
      for (const update of updates) {
        await handleUpdateStudent(update.id, update.data);
      }
    } finally {
      setLoading(false);
    }
  }, [handleUpdateStudent]);

  const handleStartJourney = () => {
    setCurrentView('login');
  };

  const handleStudentLoginSuccess = async (nationalId: string) => {
    const exists = students.find(s => s.id === nationalId);
    if (exists) {
      setCurrentStudentId(nationalId);
      triggerToast(`مرحباً بك، ${exists.name}! أنت في ${exists.grade}`, 'info');
      setCurrentView('dashboard');
    } else {
      // Create new student in DB
      setLoading(true);
      try {
        const { data, error } = await supabase.from('students').insert([{
          national_id: nationalId,
          name: "طالب جديد",
          grade: "الاول الإعدادي"
        }]).select();

        if (error) throw error;

        await fetchData();
        setCurrentStudentId(nationalId);
        triggerToast(`مرحباً بك! تم إنشاء ملف جديد.`, 'info');
        setCurrentView('dashboard');
      } catch (err: any) {
        console.error("Login creation failed:", err);
        triggerToast("حدث خطأ أثناء إنشاء الحساب", 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTeacherLoginClick = () => {
    setCurrentView('teacher-login');
  };

  const handleTeacherLoginSuccess = (selectedSubject: string) => {
    setTeacherSubject(selectedSubject);
    setCurrentView('teacher-dashboard');
    triggerToast(`مرحباً بك يا أستاذ مادة ${selectedSubject}`, 'info');
  };

  const handleLogout = () => {
    // Logout to login page instead of landing
    setCurrentView('student-landing');
    setCurrentStudentId(null);
  };

  // Nav Handlers
  const handleStudentPortalClick = () => setCurrentView('student-landing');
  const handleTeacherPortalClick = () => setCurrentView('teacher-landing');

  const currentStudent = students.find(s => s.id === currentStudentId) || students[0];

  return (
    <div className={`min-h-screen flex flex-col font-sans relative text-slate-900 dark:text-slate-100`}>

      <DynamicBackground isDarkMode={isDarkMode} />

      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isLoggedIn={currentView === 'dashboard' || currentView === 'teacher-dashboard'}
        onLogout={handleLogout}
      />

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <main className="flex-grow flex flex-col relative isolate">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-8 flex-grow flex flex-col">
          {currentView === 'student-landing' && (
            <Hero
              onLogin={handleStartJourney}
              onTeacherLogin={handleTeacherPortalClick}
            />
          )}

          {currentView === 'teacher-landing' && (
            <TeacherHero
              onLogin={handleTeacherLoginClick}
              onStudentPortal={handleStudentPortalClick}
            />
          )}

          {currentView === 'login' && (
            <LoginPage
              onLoginSuccess={handleStudentLoginSuccess}
              onBack={handleStudentPortalClick}
            />
          )}

          {currentView === 'teacher-login' && (
            <TeacherLoginPage
              onLoginSuccess={handleTeacherLoginSuccess}
              onBackToStudent={handleStudentPortalClick}
            />
          )}

          {currentView === 'dashboard' && (
            <StudentDashboard
              student={currentStudent}
              onLogout={handleLogout}
            />
          )}

          {currentView === 'teacher-dashboard' && (
            <TeacherDashboard
              students={students}
              teacherSubject={teacherSubject}
              onUpdateStudent={handleUpdateStudent}
              onBulkUpdate={handleBulkUpdate}
              onDeleteStudent={handleDeleteStudent}
              onLogout={handleLogout}
              triggerToast={triggerToast}
              undo={undo}
              redo={redo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
            />
          )}
        </div>
      </main>

      <Footer />

      {/* Global Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[200] bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-slate-600 dark:text-slate-300 font-medium">جاري الاتصال بقاعدة البيانات...</p>
          </div>
        </div>
      )}

    </div>
  );
}