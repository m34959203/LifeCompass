import React from 'react';
import { Link } from 'react-router-dom';

export const Landing: React.FC = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden text-slate-900 dark:text-white">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-[#283843] px-6 py-4 lg:px-20 bg-white dark:bg-[#131b20] sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="size-8 text-primary">
            <span className="material-symbols-outlined text-3xl">school</span>
          </div>
          <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">LifeCompass Uni</h2>
        </div>
        <div className="flex flex-1 justify-end gap-8">
          <div className="hidden md:flex items-center gap-9">
            <a href="#features" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium">Абитуриентам</a>
            <a href="#how-it-works" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium">Студентам</a>
            <a href="#pricing" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium">Вузам</a>
          </div>
          <Link to="/dashboard" className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-6 bg-primary hover:bg-primary/90 transition-colors text-white text-sm font-bold shadow-md shadow-primary/20">
            Личный кабинет
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 py-12 lg:px-20 lg:py-20 flex justify-center bg-background-light dark:bg-background-dark">
        <div className="w-full max-w-[1200px] flex flex-col lg:flex-row gap-10 items-center">
            <div className="flex flex-col gap-6 lg:w-1/2 text-left z-10">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1d2830] px-3 py-1 text-xs font-medium text-primary shadow-sm">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    <span>Университетский стандарт</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-black leading-[1.1] tracking-[-0.033em]">
                    Выбери профессию <br/> и построй карьеру <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">осознанно</span>
                </h1>
                <p className="text-slate-500 text-lg font-normal leading-relaxed max-w-[540px]">
                    Платформа диагностики для абитуриентов и студентов. Определи свои сильные стороны, выбери специальность и развивай Soft Skills с помощью ИИ.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Link to="/dashboard" className="flex items-center justify-center rounded-xl h-12 px-8 bg-primary hover:bg-blue-600 transition-colors text-white text-base font-bold shadow-lg shadow-primary/30">
                        <span>Начать диагностику</span>
                        <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                    </Link>
                    <button className="flex items-center justify-center rounded-xl h-12 px-8 bg-white dark:bg-[#1d2830] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors text-slate-900 dark:text-white text-base font-bold shadow-sm">
                        <span>Для учебных заведений</span>
                    </button>
                </div>
            </div>
            {/* Hero Visual */}
            <div className="lg:w-1/2 w-full relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-emerald-500/30 opacity-60 blur-3xl rounded-full"></div>
                <div className="relative w-full aspect-square lg:aspect-[4/3] bg-white dark:bg-[#1e272e] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="grid grid-cols-3 gap-4 p-8 w-full max-w-[360px]">
                        {[
                          { icon: 'psychology', color: 'from-purple-500 to-fuchsia-600', label: 'Big Five' },
                          { icon: 'work_history', color: 'from-blue-500 to-indigo-600', label: 'RIASEC' },
                          { icon: 'handshake', color: 'from-slate-500 to-slate-700', label: 'Soft Skills' },
                          { icon: 'battery_alert', color: 'from-orange-500 to-red-500', label: 'Стресс' },
                          { icon: 'diamond', color: 'from-emerald-500 to-teal-600', label: 'Ценности' },
                          { icon: 'smart_toy', color: 'from-primary to-blue-600', label: 'AI' },
                        ].map((item, i) => (
                          <div key={i} className="flex flex-col items-center gap-2 group">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                              <span className="material-symbols-outlined text-xl">{item.icon}</span>
                            </div>
                            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-[#131b20]/90 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-lg">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">psychology_alt</span>
                        </div>
                        <div>
                            <div className="text-sm font-bold">Карьерный навигатор</div>
                            <div className="text-slate-500 text-xs">Анализ предрасположенностей к специальностям</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-white dark:bg-[#131b20] border-y border-slate-100 dark:border-[#283843]" id="features">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col gap-4 mb-12 text-center items-center">
            <h2 className="text-primary font-bold tracking-wider uppercase text-sm">Возможности</h2>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight max-w-[720px]">Всё для вашего профессионального роста</h1>
            <p className="text-slate-500 text-base font-normal max-w-[600px]">Платформа сочетает научные методики с искусственным интеллектом для максимально точных результатов.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: 'quiz', title: 'Структурированные тесты', desc: 'Классические психометрические методики (RIASEC, Big Five) с валидированными вопросами.', color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { icon: 'smart_toy', title: 'AI-диалоги', desc: 'Глубокие беседы с ИИ-психологом для оценки soft skills, стресса и мотивации.', color: 'text-purple-500', bg: 'bg-purple-500/10' },
              { icon: 'analytics', title: 'Визуализация результатов', desc: 'Наглядные радарные диаграммы и детальный разбор каждой черты характера.', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { icon: 'history', title: 'История прогресса', desc: 'Все результаты сохраняются локально. Отслеживайте изменения со временем.', color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { icon: 'work', title: 'Карьерные рекомендации', desc: 'AI генерирует персональные рекомендации по карьерным направлениям.', color: 'text-primary', bg: 'bg-primary/10' },
              { icon: 'lock', title: 'Приватность данных', desc: 'Все данные хранятся только на вашем устройстве. Никакой передачи третьим лицам.', color: 'text-red-500', bg: 'bg-red-500/10' },
            ].map((item, i) => (
              <div key={i} className="group flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-background-light dark:bg-[#1d2830] p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                <div className={`w-12 h-12 rounded-lg ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="px-6 py-16 bg-background-light dark:bg-background-dark" id="how-it-works">
         <div className="max-w-[1200px] mx-auto text-center">
            <div className="flex flex-col gap-4 mb-12 items-center">
                <h2 className="text-primary font-bold tracking-wider uppercase text-sm">Методология</h2>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight max-w-[720px]">От школьной скамьи до первой работы</h1>
                <p className="text-slate-500 text-base font-normal max-w-[600px]">Комплексная оценка, которая помогает принять правильное решение при поступлении и во время учебы.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {[
                    { step: 1, title: "Профориентация", desc: "Тесты RIASEC для выбора факультета и специализации.", icon: "school", color: "text-primary", bg: "bg-primary/10" },
                    { step: 2, title: "Soft Skills & Личность", desc: "Оценка Big Five и эмоционального интеллекта для развития надпрофессиональных навыков.", icon: "group", color: "text-purple-500", bg: "bg-purple-500/10" },
                    { step: 3, title: "Карьерный трек", desc: "ИИ строит индивидуальный план развития и рекомендует стажировки.", icon: "timeline", color: "text-emerald-500", bg: "bg-emerald-500/10" }
                ].map((item) => (
                    <div key={item.step} className="group relative flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1d2830] p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white dark:bg-[#28323a] border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 font-bold text-sm shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">{item.step}</div>
                        <div className={`w-12 h-12 rounded-lg ${item.bg} flex items-center justify-center ${item.color} mb-2 group-hover:scale-110 transition-transform`}>
                            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-xl font-bold">{item.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </section>

      {/* Available Assessments */}
      <section className="px-6 py-16 bg-white dark:bg-[#131b20] border-y border-slate-100 dark:border-[#283843]" id="assessments">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="flex flex-col gap-4 mb-12 items-center">
            <h2 className="text-primary font-bold tracking-wider uppercase text-sm">Методики</h2>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight max-w-[720px]">7 проверенных методик</h1>
            <p className="text-slate-500 text-base font-normal max-w-[600px]">Каждая методика направлена на раскрытие определённого аспекта вашей личности.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[
              { title: 'Профориентация RIASEC', type: 'Тест', icon: 'work_history', gradient: 'from-blue-500 to-indigo-600', desc: 'Определите ваш профессиональный тип по классификации Холланда.' },
              { title: 'Тип личности Big 5', type: 'Тест', icon: 'psychology', gradient: 'from-purple-500 to-fuchsia-600', desc: 'Научная оценка 5 главных черт: экстраверсия, открытость и другие.' },
              { title: 'Soft Skills 360', type: 'AI Диалог', icon: 'handshake', gradient: 'from-slate-500 to-slate-700', desc: 'Ситуативный тест на коммуникацию и эмоциональный интеллект.' },
              { title: 'Диагностика выгорания', type: 'AI Диалог', icon: 'battery_alert', gradient: 'from-orange-500 to-red-500', desc: 'Мягкая беседа для оценки уровня стресса и выгорания.' },
              { title: 'Мотивация и ценности', type: 'AI Диалог', icon: 'diamond', gradient: 'from-emerald-500 to-teal-600', desc: 'Поиск истинных драйверов вашей жизни через глубокий диалог.' },
              { title: 'Эмоциональный интеллект', type: 'Тест', icon: 'favorite', gradient: 'from-rose-500 to-pink-600', desc: 'Оценка способности распознавать и управлять эмоциями.' },
              { title: 'Стиль обучения', type: 'AI Диалог', icon: 'school', gradient: 'from-cyan-500 to-blue-600', desc: 'Определите, как вы лучше всего усваиваете информацию.' },
            ].map((item, i) => (
              <div key={i} className={`flex flex-col rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-background-light dark:bg-[#1d2830] hover:shadow-lg transition-all duration-300`}>
                <div className={`h-20 bg-gradient-to-r ${item.gradient} relative`}>
                  <div className="absolute top-3 left-4 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border border-white/10">
                    {item.type}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 mt-10 px-8 py-3 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold transition-colors shadow-lg shadow-primary/30"
          >
            Начать тестирование
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#131b20] border-t border-slate-200 dark:border-[#283843] py-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl text-primary">school</span>
                    <h3 className="text-lg font-bold">LifeCompass Uni</h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">Система поддержки принятия карьерных решений.</p>
            </div>
            {['Студентам', 'Университетам', 'Партнеры'].map(col => (
                <div key={col} className="flex flex-col gap-4">
                    <h4 className="font-bold">{col}</h4>
                    {['О методике', 'Конфиденциальность', 'Контакты'].map((link, i) => (
                        <a key={i} href="#" className="text-slate-500 hover:text-primary text-sm transition-colors">{link}</a>
                    ))}
                </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};
