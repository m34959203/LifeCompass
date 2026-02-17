import React from 'react';

export const Profile: React.FC = () => {
  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto flex flex-col gap-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Профиль</h1>
        <p className="text-slate-500 dark:text-[#99b1c2] text-base lg:text-lg">Управление аккаунтом и подпиской.</p>
      </div>

      {/* Profile Card */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white dark:bg-[#1e272e] p-6 lg:p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative group">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-cover bg-center border-4 border-white dark:border-[#28323a] shadow-lg" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDDR4VqwOc3wEAkLClRZXbiJDTww-rb4-9neK-pDivcuWeYPQ_nyQUanKmh5uyWvBsda1LegHYNYHFTdbwJT0ceeGR1y9qni9SJBWCixmZhGbH6PR91TmLbvhaBqI-TDoY806ePv2c8PdFC9JyVODrKWj7TaQnf2MzwXaIDB4uA2YzRfJuokdeIY4kdSwxLVNlznu9QsiXHRLcwWG0xfcAV2RXVFb2VamMkXUwJ7HF-keAdV_9xQ65cucUiNKc69qWn7mWNByEdYQw')" }}></div>
            <button className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white p-2 rounded-full shadow-md transition-transform active:scale-95">
                <span className="material-symbols-outlined text-lg">edit</span>
            </button>
        </div>
        <div className="flex flex-col items-center md:items-start flex-1 gap-2 pt-2">
            <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Алексей Волков</h2>
                <p className="text-slate-500 dark:text-[#99b1c2]">alexey.v@example.com</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-1">
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Участник с Марта 2023</span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">verified</span> Подтвержден
                </span>
            </div>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
            <button className="w-full md:w-auto px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium">Редактировать</button>
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
                    <button className="text-primary hover:text-primary/80 text-sm font-medium">Обновить</button>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <span className="text-sm font-medium text-slate-500 dark:text-[#99b1c2]">Возраст</span>
                        <p className="text-base text-slate-900 dark:text-white">29 лет</p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-slate-500 dark:text-[#99b1c2]">Сфера</span>
                        <p className="text-base text-slate-900 dark:text-white">IT / Разработка</p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-slate-500 dark:text-[#99b1c2]">Локация</span>
                        <p className="text-base text-slate-900 dark:text-white">Алматы, Казахстан</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-[#1e272e] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-fit">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2228]">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">card_membership</span> Подписка
                    </h3>
                    <span className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wide bg-gradient-to-r from-indigo-500 to-purple-500 text-white">Pro План</span>
                </div>
                <div className="p-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <p className="text-base font-medium text-slate-900 dark:text-white">LifeCompass Pro (Годовая)</p>
                            <p className="text-sm text-slate-500 dark:text-[#99b1c2]">Следующее списание: 15 Марта 2024</p>
                        </div>
                        <button className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">Управление</button>
                    </div>
                </div>
            </div>
            
            <div className="bg-white dark:bg-[#1e272e] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-fit">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2228]">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">tune</span> Настройки
                    </h3>
                </div>
                <div className="p-6 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                         <div className="flex flex-col">
                             <span className="text-sm font-medium text-slate-900 dark:text-white">Темная тема</span>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" defaultChecked={false} className="sr-only peer" />
                             <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                         </label>
                    </div>
                     <div className="flex items-center justify-between">
                         <div className="flex flex-col">
                             <span className="text-sm font-medium text-slate-900 dark:text-white">Уведомления</span>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" defaultChecked={true} className="sr-only peer" />
                             <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                         </label>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};