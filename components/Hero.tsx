import React from 'react';
import { Illustration } from './Illustration';

interface HeroProps {
  onLogin: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onLogin }) => {
  return (
    <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-24 py-12 lg:py-20 animate-in fade-in duration-700">

      {/* Text Content */}
      <div className="flex-1 text-right max-w-2xl">
        <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
          منصة مدرستنا <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">الشاملة</span>
        </h1>

        <p className="text-lg lg:text-xl text-slate-500 dark:text-slate-400 leading-relaxed mb-10 max-w-lg">
          منصة رسمية لعرض تفاصيل الطلاب وبياناتهم الدراسية باستخدام الرقم القومي، بطريقة آمنة ومنظمة.
        </p>

        <button
          onClick={onLogin}
          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 px-10 rounded-2xl shadow-xl shadow-slate-300/20 dark:shadow-none hover:shadow-2xl transition-all transform hover:-translate-y-1 text-lg flex items-center justify-center gap-2"
        >
          الدخول إلى عرض التفاصيل
        </button>
      </div>

      {/* Illustration */}
      <div className="flex-1 flex justify-center lg:justify-end w-full">
        <Illustration />
      </div>

    </div>
  );
};