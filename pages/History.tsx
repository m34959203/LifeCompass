import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getHistory, deleteResult, HistoryEntry } from '../services/historyService';
import { getAllAssessments } from '../services/assessmentData';

export const History: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    user ? getHistory(user.id) : []
  );
  const assessments = getAllAssessments();

  const handleDelete = (entryId: string) => {
    if (!user) return;
    deleteResult(user.id, entryId);
    setHistory(prev => prev.filter(e => e.id !== entryId));
  };

  const handleViewResult = (entry: HistoryEntry) => {
    navigate(`/results/${entry.assessmentId}`, {
      state: {
        assessmentId: entry.assessmentId,
        type: entry.type,
        // Pass pre-computed data so Results.tsx doesn't re-call AI
        fromHistory: true,
        savedScores: entry.scores,
        savedResult: entry.result,
      }
    });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getAssessmentGradient = (assessmentId: string) => {
    const a = assessments.find(a => a.id === assessmentId);
    return a?.gradient || 'from-slate-500 to-slate-600';
  };

  const getAssessmentIcon = (assessmentId: string) => {
    const a = assessments.find(a => a.id === assessmentId);
    return a?.icon || 'quiz';
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 md:px-6 py-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
            История тестов
          </h1>
          <p className="text-slate-500 dark:text-[#99b1c2] text-base font-normal max-w-2xl">
            {history.length > 0
              ? `${history.length} пройденных тестов. Отслеживайте свой прогресс.`
              : 'Пройдите тесты, чтобы начать отслеживать свой прогресс.'}
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

      {/* Results list */}
      {history.length > 0 && (
        <div className="flex flex-col gap-4 mb-10">
          {history.map(entry => (
            <div
              key={entry.id}
              className="group bg-white dark:bg-[#1e272e] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Left gradient bar */}
                <div className={`sm:w-2 h-2 sm:h-auto bg-gradient-to-b ${getAssessmentGradient(entry.assessmentId)}`} />

                <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAssessmentGradient(entry.assessmentId)} flex items-center justify-center text-white shrink-0`}>
                    <span className="material-symbols-outlined text-xl">{getAssessmentIcon(entry.assessmentId)}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-slate-900 dark:text-white font-bold text-base truncate">
                      {entry.assessmentTitle}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {formatDate(entry.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">psychology</span>
                        {entry.result.archetype}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${entry.type === 'chat' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                        {entry.type === 'chat' ? 'AI Диалог' : 'Тест'}
                      </span>
                    </div>
                  </div>

                  {/* Top scores preview */}
                  <div className="hidden lg:flex items-center gap-2">
                    {entry.scores.slice(0, 3).map((s, i) => (
                      <div key={i} className="text-center px-2">
                        <div className="text-xs text-slate-400 truncate max-w-[60px]">{s.subject}</div>
                        <div className={`text-sm font-bold ${s.A > 70 ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}>{s.A}%</div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleViewResult(entry)}
                      className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white text-sm font-medium transition-colors"
                    >
                      Подробнее
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Удалить"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {history.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-slate-400">history</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Начните свой путь
          </h3>
          <p className="text-slate-500 dark:text-[#99b1c2] text-sm max-w-md mb-6">
            Пройдите один из тестов ниже, чтобы получить персональный анализ и рекомендации. Все результаты будут сохранены здесь.
          </p>
        </div>
      )}

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
