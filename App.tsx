import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';
import { StudentDashboard } from './components/StudentDashboard';
import { supabase } from './src/lib/supabase';
import { StudentData, Assessment, MonthlyExam, AttendanceRecord, Announcement, SUBJECTS, GRADES } from './src/types';
import { CheckCircle2, X, Loader2 } from 'lucide-react';

// --- CONSTANTS REMOVED (Imported from types) ---

// --- TYPES REMOVED (Imported from types) ---

// --- MOCK DATA REMOVED ---

// Toast Component
const Toast = ({ message, onClose, type = 'success' }: { message: string; onClose: () => void, type?: 'success' | 'info' | 'error' }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none">
    <div className={`
      backdrop-blur-md px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border pointer-events-auto
      ${type === 'success' ? 'bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 border-slate-700 dark:border-slate-200' : ''}
      ${type === 'info' ? 'bg-blue-600/90 text-white border-blue-500' : ''}
    `}>
      <div className={`rounded-full p-1 ${type === 'success' ? 'bg-green-500' : 'bg-white/20'}`}>
        <CheckCircle2 className="w-3 h-3 text-white" />
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

  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'dashboard'>('landing');

  // --- HISTORY & PERSISTENCE REMOVED FOR SUPABASE MIGRATION ---
  // We will now use direct Supabase state
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(false); // Start with false so app shows immediately

  // Fetch Students from Supabase
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
              *,
              weeklyAssessments:assessments(*),
              monthlyExams:monthly_exams(*),
              attendanceRecords:attendance_records(*)
          `);

      if (error) throw error;

      if (data) {
        const mappedData: StudentData[] = data.map((s: any) => ({
          id: s.id,
          national_id: s.national_id,
          name: s.name,
          grade: s.grade,
          weeklyAssessments: s.weeklyAssessments || [],
          monthlyExams: s.monthlyExams || [],
          attendanceRecords: s.attendanceRecords || [],
          announcements: []
        }));

        // Fetch global announcements separately
        try {
          const { data: annData } = await supabase.from('announcements').select('*');
          if (annData) {
            mappedData.forEach(s => s.announcements = annData as any);
          }
        } catch {
          // Ignore announcement fetch errors
        }

        setStudents(mappedData);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      // App will still work, just with empty data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);


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

  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string, type?: 'success' | 'info' | 'error' } | null>(null);

  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleUpdateStudent = useCallback(async (id: string, data: Partial<StudentData>) => {
    // OPTIMISTIC UPDATE
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));

    try {
      // Identify what to update. If it's basic details:
      const { error } = await supabase.from('students').update({
        name: data.name,
        grade: data.grade,
        // national_id: data.national_id // Usually don't update ID casually
      }).eq('id', id);

      if (error) throw error;
      triggerToast('تم تحديث البيانات بنجاح', 'success');
    } catch (err) {
      console.error(err);
      triggerToast('حدث خطأ أثناء التحديث', 'error');
      fetchStudents(); // Revert
    }
  }, [fetchStudents]);

  const handleDeleteStudent = useCallback(async (id: string) => {
    const confirm = window.confirm("هل أنت متأكد من حذف هذا الطالب؟");
    if (!confirm) return;

    setStudents(prev => prev.filter(s => s.id !== id)); // Optimistic
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
      triggerToast("تم حذف سجل الطالب بنجاح", 'info');
    } catch (err) {
      console.error(err);
      triggerToast("فشل الحذف", 'error');
      fetchStudents();
    }
  }, [fetchStudents]);

  const handleBulkUpdate = useCallback(async (updates: { id: string, data: Partial<StudentData> }[]) => {
    // Complex to do bulk updates in one go without a custom RPC or looping
    // For demo, we loop (not efficient but checking logic)
    for (const update of updates) {
      await handleUpdateStudent(update.id, update.data);
    }
  }, [handleUpdateStudent]);

  const handleStartJourney = () => {
    setCurrentView('login');
  };

  const handleStudentLoginSuccess = (nationalId: string) => {
    // In our new schema, we check by national_id
    // The Login page usually passes the ID entered.
    const exists = students.find(s => s.national_id === nationalId);
    if (exists) {
      setCurrentStudentId(exists.id);
      triggerToast(`مرحباً بك، ${exists.name}! أنت في ${exists.grade}`, 'info');
    } else {
      triggerToast(`عذراً، هذا الرقم القومي غير مسجل.`, 'error');
      // Ensure we stay on login or handle error
      return;
    }
    setCurrentView('dashboard');
  };

  // Create New Student (Teacher Action usually, but logic here for now)
  const createStudent = async (nationalId: string, name: string, grade: string) => {
    try {
      const { data, error } = await supabase.from('students').insert({
        national_id: nationalId,
        name,
        grade
      }).select().single();

      if (error) throw error;
      if (data) {
        await fetchStudents(); // Refresh
        triggerToast('تم إضافة الطالب بنجاح', 'success');
        return data.id;
      }
    } catch (err: any) {
      triggerToast(`فشل الإضافة: ${err.message}`, 'error');
    }
    return null;
  };



  const handleLogout = () => {
    // Logout to login page instead of landing
    setCurrentView('landing');
    setCurrentStudentId(null);
  };

  const currentStudent = students.find(s => s.id === currentStudentId) || null;





  return (
    <div className={`min-h-screen flex flex-col font-sans relative text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}>

      <DynamicBackground isDarkMode={isDarkMode} />

      <Header
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isLoggedIn={currentView === 'dashboard'}
        onLogout={() => setCurrentView('landing')}
      />

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}


      <main className="flex-grow flex flex-col relative isolate justify-center">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 py-6 flex-grow flex flex-col justify-center">
          {loading && <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
          {currentView === 'landing' && (
            <Hero onLogin={() => setCurrentView('login')} />
          )}

          {currentView === 'login' && (
            <LoginPage
              onLoginSuccess={handleStudentLoginSuccess}
              onBack={() => setCurrentView('landing')}
            />
          )}



          {currentView === 'dashboard' && currentStudent && (
            <StudentDashboard
              student={currentStudent}
              onLogout={handleLogout}
            />
          )}


        </div>
      </main>



      <Footer />
    </div>
  );
}