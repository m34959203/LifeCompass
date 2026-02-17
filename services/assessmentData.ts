import { AssessmentConfig, QuestionOption } from '../types';

// Стандартные опции для квизов (Шкала Лайкерта)
const agreementOptions: QuestionOption[] = [
  { value: 1, label: "Не согласен", color: "bg-red-50 text-red-600 border-red-200" },
  { value: 2, label: "Скорее нет", color: "bg-orange-50 text-orange-600 border-orange-200" },
  { value: 3, label: "Нейтрально", color: "bg-slate-50 text-slate-600 border-slate-200" },
  { value: 4, label: "Скорее да", color: "bg-blue-50 text-blue-600 border-blue-200" },
  { value: 5, label: "Полностью согласен", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
];

const assessmentsDatabase: Record<string, AssessmentConfig> = {
  // 1. ПРОФОРИЕНТАЦИЯ (RIASEC) -> СТРУКТУРИРОВАННЫЙ КВИЗ
  "career-riasec": {
    id: "career-riasec",
    type: "quiz",
    title: "Профориентация (RIASEC)",
    description: "Тест Холланда. Помогает выбрать специальность вуза или направление карьеры.",
    icon: "school", // Changed to school icon
    gradient: "from-blue-600 to-indigo-700",
    questions: [
      // --- Realistic (R) - Техника, природа, инструменты ---
      { id: 1, text: "Мне нравится работать руками: собирать модели, чинить технику, заниматься ремеслом.", category: "Реалистичный", options: agreementOptions },
      { id: 2, text: "Я предпочту работу 'в поле' или лаборатории, чем весь день сидеть в офисе.", category: "Реалистичный", options: agreementOptions },
      { id: 3, text: "Я хорошо разбираюсь в чертежах, схемах или устройстве механизмов.", category: "Реалистичный", options: agreementOptions },
      { id: 4, text: "Мне интересны инженерные специальности или агротехнологии.", category: "Реалистичный", options: agreementOptions },
      { id: 5, text: "Я вижу конкретный результат своей работы лучше, когда делаю что-то материальное.", category: "Реалистичный", options: agreementOptions },
      
      // --- Investigative (I) - Наука, анализ, IT ---
      { id: 6, text: "Я люблю решать сложные математические или логические задачи.", category: "Интеллектуальный", options: agreementOptions },
      { id: 7, text: "Мне нравится читать научные статьи и разбираться в причинах явлений.", category: "Интеллектуальный", options: agreementOptions },
      { id: 8, text: "Я готов часами анализировать большие объемы данных или писать код.", category: "Интеллектуальный", options: agreementOptions },
      { id: 9, text: "В учебе меня больше привлекают теоретические дисциплины и исследования.", category: "Интеллектуальный", options: agreementOptions },
      { id: 10, text: "Я скептически отношусь к информации, пока не проверю факты.", category: "Интеллектуальный", options: agreementOptions },

      // --- Artistic (A) - Творчество, дизайн, медиа ---
      { id: 11, text: "Мне важно иметь свободу самовыражения в работе или учебе.", category: "Артистичный", options: agreementOptions },
      { id: 12, text: "У меня хорошо развито воображение, я часто предлагаю нестандартные идеи.", category: "Артистичный", options: agreementOptions },
      { id: 13, text: "Меня привлекают профессии в сфере дизайна, медиа, архитектуры или искусства.", category: "Артистичный", options: agreementOptions },
      { id: 14, text: "Я люблю посещать выставки, театры или концерты.", category: "Артистичный", options: agreementOptions },
      { id: 15, text: "Рутинная работа по инструкции меня быстро утомляет.", category: "Артистичный", options: agreementOptions },

      // --- Social (S) - Обучение, медицина, сервис ---
      { id: 16, text: "Я получаю удовольствие, объясняя другим сложные вещи.", category: "Социальный", options: agreementOptions },
      { id: 17, text: "Мне важно, чтобы моя профессия приносила пользу обществу.", category: "Социальный", options: agreementOptions },
      { id: 18, text: "Я легко нахожу общий язык с незнакомыми людьми и умею слушать.", category: "Социальный", options: agreementOptions },
      { id: 19, text: "Я участвовал(а) в волонтерских проектах или организации мероприятий.", category: "Социальный", options: agreementOptions },
      { id: 20, text: "Меня интересует психология, педагогика или медицина.", category: "Социальный", options: agreementOptions },

      // --- Enterprising (E) - Бизнес, управление, право ---
      { id: 21, text: "Мне нравится выступать перед публикой и презентовать идеи.", category: "Предприимчивый", options: agreementOptions },
      { id: 22, text: "Я часто беру на себя роль лидера в групповых проектах.", category: "Предприимчивый", options: agreementOptions },
      { id: 23, text: "Меня мотивирует конкуренция и возможность высокого заработка.", category: "Предприимчивый", options: agreementOptions },
      { id: 24, text: "Я интересуюсь стартапами, маркетингом или политикой.", category: "Предприимчивый", options: agreementOptions },
      { id: 25, text: "Я умею убеждать людей и вести переговоры.", category: "Предприимчивый", options: agreementOptions },

      // --- Conventional (C) - Финансы, администрирование ---
      { id: 26, text: "Я люблю порядок, четкие инструкции и структурированность.", category: "Конвенциональный", options: agreementOptions },
      { id: 27, text: "Я внимателен к деталям и редко допускаю ошибки в расчетах или текстах.", category: "Конвенциональный", options: agreementOptions },
      { id: 28, text: "Мне нравится работать с документами, таблицами и базами данных.", category: "Конвенциональный", options: agreementOptions },
      { id: 29, text: "Я предпочитаю стабильность и предсказуемость в карьере.", category: "Конвенциональный", options: agreementOptions },
      { id: 30, text: "Я хорошо планирую свое время и бюджет.", category: "Конвенциональный", options: agreementOptions }
    ]
  },

  // 2. ТИП ЛИЧНОСТИ (Big Five) -> СТРУКТУРИРОВАННЫЙ КВИЗ
  "personality-big5": {
    id: "personality-big5",
    type: "quiz",
    title: "Психологический портрет (Big 5)",
    description: "Научная оценка личности. Помогает понять свои сильные стороны в учебе и работе.",
    icon: "psychology_alt",
    gradient: "from-purple-600 to-fuchsia-700",
    questions: [
      // --- Extraversion (Экстраверсия) ---
      { id: 101, text: "В новой компании я быстро становлюсь активным участником беседы.", category: "Экстраверсия", options: agreementOptions },
      { id: 102, text: "Я заряжаюсь энергией от общения, одиночество меня утомляет.", category: "Экстраверсия", options: agreementOptions },
      { id: 103, text: "Я не боюсь высказывать свое мнение публично.", category: "Экстраверсия", options: agreementOptions },
      { id: 104, text: "У меня широкий круг общения и много знакомых.", category: "Экстраверсия", options: agreementOptions },
      { id: 105, text: "Я полон энергии и энтузиазма.", category: "Экстраверсия", options: agreementOptions },

      // --- Conscientiousness (Добросовестность/Организованность) ---
      { id: 106, text: "Я всегда сдаю учебные задания или проекты в срок.", category: "Добросовестность", options: agreementOptions },
      { id: 107, text: "Я уделяю внимание мелочам, которые другие могут не заметить.", category: "Добросовестность", options: agreementOptions },
      { id: 108, text: "У меня всегда есть план действий на день или неделю.", category: "Добросовестность", options: agreementOptions },
      { id: 109, text: "Я требую от себя высокого качества работы.", category: "Добросовестность", options: agreementOptions },
      { id: 110, text: "Я поддерживаю порядок на своем рабочем месте и в файлах.", category: "Добросовестность", options: agreementOptions },

      // --- Openness (Открытость опыту) ---
      { id: 111, text: "Мне нравится изучать абстрактные теории и философские концепции.", category: "Открытость", options: agreementOptions },
      { id: 112, text: "Я часто ищу новые способы решения привычных задач.", category: "Открытость", options: agreementOptions },
      { id: 113, text: "Искусство, музыка или литература играют важную роль в моей жизни.", category: "Открытость", options: agreementOptions },
      { id: 114, text: "Я любознателен и постоянно учусь чему-то новому.", category: "Открытость", options: agreementOptions },
      { id: 115, text: "Я легко адаптируюсь к переменам и новым условиям.", category: "Открытость", options: agreementOptions },

      // --- Neuroticism (Нейротизм/Эмоциональная стабильность - reverse scored mentally usually, but here aiming for high score = high trait) ---
      // Note: High score here means High Neuroticism (Sensitivity). AI will interpret context.
      { id: 116, text: "Я часто переживаю из-за возможных неудач в будущем.", category: "Нейротизм", options: agreementOptions },
      { id: 117, text: "Критика со стороны преподавателей или начальника сильно меня расстраивает.", category: "Нейротизм", options: agreementOptions },
      { id: 118, text: "У меня часто меняется настроение без видимой причины.", category: "Нейротизм", options: agreementOptions },
      { id: 119, text: "В стрессовых ситуациях (экзамены, дедлайны) я легко теряю самообладание.", category: "Нейротизм", options: agreementOptions },
      { id: 120, text: "Я склонен долго анализировать свои ошибки.", category: "Нейротизм", options: agreementOptions },

      // --- Agreeableness (Доброжелательность) ---
      { id: 121, text: "Я считаю, что большинству людей можно доверять.", category: "Доброжелательность", options: agreementOptions },
      { id: 122, text: "Мне нравится помогать сокурсникам или коллегам, даже в ущерб своему времени.", category: "Доброжелательность", options: agreementOptions },
      { id: 123, text: "Я стараюсь избегать конфликтов и споров.", category: "Доброжелательность", options: agreementOptions },
      { id: 124, text: "Я умею сопереживать чужим проблемам.", category: "Доброжелательность", options: agreementOptions },
      { id: 125, text: "Я вежлив и тактичен в общении со всеми.", category: "Доброжелательность", options: agreementOptions }
    ]
  },

  // 3. SOFT SKILLS 360 -> AI СИТУАТИВНЫЙ ТЕСТ
  "soft-skills-360": {
    id: "soft-skills-360",
    type: "chat",
    title: "Soft Skills: Кейс-интервью",
    description: "Симуляция реальных ситуаций в учебе и на работе. Проверь свои навыки коммуникации.",
    icon: "handshake",
    gradient: "from-slate-600 to-slate-800",
    initialMessage: "Привет! Я твой виртуальный ментор. Давай проверим, насколько ты готов к реальным вызовам в университете или на работе. Я буду моделировать ситуации, а ты — решать их. Готов?",
    systemInstruction: `
      Ты — опытный карьерный консультант и ментор при университете. Твоя задача — оценить Soft Skills студента/абитуриента через метод кейсов (Situational Judgment Test).
      
      Алгоритм:
      1. Предложи ситуацию, релевантную для студента или молодого специалиста. Примеры:
         - "Групповой проект. Один участник ничего не делает, а дедлайн завтра. Твои действия?"
         - "Ты получил низкую оценку за работу, в которую вложил много сил, и считаешь это несправедливым. Как будешь говорить с преподавателем?"
         - "Тебе предложили стажировку мечты, но она совпадает с важными экзаменами."
      2. Спроси пользователя: "Твои действия?"
      3. Оцени ответ по критериям: Лидерство, Коммуникация, Решение проблем, Эмоциональный интеллект.
      4. Дай краткий фидбек (максимум 2 предложения) и переходи к следующему кейсу.
      5. После 3 кейсов выдай итоговое резюме: "Твои суперсилы" и "Зоны роста".
    `
  },

  // 4. СТРЕСС И ВЫГОРАНИЕ
  "health-stress": {
    id: "health-stress",
    type: "chat",
    title: "Уровень стресса и выгорания",
    description: "Анонимная беседа для оценки психоэмоционального состояния перед экзаменами или сессией.",
    icon: "battery_alert",
    gradient: "from-orange-500 to-red-600",
    initialMessage: "Привет. Учеба и работа могут сильно давить. Давай честно поговорим о том, как ты себя чувствуешь. Как ты оцениваешь свой уровень усталости сейчас (1-10)?",
    systemInstruction: `
      Ты — эмпатичный университетский психолог.
      Твоя цель — выявить признаки академического выгорания (Academic Burnout).
      Веди мягкий диалог. Спрашивай про сон, мотивацию к учебе, физическое состояние.
      В конце дай техники саморегуляции и, если нужно, порекомендуй обратиться к специалисту (мягко).
    `
  },
  
  // 5. МОТИВАЦИЯ
  "values-motivation": {
    id: "values-motivation",
    type: "chat",
    title: "Карьерные ценности",
    description: "Определи, что для тебя важнее: деньги, стабильность, творчество или помощь людям.",
    icon: "diamond",
    gradient: "from-emerald-600 to-teal-700",
    initialMessage: "Привет! Представь, что ты уже закончил вуз. Опиши свой идеальный рабочий день через 5 лет.",
    systemInstruction: `
      Ты — коуч по профориентации. Помоги пользователю сформулировать его "Карьерный якорь".
      Анализируй ответы, чтобы понять ценности: Автономия, Служение, Вызов, Стабильность, Предпринимательство.
    `
  }
};

export const getAssessmentById = (id: string): AssessmentConfig | undefined => {
  return assessmentsDatabase[id];
};

export const getAllAssessments = () => Object.values(assessmentsDatabase);