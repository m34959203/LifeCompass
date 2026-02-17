import React from 'react';
import { RadarChart } from '../components/RadarChart';
import { Link } from 'react-router-dom';

const radarData = [
  { subject: 'Исследователь', A: 92, fullMark: 100 },
  { subject: 'Артистичность', A: 45, fullMark: 100 },
  { subject: 'Социальность', A: 30, fullMark: 100 },
  { subject: 'Предприимчивость', A: 50, fullMark: 100 },
  { subject: 'Консервативность', A: 65, fullMark: 100 },
  { subject: 'Реалистичность', A: 78, fullMark: 100 },
];

export const Results: React.FC = () => {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 py-8 lg:px-8">
      {/* Breadcrumbs */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-2 text-[#99b1c2] text-sm">
          <Link to="/dashboard">Главная</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Тесты</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-slate-900 dark:text-white">Результаты</span>
        </div>
        <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Результаты профориентации</h1>
        <p className="text-slate-500 dark:text-[#99b1c2] text-base font-normal max-w-2xl">
            Анализ завершен 24 Октября 2023. Детальный разбор ваших профессиональных склонностей и архетипа личности.
        </p>
      </div>

      {/* Hero Result Card */}
      <div className="bg-white dark:bg-[#1c262e] rounded-xl overflow-hidden border border-slate-200 dark:border-[#283843] shadow-lg mb-8">
        <div className="flex flex-col lg:flex-row">
          {/* Left Visual */}
          <div className="lg:w-1/3 relative min-h-[300px] lg:min-h-full">
            <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBecspg9H6MVhDrJ4AeoCFFb3pv66Iy8cuT7TZ6E34TZuf9EZQnuRVSJrA27bQHS5q_G8D0nwpuq_rYWxUlJO8H3tdpvK0OFl7Wbss9UUnCiV_5PCI85nK3CzcGC-0h7d2pRQpqGDfeq4Bq1j2wjTskAskZziFZBCdM-TiNN6VY7uyazIc9UBEm09u2FcpgCXn5_3OSnuKSQHrkD5Ay84dMzk4Ctw48rZoBw-HTbHEyGw4T_81TuEt-0gi5v_qIWO6w_Z4JgFcblG4')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-white dark:from-[#1c262e] via-white/50 dark:via-[#1c262e]/50 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-3 border border-primary/30">
                    Архетип
                </span>
            </div>
          </div>
          {/* Right Content */}
          <div className="flex-1 p-6 lg:p-10 flex flex-col justify-center">
            <h2 className="text-slate-500 dark:text-[#99b1c2] text-sm font-bold uppercase tracking-wider mb-2">Основной тип личности</h2>
            <h3 className="text-slate-900 dark:text-white text-4xl lg:text-5xl font-black leading-tight mb-4">Исследователь-Аналитик</h3>
            <p className="text-slate-600 dark:text-[#d0dbe5] text-lg leading-relaxed mb-8 max-w-2xl">
                Вы обладаете сильным стремлением к пониманию сложных систем и выявлению скрытых закономерностей. Ваш аналитический ум — ваш главный актив, позволяющий решать задачи, которые другим кажутся невозможными. Вы цените логику выше эмоций и процветаете в среде, где решения принимаются на основе данных.
            </p>
            <div className="flex flex-wrap gap-4">
                <button className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 transition-colors text-white font-bold shadow-[0_0_20px_rgba(46,135,194,0.3)]">
                    <span className="material-symbols-outlined">download</span>
                    <span>Скачать PDF</span>
                </button>
                <button className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-slate-100 dark:bg-[#283843] hover:bg-slate-200 dark:hover:bg-[#344856] transition-colors text-slate-700 dark:text-white font-bold border border-slate-200 dark:border-[#3e5563]">
                    <span className="material-symbols-outlined">share</span>
                    <span>Поделиться</span>
                </button>
                <button className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-transparent hover:bg-slate-100 dark:hover:bg-[#283843] transition-colors text-slate-500 dark:text-[#99b1c2] font-medium">
                    <span className="material-symbols-outlined">refresh</span>
                    <span>Пересдать</span>
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Radar */}
        <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#1c262e] rounded-xl p-6 border border-slate-200 dark:border-[#283843]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-slate-900 dark:text-white text-xl font-bold">Модель Холланда</h3>
                    <button className="text-primary hover:text-slate-900 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">info</span>
                    </button>
                </div>
                <RadarChart data={radarData} />
                <div className="mt-4 flex justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary"></span>
                        <span className="text-slate-700 dark:text-white">Ваш результат</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full border border-dashed border-slate-400 dark:border-[#99b1c2]"></span>
                        <span className="text-slate-500 dark:text-[#99b1c2]">Ср. по выборке</span>
                    </div>
                </div>
            </div>
            {/* Key Insight */}
            <div className="bg-gradient-to-br from-[#2e87c2]/10 to-slate-50 dark:from-[#2e87c2]/20 dark:to-[#1c262e] border border-primary/20 rounded-xl p-6">
                <div className="flex gap-4">
                    <div className="min-w-10 size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">lightbulb</span>
                    </div>
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-1">Доминанта: Исследователь</h4>
                        <p className="text-slate-600 dark:text-[#d0dbe5] text-sm leading-relaxed">
                            Ваш результат 92% в категории "Исследователь" говорит о глубокой потребности наблюдать, учиться, исследовать, анализировать и решать проблемы.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Col: Traits */}
        <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex justify-between items-end">
                <h3 className="text-slate-900 dark:text-white text-2xl font-bold">Детальный анализ черт</h3>
                <span className="text-primary text-sm font-medium cursor-pointer hover:underline">Полный отчет</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { title: "Исследователь (Аналитик)", val: "92%", color: "bg-primary", desc: "Высокая способность к логическому мышлению и научному поиску." },
                    { title: "Реалист (Практик)", val: "78%", color: "bg-[#4a6b82]", desc: "Сильное предпочтение конкретных задач. Вам нравится работать с инструментами." },
                    { title: "Консерватор (Структура)", val: "65%", color: "bg-[#4a6b82]", desc: "Умеренное предпочтение структурированных сред. Вы цените организованность." },
                    { title: "Артистичность (Творчество)", val: "45%", color: "bg-[#4a6b82]", desc: "Вы можете быть креативным в решении проблем, но предпочитаете структуру неопределенности." }
                ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-[#1c262e] border border-slate-200 dark:border-[#283843] rounded-xl p-5 hover:border-primary/40 transition-colors group">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-slate-900 dark:text-white font-bold">{item.title}</h4>
                            <span className={`font-black text-lg ${i===0 ? 'text-primary' : 'text-slate-700 dark:text-white'}`}>{item.val}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-[#283843] h-2 rounded-full mb-3 overflow-hidden">
                            <div className={`${item.color} h-full rounded-full`} style={{ width: item.val }}></div>
                        </div>
                        <p className="text-slate-500 dark:text-[#99b1c2] text-sm leading-snug">{item.desc}</p>
                    </div>
                ))}
            </div>

            <div className="mt-4">
                <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-4">Рекомендуемые следующие шаги</h3>
                <div className="bg-white dark:bg-[#1c262e] border border-slate-200 dark:border-[#283843] rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-[#283843]">
                    <div className="p-5 flex gap-4 items-start hover:bg-slate-50 dark:hover:bg-[#232d36] transition-colors cursor-pointer">
                        <div className="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                            <span className="material-symbols-outlined">work</span>
                        </div>
                        <div className="flex-1">
                            <h5 className="text-slate-900 dark:text-white font-bold mb-1 flex items-center gap-2">
                                Изучить подходящие профессии
                                <span className="material-symbols-outlined text-sm text-slate-400">open_in_new</span>
                            </h5>
                            <p className="text-slate-500 dark:text-[#99b1c2] text-sm mb-2">На основе профиля "Исследователь-Аналитик" рассмотрите роли: Data Scientist, Системный архитектор, Финансовый аналитик.</p>
                            <div className="flex gap-2">
                                {['Технологии', 'Финансы', 'Наука'].map(tag => (
                                    <span key={tag} className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-[#283843] text-slate-600 dark:text-[#d0dbe5]">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="p-5 flex gap-4 items-start hover:bg-slate-50 dark:hover:bg-[#232d36] transition-colors cursor-pointer">
                        <div className="size-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                            <span className="material-symbols-outlined">school</span>
                        </div>
                        <div className="flex-1">
                             <h5 className="text-slate-900 dark:text-white font-bold mb-1 flex items-center gap-2">
                                План обучения
                                <span className="material-symbols-outlined text-sm text-slate-400">open_in_new</span>
                            </h5>
                            <p className="text-slate-500 dark:text-[#99b1c2] text-sm">Улучшите социальные навыки, участвуя в кросс-функциональных семинарах.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};