import React from 'react';

export const History: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1200px] px-4 md:px-6 py-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">История тестов и тренды</h1>
            <p className="text-slate-500 dark:text-text-secondary text-base font-normal max-w-2xl">Отслеживайте свое психологическое состояние и профессиональный рост с помощью ИИ-аналитики.</p>
        </div>
        <button className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Новый тест
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-slate-900 dark:text-white text-lg font-bold">Динамика благополучия</h3>
                        <span className="bg-primary/20 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">Бета</span>
                    </div>
                    <p className="text-slate-500 dark:text-text-secondary text-sm">Оценка ментальной устойчивости за 60 дней</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-background-dark rounded-lg p-1 border border-slate-200 dark:border-border-dark">
                    <button className="px-3 py-1.5 rounded text-xs font-medium bg-primary text-white shadow-sm transition-all">Устойчивость</button>
                    <button className="px-3 py-1.5 rounded text-xs font-medium text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white transition-all">Стресс</button>
                    <button className="px-3 py-1.5 rounded text-xs font-medium text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white transition-all">Фокус</button>
                </div>
            </div>
            <div className="flex items-baseline gap-3 mb-6 relative z-10">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">84<span className="text-xl text-slate-400 dark:text-text-secondary font-normal">/100</span></span>
                <div className="flex items-center gap-1 text-[#0bda5b] bg-[#0bda5b]/10 px-2 py-0.5 rounded text-sm font-medium">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    <span>+5% к прошлому месяцу</span>
                </div>
            </div>
            {/* Simple SVG Line Chart */}
            <div className="w-full h-[220px] relative z-10">
                <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-300 dark:text-text-secondary/50 pointer-events-none">
                     {[...Array(5)].map((_,i) => <div key={i} className="w-full border-b border-dashed border-slate-200 dark:border-border-dark h-0"></div>)}
                </div>
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                     <defs>
                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#2e87c2" stopOpacity="0.3"></stop>
                            <stop offset="100%" stopColor="#2e87c2" stopOpacity="0"></stop>
                        </linearGradient>
                     </defs>
                     <path d="M0,70 Q10,65 20,50 T40,45 T60,30 T80,35 T100,20 V100 H0 Z" fill="url(#chartGradient)"></path>
                     <path d="M0,70 Q10,65 20,50 T40,45 T60,30 T80,35 T100,20" fill="none" stroke="#2e87c2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                     <circle cx="20" cy="50" fill="#2e87c2" r="1.5" className="hover:r-3 transition-all cursor-pointer"></circle>
                     <circle cx="40" cy="45" fill="#2e87c2" r="1.5" className="hover:r-3 transition-all cursor-pointer"></circle>
                     <circle cx="60" cy="30" fill="#2e87c2" r="1.5" className="hover:r-3 transition-all cursor-pointer"></circle>
                     <circle cx="80" cy="35" fill="#2e87c2" r="1.5" className="hover:r-3 transition-all cursor-pointer"></circle>
                     <circle cx="100" cy="20" fill="#fff" r="2.5" stroke="#2e87c2" strokeWidth="1" className="animate-pulse"></circle>
                </svg>
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400 dark:text-text-secondary font-medium px-1">
                <span>1 Сен</span><span>15 Сен</span><span>1 Окт</span><span>15 Окт</span><span>1 Ноя</span>
            </div>
        </div>
        
        {/* Latest Insight */}
        <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-primary text-white rounded-xl p-6 relative overflow-hidden flex-1 flex flex-col justify-between">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                     <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100"><path d="M0 100 C 20 0 50 0 100 100 Z" fill="white"></path></svg>
                </div>
                <div className="relative z-10">
                    <h3 className="font-bold text-lg mb-1">Свежий инсайт</h3>
                    <p className="text-blue-100 text-sm mb-4">Из теста "Лидерские способности" от 24 Окт.</p>
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                        <p className="text-sm font-medium leading-relaxed">"Вы демонстрируете исключительное стратегическое мышление. Рассмотрите роли, связанные с долгосрочным планированием."</p>
                    </div>
                </div>
                <button className="relative z-10 w-full mt-4 bg-white text-primary font-bold text-sm py-2.5 rounded-lg hover:bg-blue-50 transition-colors">Читать полный анализ</button>
            </div>
            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 flex items-center justify-between">
                 <div>
                    <p className="text-slate-500 dark:text-text-secondary text-xs font-medium uppercase tracking-wider">Всего тестов</p>
                    <p className="text-slate-900 dark:text-white text-2xl font-bold">24</p>
                 </div>
                 <div>
                    <p className="text-slate-500 dark:text-text-secondary text-xs font-medium uppercase tracking-wider">Ре-тест через</p>
                    <p className="text-slate-900 dark:text-white text-2xl font-bold">7 дней</p>
                 </div>
            </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {[
            { title: "Индекс когнитивной гибкости", cat: "Мозг", date: "24 Окт, 2023", res: "Высокая адаптивность", color: "text-green-400", bg: "bg-green-400/10", dot: "bg-green-400", icon: "psychology", iconColor: "text-blue-400", iconBg: "bg-blue-500/10" },
            { title: "Тест профориентации", cat: "Карьера", date: "10 Окт, 2023", res: "Креативный лидер", color: "text-purple-400", bg: "bg-purple-400/10", dot: "bg-purple-400", icon: "work", iconColor: "text-purple-400", iconBg: "bg-purple-500/10" },
            { title: "Сканирование выгорания", cat: "Здоровье", date: "28 Сен, 2023", res: "Умеренный риск", color: "text-orange-400", bg: "bg-orange-400/10", dot: "bg-orange-400", icon: "self_improvement", iconColor: "text-orange-400", iconBg: "bg-orange-500/10" }
        ].map((item, i) => (
            <div key={i} className="group flex flex-col md:flex-row gap-5 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 hover:border-primary/50 hover:shadow-lg transition-all duration-300 items-start md:items-center">
                <div className="flex items-center gap-4 flex-1">
                    <div className={`h-12 w-12 rounded-full ${item.iconBg} flex items-center justify-center ${item.iconColor} shrink-0`}>
                        <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold text-lg group-hover:text-primary transition-colors">{item.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-500 dark:text-text-secondary bg-slate-100 dark:bg-background-dark px-2 py-0.5 rounded border border-slate-200 dark:border-border-dark">{item.cat}</span>
                            <span className="text-xs text-slate-500 dark:text-text-secondary flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span> {item.date}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex flex-col items-start md:items-end">
                        <span className="text-xs text-slate-400 dark:text-text-secondary uppercase tracking-wider font-semibold">Результат</span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full ${item.bg} px-2.5 py-0.5 text-sm font-medium ${item.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`}></span>
                            {item.res}
                        </span>
                    </div>
                    <button className="text-sm font-medium text-slate-700 dark:text-white bg-slate-100 dark:bg-background-dark hover:bg-primary hover:text-white border border-slate-200 dark:border-border-dark hover:border-primary px-4 py-2 rounded-lg transition-all shadow-sm">
                        Подробнее
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};