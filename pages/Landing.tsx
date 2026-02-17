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
            {/* Image Placeholder */}
            <div className="lg:w-1/2 w-full relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-emerald-500/30 opacity-60 blur-3xl rounded-full"></div>
                <div className="relative w-full aspect-square lg:aspect-[4/3] bg-white dark:bg-[#1e272e] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA5gnACYbKZ2O946sYfB6-g7nDBK4IcXULvRWPIGMGzvwQGdozfgz3CFogAeYURJG5JH50ifogAR8k0LoUcKyOczcjFdYlDrXC67ob9nz6YKa2KMvAMDS0F77f8diiUPXTIdbsLzj6ZrheoHZKi0GkysHaNlaVPJs-KpThywEzJX_hRClEdOkPvV4xbOPTMZCsquRL-7Ptc5-OtN5EDJR1pP0Ovj7HkwoO1C3zTfw2tpiex_FeITVypOmTdGbbrji4PdjDhzWZUg_U')" }}></div>
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

      {/* How it Works */}
      <section className="px-6 py-16 bg-white dark:bg-[#131b20] border-y border-slate-100 dark:border-[#283843]" id="how-it-works">
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
                    <div key={item.step} className="group relative flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-background-light dark:bg-[#1d2830] p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
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

      {/* Footer */}
      <footer className="bg-white dark:bg-[#131b20] border-t border-slate-200 dark:border-[#283843] py-12 px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
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
      </footer>
    </div>
  );
};