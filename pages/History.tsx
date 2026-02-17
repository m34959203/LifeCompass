import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllResults, deleteResult, clearAllResults, TestResult } from '../services/storageService';
import { useToast } from '../components/Toast';

type FilterType = 'all' | 'quiz' | 'chat';

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

const getTopScore = (result: TestResult): { category: string; value: number } => {
  if (!result.scores || result.scores.length === 0) return { category: '-', value: 0 };
  const sorted = [...result.scores].sort((a, b) => b.A - a.A);
  return { category: sorted[0].subject, value: sorted[0].A };
};

const resultColorMap: Record<number, { color: string; bg: string; dot: string }> = {
  0: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
  1: { color: 'text-blue-500', bg: 'bg-blue-500/10', dot: 'bg-blue-500' },
  2: { color: 'text-purple-500', bg: 'bg-purple-500/10', dot: 'bg-purple-500' },
  3: { color: 'text-orange-500', bg: 'bg-orange-500/10', dot: 'bg-orange-500' },
  4: { color: 'text-red-500', bg: 'bg-red-500/10', dot: 'bg-red-500' },
};

export const History: React.FC = () => {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<FilterType>('all');
  const [results, setResults] = useState<TestResult[]>(getAllResults);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const filteredResults = useMemo(() => {
    if (filter === 'all') return results;
    return results.filter(r => r.type === filter);
  }, [results, filter]);

  const stats = useMemo(() => {
    const total = results.length;
    const quizCount = results.filter(r => r.type === 'quiz').length;
    const chatCount = results.filter(r => r.type === 'chat').length;
    const avgScore = total > 0
      ? Math.round(results.reduce((sum, r) => {
          const top = getTopScore(r);
          return sum + top.value;
        }, 0) / total)
      : 0;
    return { total, quizCount, chatCount, avgScore };
  }, [results]);

  const handleDelete = (id: string) => {
    deleteResult(id);
    setResults(getAllResults());
    showToast('Результат удалён', 'success');
  };

  const handleClearAll = () => {
    clearAllResults();
    setResults([]);
    setShowConfirmClear(false);
    showToast('Вся история очищена', 'success');
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 md:px-6 py-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
              История тестов
            </h1>
            <p className="text-slate-500 dark:text-text-secondary text-base font-normal max-w-2xl">
              Отслеживайте свои результаты и прогресс. Все пройденные тесты сохраняются автоматически.
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">analytics</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
          <p className="text-xs text-slate-500 dark:text-text-secondary uppercase tracking-wider font-medium mt-1">Всего тестов</p>
        </div>
        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <span className="material-symbols-outlined">quiz</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.quizCount}</p>
          <p className="text-xs text-slate-500 dark:text-text-secondary uppercase tracking-wider font-medium mt-1">Квиз-тестов</p>
        </div>
        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
              <span className="material-symbols-outlined">forum</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.chatCount}</p>
          <p className="text-xs text-slate-500 dark:text-text-secondary uppercase tracking-wider font-medium mt-1">AI-диалогов</p>
        </div>
        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.avgScore}%</p>
          <p className="text-xs text-slate-500 dark:text-text-secondary uppercase tracking-wider font-medium mt-1">Средний балл</p>
        </div>
      </div>

      {/* Filter & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex bg-slate-100 dark:bg-background-dark rounded-lg p-1 border border-slate-200 dark:border-border-dark">
          {([['all', 'Все'], ['quiz', 'Тесты'], ['chat', 'AI-диалоги']] as [FilterType, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                filter === key
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {results.length > 0 && (
          <div className="relative">
            {showConfirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Удалить всё?</span>
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors"
                >
                  Да
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white text-xs font-medium transition-colors"
                >
                  Нет
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                Очистить историю
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results List */}
      {filteredResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-slate-400">history</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {filter === 'all' ? 'История пуста' : 'Нет результатов'}
          </h3>
          <p className="text-slate-500 dark:text-text-secondary text-sm max-w-md mb-6">
            {filter === 'all'
              ? 'Пройдите свой первый тест, чтобы начать отслеживать прогресс.'
              : 'Попробуйте выбрать другой фильтр или пройдите новый тест.'}
          </p>
          <Link
            to="/dashboard"
            className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">play_arrow</span>
            Пройти тест
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((item, i) => {
            const topScore = getTopScore(item);
            const colors = resultColorMap[i % 5];
            const iconColors: Record<string, { iconColor: string; iconBg: string }> = {
              quiz: { iconColor: 'text-blue-500', iconBg: 'bg-blue-500/10' },
              chat: { iconColor: 'text-purple-500', iconBg: 'bg-purple-500/10' },
            };
            const { iconColor, iconBg } = iconColors[item.type] || iconColors.quiz;

            return (
              <div key={item.id} className="group flex flex-col md:flex-row gap-5 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 hover:border-primary/50 hover:shadow-lg transition-all duration-300 items-start md:items-center">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`h-12 w-12 rounded-full ${iconBg} flex items-center justify-center ${iconColor} shrink-0`}>
                        <span className="material-symbols-outlined">{item.assessmentIcon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="text-slate-900 dark:text-white font-bold text-lg group-hover:text-primary transition-colors truncate">
                          {item.assessmentTitle}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-xs text-slate-500 dark:text-text-secondary bg-slate-100 dark:bg-background-dark px-2 py-0.5 rounded border border-slate-200 dark:border-border-dark">
                              {item.type === 'chat' ? 'AI Диалог' : 'Тест'}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-text-secondary flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                {formatDate(item.date)}, {formatTime(item.date)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex flex-col items-start md:items-end">
                        <span className="text-xs text-slate-400 dark:text-text-secondary uppercase tracking-wider font-semibold">Результат</span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full ${colors.bg} px-2.5 py-0.5 text-sm font-medium ${colors.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`}></span>
                            {item.archetype}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/results/${item.assessmentId}`}
                        state={{ savedResultId: item.id }}
                        className="text-sm font-medium text-slate-700 dark:text-white bg-slate-100 dark:bg-background-dark hover:bg-primary hover:text-white border border-slate-200 dark:border-border-dark hover:border-primary px-4 py-2 rounded-lg transition-all shadow-sm"
                      >
                          Подробнее
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        title="Удалить"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
