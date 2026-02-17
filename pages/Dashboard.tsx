import React from 'react';
import { Link } from 'react-router-dom';

const recentResults = [
  {
    title: "Личность (Big Five)",
    date: "Вчера",
    icon: "psychology",
    color: "text-emerald-500",
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-500/10",
    score: "85% Совп.",
    desc: "Высокая открытость и добросовестность"
  },
  {
    title: "Карьерная ориентация",
    date: "3 дня назад",
    icon: "work",
    color: "text-blue-500",
    bg: "bg-blue-500",
    bgLight: "bg-blue-500/10",
    tags: ["Маркетинг", "Продукт"],
    desc: "Идеальная роль: Growth Product Manager"
  },
  {
    title: "Эмоциональный интеллект",
    date: "1 неделю назад",
    icon: "favorite",
    color: "text-purple-500",
    bg: "bg-purple-500",
    bgLight: "bg-purple-500/10",
    scoreObj: { val: 7.8, avg: 6.2 },
    desc: "Обнаружен высокий уровень эмпатии."
  }
];

// Карточки тестов теперь имеют поле `id`, соответствующее ключам в assessmentData.ts
const assessmentsUI = [
  {
    id: "skills-leadership",
    title: "Лидерский потенциал",
    desc: "Оцените свой стиль лидерства и определите зоны роста как руководителя.",
    icon: "rocket_launch",
    gradient: "from-blue-600 to-cyan-500",
    time: "5 мин",
    isNew: true,
    action: "Начать"
  },
  {
    id: "personality-big5",
    title: "Личность (Big Five)",
    desc: "Классический психологический тест на 5 основных черт характера.",
    icon: "palette",
    gradient: "from-purple-600 to-pink-500",
    time: "7 мин",
    action: "Начать"
  },
  {
    id: "health-burnout",
    title: "Уровень выгорания",
    desc: "Поймите свои триггеры стресса и уровень эмоционального истощения.",
    icon: "self_improvement",
    gradient: "from-amber-500 to-orange-600",
    time: "4 мин",
    action: "Проверить",
    secondary: true
  },
  {
    title: "Когнитивные способности",
    desc: "Комплексная оценка логического мышления. (В разработке)",
    icon: "psychology_alt",
    gradient: "from-emerald-600 to-teal-500",
    time: "30 мин",
    completed: true,
    disabled: true
  },
  {
    title: "Командная динамика",
    desc: "Узнайте свою роль в коллективе. (Скоро)",
    icon: "groups",
    gradient: "from-indigo-600 to-blue-500",
    time: "12 мин",
    action: "Скоро",
    disabled: true
  },
  {
    id: "career-riasec",
    title: "Карьера (RIASEC)",
    desc: "Выясните, что на самом деле движет вами в профессиональной среде.",
    icon: "work_history",
    gradient: "from-rose-500 to-red-600",
    time: "6 мин",
    action: "Начать"
  }
];

export const Dashboard: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">
      {/* Header */}
      <header className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">Привет, Алексей! 👋</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Готов раскрыть свой истинный потенциал сегодня?</p>
        </div>
        <div className="flex items-center gap-3 rounded-full bg-white dark:bg-[#1d2830] px-4 py-2 shadow-sm border border-slate-200 dark:border-slate-800">
          <span className="material-symbols-outlined text-primary text-xl">calendar_today</span>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">24 Окт, 2023</span>
        </div>
      </header>

      {/* Recent Insights */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Недавние инсайты</h2>
          <Link to="/history" className="text-sm font-medium text-primary hover:text-primary/80">Смотреть все</Link>
        </div>
        <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {recentResults.map((result, i) => (
            <Link to="/results/1" key={i} className="min-w-[280px] flex-1 rounded-2xl bg-white dark:bg-[#1d2830] p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between group cursor-pointer hover:border-primary/50 transition-all">
              <div className="mb-4 flex items-start justify-between">
                <div className={`rounded-lg ${result.bgLight} p-2 ${result.color}`}>
                  <span className="material-symbols-outlined">{result.icon}</span>
                </div>
                <span className="text-xs font-semibold text-slate-400">{result.date}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{result.title}</h3>
                {result.score && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="relative h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div className={`absolute left-0 top-0 h-full w-[85%] rounded-full ${result.bg}`}></div>
                    </div>
                    <span className={`text-sm font-bold ${result.color}`}>{result.score}</span>
                  </div>
                )}
                {result.tags && (
                  <div className="mt-3 flex gap-2">
                    {result.tags.map(tag => (
                      <span key={tag} className="rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">{tag}</span>
                    ))}
                  </div>
                )}
                {result.scoreObj && (
                  <div className="mt-3 flex items-center justify-between">
                     <div className="flex flex-col items-center">
                        <div className={`h-10 w-10 rounded-full border-2 border-purple-500 flex items-center justify-center text-xs font-bold text-purple-500`}>{result.scoreObj.val}</div>
                        <span className="text-[10px] mt-1 text-slate-400">EQ Балл</span>
                     </div>
                     <div className="flex flex-col items-center opacity-50">
                        <div className="h-8 w-8 rounded-full border-2 border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-500">{result.scoreObj.avg}</div>
                        <span className="text-[10px] mt-1 text-slate-400">Ср.</span>
                     </div>
                  </div>
                )}
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{result.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Available Assessments */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Доступные тесты</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assessmentsUI.map((test, i) => (
            <div key={i} className={`group flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#1d2830] shadow-sm border border-slate-200 dark:border-slate-800 ${test.disabled ? 'opacity-70 grayscale' : 'hover:shadow-md transition-shadow'}`}>
              <div className="relative h-32 w-full overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-r ${test.gradient} opacity-90`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-5xl opacity-50">{test.icon}</span>
                </div>
                {test.isNew && <div className="absolute right-3 top-3 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">Новый</div>}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{test.title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 flex-1">{test.desc}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span>{test.time}</span>
                  </div>
                  {test.completed ? (
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-medium text-emerald-500">Завершен</span>
                       <Link to="/results/1" className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-500 hover:bg-emerald-500/20 transition-colors">Результат</Link>
                    </div>
                  ) : test.disabled ? (
                      <span className="rounded-lg px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed">
                        В разработке
                      </span>
                  ) : (
                    <Link to={`/assessment/${test.id}`} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${test.secondary ? 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700' : 'bg-primary text-white hover:bg-primary/90'}`}>
                      {test.action}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 text-center text-sm text-slate-500 dark:text-slate-600">
        <p>© 2023 LifeCompass AI. Все права защищены.</p>
      </footer>
    </div>
  );
};
