import React, { useState } from 'react';
import { CreditCard, ArrowRight, Loader2, UserCog, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (id: string) => void;
  onBack?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBack }) => {
  const [nationalId, setNationalId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nationalId.length > 0) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(nationalId);
      }, 1500);
    }
  };

  return (
    <div className="w-full flex justify-center items-center py-12 animate-in fade-in zoom-in duration-300 relative">
      <div className="w-full max-w-lg bg-white/90 dark:bg-slate-900/90 rounded-3xl shadow-xl dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 md:p-12 relative overflow-hidden backdrop-blur-sm transition-colors duration-300">

        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-400"></div>

        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-6 left-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
            title="العودة"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
        )}

        <div className="text-center mb-10 mt-4">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">تسجيل الدخول</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">أدخل الرقم القومي للطالب لعرض التفاصيل</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label htmlFor="nationalId" className="sr-only">الرقم القومي</label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <CreditCard className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                id="nationalId"
                type="text"
                value={nationalId}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 14);
                  setNationalId(val);
                }}
                placeholder="الرقم القومي (14 رقم)"
                className="block w-full pr-12 pl-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg font-medium tracking-wide"
                dir="rtl"
                maxLength={14}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || nationalId.length < 14}
            className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] group"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span>ابدا رحلتك</span>
                <ArrowRight className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>



        <div className="mt-2 text-center">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            تأكد من كتابة الرقم بشكل صحيح من شهادة الميلاد
          </p>
        </div>
      </div>
    </div>
  );
};