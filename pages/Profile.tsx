import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfile, saveUserProfile, UserProfile, getAllResults } from '../services/storageService';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../components/Toast';

export const Profile: React.FC = () => {
  const { isDark, toggleDark } = useTheme();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserProfile>(getUserProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile>(profile);
  const totalTests = getAllResults().length;

  useEffect(() => {
    setEditForm(profile);
  }, [profile]);

  const handleSave = () => {
    saveUserProfile(editForm);
    setProfile(editForm);
    setIsEditing(false);
    showToast('Профиль обновлён', 'success');
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const memberDate = profile.memberSince
    ? new Date(profile.memberSince).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
    : 'Недавно';

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto flex flex-col gap-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Профиль</h1>
        <p className="text-slate-500 dark:text-[#99b1c2] text-base lg:text-lg">Управление аккаунтом и настройками.</p>
      </div>

      {/* Profile Card */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white dark:bg-[#1e272e] p-6 lg:p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative group">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center border-4 border-white dark:border-[#28323a] shadow-lg">
              <span className="text-white text-3xl lg:text-4xl font-bold">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'П'}
              </span>
            </div>
        </div>
        <div className="flex flex-col items-center md:items-start flex-1 gap-2 pt-2">
            <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {profile.name || 'Пользователь'}
                </h2>
                <p className="text-slate-500 dark:text-[#99b1c2]">
                  {profile.email || 'Укажите email в настройках'}
                </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-1">
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Участник с {memberDate}
                </span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary border border-primary/20 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">analytics</span>
                    {totalTests} {totalTests === 1 ? 'тест' : totalTests >= 2 && totalTests <= 4 ? 'теста' : 'тестов'} пройдено
                </span>
            </div>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="w-full md:w-auto px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              {isEditing ? 'Отменить' : 'Редактировать'}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">

            <div className="bg-white dark:bg-[#1e272e] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-[#1a2228]">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person_search</span> Мои данные
                    </h3>
                    {isEditing && (
                      <button
                        onClick={handleSave}
                        className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-lg">save</span>
                        Сохранить
                      </button>
                    )}
                </div>
                <div className="p-6">
                  {isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-slate-500 dark:text-[#99b1c2] block mb-1.5">Имя</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#131b20] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                          placeholder="Ваше имя"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-500 dark:text-[#99b1c2] block mb-1.5">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#131b20] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                          placeholder="email@example.com"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-500 dark:text-[#99b1c2] block mb-1.5">Возраст</label>
                        <input
                          type="text"
                          value={editForm.age}
                          onChange={(e) => setEditForm(prev => ({ ...prev, age: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#131b20] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                          placeholder="25"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-500 dark:text-[#99b1c2] block mb-1.5">Сфера</label>
                        <input
                          type="text"
                          value={editForm.field}
                          onChange={(e) => setEditForm(prev => ({ ...prev, field: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#131b20] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                          placeholder="IT / Разработка"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-slate-500 dark:text-[#99b1c2] block mb-1.5">Локация</label>
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#131b20] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                          placeholder="Алматы, Казахстан"
                        />
                      </div>
                      <div className="sm:col-span-2 flex justify-end gap-3">
                        <button
                          onClick={handleCancel}
                          className="px-5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
                        >
                          Отмена
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white transition-colors text-sm font-medium shadow-md shadow-primary/20"
                        >
                          Сохранить
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <span className="text-sm font-medium text-slate-500 dark:text-[#99b1c2]">Возраст</span>
                        <p className="text-base text-slate-900 dark:text-white">{profile.age || 'Не указан'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-500 dark:text-[#99b1c2]">Сфера</span>
                        <p className="text-base text-slate-900 dark:text-white">{profile.field || 'Не указана'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-500 dark:text-[#99b1c2]">Локация</span>
                        <p className="text-base text-slate-900 dark:text-white">{profile.location || 'Не указана'}</p>
                      </div>
                    </div>
                  )}
                </div>
            </div>

            {/* Recent Results */}
            <div className="bg-white dark:bg-[#1e272e] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-[#1a2228]">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">history</span> Последние результаты
                    </h3>
                    <Link to="/history" className="text-primary hover:text-primary/80 text-sm font-medium">
                      Все
                    </Link>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {getAllResults().slice(0, 3).map((result) => (
                    <Link
                      key={result.id}
                      to={`/results/${result.assessmentId}`}
                      state={{ savedResultId: result.id }}
                      className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-[#232d36] transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${result.assessmentGradient} flex items-center justify-center text-white shrink-0`}>
                        <span className="material-symbols-outlined text-lg">{result.assessmentIcon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{result.assessmentTitle}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{result.archetype}</p>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(result.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </span>
                    </Link>
                  ))}
                  {totalTests === 0 && (
                    <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                      Пока нет результатов. <Link to="/dashboard" className="text-primary hover:underline">Пройти тест</Link>
                    </div>
                  )}
                </div>
            </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
            {/* Settings */}
            <div className="bg-white dark:bg-[#1e272e] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-fit">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2228]">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">tune</span> Настройки
                    </h3>
                </div>
                <div className="p-6 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                         <div className="flex flex-col">
                             <span className="text-sm font-medium text-slate-900 dark:text-white">Тёмная тема</span>
                             <span className="text-xs text-slate-500 dark:text-slate-400">Переключить оформление</span>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                             <input
                               type="checkbox"
                               checked={isDark}
                               onChange={toggleDark}
                               className="sr-only peer"
                             />
                             <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                         </label>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-[#1e272e] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-fit">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2228]">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">bolt</span> Быстрые действия
                    </h3>
                </div>
                <div className="p-4 flex flex-col gap-2">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-primary">play_arrow</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-white">Пройти новый тест</span>
                    </Link>
                    <Link
                      to="/history"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-primary">history</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-white">Посмотреть историю</span>
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
