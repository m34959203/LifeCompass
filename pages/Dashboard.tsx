import React from 'react';
import { Link } from 'react-router-dom';
import { getAllAssessments } from '../services/assessmentData';

export const Dashboard: React.FC = () => {
  const assessments = getAllAssessments();

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">
      {/* Header */}
      <header className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
             LifeCompass AI
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Гибридная платформа диагностики. Выбирайте между точными тестами и глубоким диалогом с ИИ.
          </p>
        </div>
      </header>

      {/* Topics Grid */}
      <section className="mb-10">
        <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            Доступные методики
        </h2>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((test) => (
            <div key={test.id} className="group relative flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-[#1d2830] shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:shadow-lg hover:-translate-y-1">
              
              {/* Card Header Gradient */}
              <div className={`h-24 w-full bg-gradient-to-r ${test.gradient || 'from-slate-500 to-slate-600'} opacity-90 relative overflow-hidden`}>
                 <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                 <div className="absolute top-4 left-6 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
                    <span className="material-symbols-outlined text-2xl">{test.icon || 'quiz'}</span>
                 </div>
                 {/* Type Badge */}
                 <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border border-white/10">
                    {test.type === 'chat' ? 'AI Диалог' : 'Тест'}
                 </div>
              </div>

              <div className="flex flex-1 flex-col p-6 pt-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{test.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex-1 leading-relaxed mb-6">
                    {test.description}
                </p>
                
                <Link 
                    to={`/assessment/${test.id}`} 
                    className="mt-auto flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-50 dark:bg-[#25323b] hover:bg-primary hover:text-white dark:hover:bg-primary text-slate-700 dark:text-slate-200 text-sm font-bold transition-all group-hover:shadow-md"
                >
                    <span className="material-symbols-outlined text-lg">
                        {test.type === 'chat' ? 'forum' : 'play_arrow'}
                    </span>
                    {test.type === 'chat' ? 'Начать беседу' : 'Пройти тест'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
