import React from 'react';
import { Illustration } from './Illustration';

interface TeacherHeroProps {
    onLogin: () => void;
    onStudentPortal: () => void;
}

export const TeacherHero: React.FC<TeacherHeroProps> = ({ onLogin, onStudentPortal }) => {
    return (
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-24 py-12 lg:py-20 animate-in fade-in duration-700">

            {/* Text Content */}
            <div className="flex-1 text-right max-w-2xl">
                <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
                    بوابة المعلمين <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-300">الرقمية</span>
                </h1>

                <p className="text-lg lg:text-xl text-slate-500 dark:text-slate-400 leading-relaxed mb-10 max-w-lg">
                    منصة متكاملة لإدارة شؤون الطلاب، رصد الدرجات، وتسجيل الحضور والغياب بكل سهولة ويسر.
                </p>

                <button
                    onClick={onLogin}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 px-10 rounded-2xl shadow-xl shadow-slate-300/20 dark:shadow-none hover:shadow-2xl transition-all transform hover:-translate-y-1 text-lg flex items-center justify-center gap-2"
                >
                    تسجيل الدخول للمعلمين
                </button>

                <button
                    onClick={onStudentPortal}
                    className="mt-4 bg-transparent border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-8 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-base flex items-center justify-center gap-2"
                >
                    العودة لبوابة الطلاب
                </button>
            </div>

            {/* Illustration */}
            <div className="flex-1 flex justify-center lg:justify-end w-full">
                {/* We reuse the Illustration for now, but apply a hue rotation via inline style or CSS to differentiate if desired, or just keep it consistent. */}
                <div className="filter hue-rotate-15">
                    <Illustration />
                </div>
            </div>

        </div>
    );
};
