import React from 'react';
import { Link } from 'react-router-dom';
import { getAllAssessments } from '../services/assessmentData';

export const History: React.FC = () => {
  const assessments = getAllAssessments();

  return (
    <div className="mx-auto max-w-[1200px] px-4 md:px-6 py-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
              История тестов
            </h1>
            <p className="text-slate-500 dark:text-[#99b1c2] text-base font-normal max-w-2xl">
              Пройдите тесты, чтобы начать отслеживать свой прогресс.
            </p>
        </div>
        <Link
          to="/dashboard"
          className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
        >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Новый тест
        </Link>
      </div>

      {/* Empty State with Available Assessments */}
      <div className="flex flex-col items-center justify-center py-12 text-center mb-10">
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-slate-400">history</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Начните свой путь
        </h3>
        <p className="text-slate-500 dark:text-[#99b1c2] text-sm max-w-md mb-6">
          Пройдите один из тестов ниже, чтобы получить персональный анализ и рекомендации.
        </p>
      </div>

      {/* Available assessments grid */}
      <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-4">Доступные методики</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assessments.map((assessment) => (
          <Link
            key={assessment.id}
            to={`/assessment/${assessment.id}`}
            className="group flex flex-col gap-3 bg-white dark:bg-[#1e272e] border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${assessment.gradient || 'from-slate-500 to-slate-600'} flex items-center justify-center text-white shrink-0`}>
                <span className="material-symbols-outlined text-lg">{assessment.icon || 'quiz'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-slate-900 dark:text-white font-bold text-sm group-hover:text-primary transition-colors truncate">
                  {assessment.title}
                </h4>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {assessment.type === 'chat' ? 'AI Диалог' : 'Тест'}
                </span>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">
              {assessment.description}
            </p>
            <div className="flex items-center gap-1 text-primary text-xs font-medium mt-auto">
              <span>Пройти</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
