import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getHistory } from '../services/historyService';

interface ProfileForm {
  name: string;
  age: string;
  field: string;
  university: string;
}

const EXTRA_KEY = 'lifecompass_profile_extra';

const loadExtra = (): { age: string; field: string } => {
  try {
    const saved = localStorage.getItem(EXTRA_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { age: '', field: '' };
};

const saveExtra = (data: { age: string; field: string }) => {
  localStorage.setItem(EXTRA_KEY, JSON.stringify(data));
};

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [isEditing, setIsEditing] = useState(false);
  const extra = loadExtra();
  const [editForm, setEditForm] = useState<ProfileForm>({
    name: user?.name || '',
    age: extra.age,
    field: extra.field,
    university: user?.university || '',
  });

  const historyCount = user ? getHistory(user.id).length : 0;

  useEffect(() => {
    setEditForm({
      name: user?.name || '',
      age: extra.age,
      field: extra.field,
      university: user?.university || '',
    });
  }, [user]);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleSave = () => {
    updateProfile({ name: editForm.name, university: editForm.university });
    saveExtra({ age: editForm.age, field: editForm.field });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: user?.name || '',
      age: extra.age,
      field: extra.field,
      university: user?.university || '',
    });
    setIsEditing(false);
  };

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
                {user?.name ? user.name.charAt(0).toUpperCase() : 'П'}
              </span>
            </div>
        </div>
        <div className="flex flex-col items-center md:items-start flex-1 gap-2 pt-2">
            <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {user?.name || 'Пользователь'}
                </h2>
                <p className="text-slate-500 dark:text-[#99b1c2]">
                  {user?.email || '—'}
                </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-1">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary border border-primary/20 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">school</span>
                    {user?.university || 'LifeCompass Uni'}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">history</span>
                    {historyCount} тестов пройдено
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
                          value={user?.email || ''}
                          disabled
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-[#0e1419] text-slate-400 text-sm cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-500 dark:text-[#99b1c2] block mb-1.5">Возраст</label>
                        <input
                          type="text"
                          value={editForm.age}
                          onChange={(e) => setEditForm(prev => ({ ...prev, age: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#131b20] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                          placeholder="20"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-500 dark:text-[#99b1c2] block mb-1.5">Специальность</label>
                        <input
                          type="text"
                          value={editForm.field}
                          onChange={(e) => setEditForm(prev => ({ ...prev, field: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#131b20] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                          placeholder="IT / Разработка"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-slate-500 dark:text-[#99b1c2] block mb-1.5">Университет / Город</label>
                        <input
                          type="text"
                          value={editForm.university}
                          onChange={(e) => setEditForm(prev => ({ ...prev, university: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#131b20] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                          placeholder="КазНУ, Алматы"
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
                        <p className="text-base text-slate-900 dark:text-white">{extra.age || 'Не указан'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-500 dark:text-[#99b1c2]">Специальность</span>
                        <p className="text-base text-slate-900 dark:text-white">{extra.field || 'Не указана'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-500 dark:text-[#99b1c2]">Университет / Город</span>
                        <p className="text-base text-slate-900 dark:text-white">{user?.university || 'Не указан'}</p>
                      </div>
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
