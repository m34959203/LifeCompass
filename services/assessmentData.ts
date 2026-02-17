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
    description: "Классический тест Холланда. Определяет ваш профессиональный тип личности.",
    icon: "work_history",
    gradient: "from-blue-500 to-indigo-600",
    questions: [
      // Realistic (R)
      { id: 1, text: "Мне нравится ремонтировать технику или собирать мебель.", category: "Реалистичный", options: agreementOptions },
      { id: 7, text: "Я предпочту работу на свежем воздухе работе в офисе.", category: "Реалистичный", options: agreementOptions },
      { id: 9, text: "Я умею обращаться с инструментами и механизмами.", category: "Реалистичный", options: agreementOptions },
      
      // Investigative (I)
      { id: 2, text: "Я люблю решать сложные математические задачи.", category: "Интеллектуальный", options: agreementOptions },
      { id: 8, text: "Я люблю изучать научные факты и теории.", category: "Интеллектуальный", options: agreementOptions },
      { id: 10, text: "Мне нравится анализировать данные и искать закономерности.", category: "Интеллектуальный", options: agreementOptions },

      // Artistic (A)
      { id: 3, text: "Мне важно выражать себя через искусство (музыка, письмо, дизайн).", category: "Артистичный", options: agreementOptions },
      { id: 11, text: "У меня богатое воображение и нестандартный взгляд на вещи.", category: "Артистичный", options: agreementOptions },
      { id: 12, text: "Меня привлекает творческая свобода больше, чем четкие правила.", category: "Артистичный", options: agreementOptions },

      // Social (S)
      { id: 4, text: "Я люблю помогать людям решать их личные проблемы.", category: "Социальный", options: agreementOptions },
      { id: 13, text: "Мне легко находить общий язык с новыми людьми.", category: "Социальный", options: agreementOptions },
      { id: 14, text: "Я предпочитаю работу в команде индивидуальной работе.", category: "Социальный", options: agreementOptions },

      // Enterprising (E)
      { id: 5, text: "Мне нравится убеждать людей и продавать идеи.", category: "Предприимчивый", options: agreementOptions },
      { id: 15, text: "Я готов брать на себя ответственность и риски ради успеха.", category: "Предприимчивый", options: agreementOptions },
      { id: 16, text: "Я амбициозен и стремлюсь к руководящим позициям.", category: "Предприимчивый", options: agreementOptions },

      // Conventional (C)
      { id: 6, text: "Я предпочитаю работать с документами и четкими инструкциями.", category: "Конвенциональный", options: agreementOptions },
      { id: 17, text: "Я люблю порядок, систематизацию и планирование.", category: "Конвенциональный", options: agreementOptions },
      { id: 18, text: "Я внимателен к деталям и редко допускаю ошибки в расчетах.", category: "Конвенциональный", options: agreementOptions }
    ]
  },

  // 2. ТИП ЛИЧНОСТИ (Big Five) -> СТРУКТУРИРОВАННЫЙ КВИЗ
  "personality-big5": {
    id: "personality-big5",
    type: "quiz",
    title: "Тип личности (Big 5)",
    description: "Научная оценка 5 главных черт характера: Экстраверсия, Открытость и др.",
    icon: "psychology",
    gradient: "from-purple-500 to-fuchsia-600",
    questions: [
      // Extraversion
      { id: 101, text: "Я часто чувствую себя душой компании.", category: "Экстраверсия", options: agreementOptions },
      { id: 106, text: "Я заряжаюсь энергией от общения с людьми.", category: "Экстраверсия", options: agreementOptions },
      { id: 107, text: "Я не боюсь быть в центре внимания.", category: "Экстраверсия", options: agreementOptions },

      // Conscientiousness
      { id: 102, text: "Я всегда готовлюсь ко всему заранее.", category: "Добросовестность", options: agreementOptions },
      { id: 108, text: "Я всегда довожу начатое дело до конца.", category: "Добросовестность", options: agreementOptions },
      { id: 109, text: "Я люблю порядок и следую расписанию.", category: "Добросовестность", options: agreementOptions },

      // Openness
      { id: 103, text: "У меня богатое воображение.", category: "Открытость", options: agreementOptions },
      { id: 110, text: "Мне нравится пробовать новое (еда, хобби, путешествия).", category: "Открытость", options: agreementOptions },
      { id: 111, text: "Меня интересуют абстрактные идеи и искусство.", category: "Открытость", options: agreementOptions },

      // Neuroticism
      { id: 104, text: "Я легко расстраиваюсь из-за мелочей.", category: "Нейротизм", options: agreementOptions },
      { id: 112, text: "Я часто беспокоюсь о будущем.", category: "Нейротизм", options: agreementOptions },
      { id: 113, text: "У меня часто меняется настроение.", category: "Нейротизм", options: agreementOptions },

      // Agreeableness
      { id: 105, text: "Я верю в лучшее в людях.", category: "Доброжелательность", options: agreementOptions },
      { id: 114, text: "Я стараюсь избегать конфликтов.", category: "Доброжелательность", options: agreementOptions },
      { id: 115, text: "Мне нравится заботиться о благополучии других.", category: "Доброжелательность", options: agreementOptions }
    ]
  },

  // 3. SOFT SKILLS 360 -> AI СИТУАТИВНЫЙ ТЕСТ
  "soft-skills-360": {
    id: "soft-skills-360",
    type: "chat",
    title: "Soft Skills 360",
    description: "Практический разбор рабочих кейсов для оценки коммуникации и эмоционального интеллекта.",
    icon: "handshake",
    gradient: "from-slate-500 to-slate-700",
    initialMessage: "Привет! Чтобы оценить твои Soft Skills, давай поиграем. Я буду описывать сложные рабочие ситуации, а ты расскажи, как бы ты поступил. Начнем?",
    systemInstruction: `
      Ты — эксперт по оценке персонала (HR-партнер). Твоя задача — провести Ситуационный Тест (Situational Judgment Test).
      
      Алгоритм:
      1. Предложи конкретную конфликтную или сложную ситуацию (например: "Коллега публично раскритиковал твою идею на совещании", "Ты понимаешь, что не успеваешь сдать проект к дедлайну", "Клиент требует невозможного").
      2. Спроси пользователя: "Твои действия?"
      3. Проанализируй ответ с точки зрения: Эмоционального интеллекта, Ассертивности (уверенности), Навыков переговоров.
      4. Дай краткую обратную связь (что хорошо, а где риск) и переходи к следующей ситуации.
      5. После 3 ситуаций подведи итог: какие Soft Skills являются суперсилой пользователя, а что зона роста.
    `
  },

  // 4. СТРЕСС И ВЫГОРАНИЕ -> AI ЧАТ
  "health-stress": {
    id: "health-stress",
    type: "chat",
    title: "Диагностика выгорания",
    description: "Мягкая беседа с AI-психологом для оценки уровня стресса.",
    icon: "battery_alert",
    gradient: "from-orange-500 to-red-500",
    initialMessage: "Привет. Я здесь, чтобы выслушать. Часто бывает, что работа начинает забирать слишком много сил. Как ты оцениваешь свой уровень энергии на этой неделе по шкале от 1 до 10?",
    systemInstruction: `
      Ты — эмпатичный психолог. Твоя цель — оценить уровень выгорания (Burnout).
      Задавай вопросы по очереди:
      1. Физическое истощение (сон, усталость).
      2. Эмоциональное отстранение (раздражение на коллег, цинизм).
      3. Ощущение неэффективности (кажется ли работа бессмысленной).
      
      Будь аккуратен, не ставь медицинских диагнозов. В конце дай поддержку и 2-3 совета по восстановлению.
    `
  },
  
  // 5. МОТИВАЦИЯ И ЦЕННОСТИ -> AI ЧАТ
  "values-motivation": {
    id: "values-motivation",
    type: "chat",
    title: "Мотивация и ценности",
    description: "Поиск истинных драйверов вашей жизни через диалог.",
    icon: "diamond",
    gradient: "from-emerald-500 to-teal-600",
    initialMessage: "Привет! Давай попробуем заглянуть в будущее. Представь, что тебе не нужно работать ради денег. Чем бы ты занимался?",
    systemInstruction: `
      Ты — коуч по личностному росту.
      Помоги пользователю найти его ценности (Свобода, Безопасность, Власть, Творчество, Помощь).
      Задавай глубокие вопросы. Спрашивай "почему?" на ответы пользователя, чтобы докопаться до сути.
    `
  },

  // 6. ЭМОЦИОНАЛЬНЫЙ ИНТЕЛЛЕКТ -> СТРУКТУРИРОВАННЫЙ КВИЗ
  "emotional-intelligence": {
    id: "emotional-intelligence",
    type: "quiz",
    title: "Эмоциональный интеллект (EQ)",
    description: "Оценка способности распознавать и управлять эмоциями — своими и чужими.",
    icon: "favorite",
    gradient: "from-rose-500 to-pink-600",
    questions: [
      // Самоосознание
      { id: 201, text: "Я хорошо понимаю, какие эмоции испытываю в данный момент.", category: "Самоосознание", options: agreementOptions },
      { id: 202, text: "Я могу объяснить, почему я чувствую то или иное.", category: "Самоосознание", options: agreementOptions },
      { id: 203, text: "Я замечаю, как моё настроение влияет на мои решения.", category: "Самоосознание", options: agreementOptions },

      // Саморегуляция
      { id: 204, text: "Я умею сохранять спокойствие в стрессовых ситуациях.", category: "Саморегуляция", options: agreementOptions },
      { id: 205, text: "Я не принимаю важных решений в состоянии сильных эмоций.", category: "Саморегуляция", options: agreementOptions },
      { id: 206, text: "Я быстро восстанавливаюсь после неудач.", category: "Саморегуляция", options: agreementOptions },

      // Эмпатия
      { id: 207, text: "Я легко распознаю чувства других людей по мимике и жестам.", category: "Эмпатия", options: agreementOptions },
      { id: 208, text: "Когда кому-то плохо, я интуитивно понимаю, что сказать.", category: "Эмпатия", options: agreementOptions },
      { id: 209, text: "Мне легко представить себя на месте другого человека.", category: "Эмпатия", options: agreementOptions },

      // Социальные навыки
      { id: 210, text: "Я могу убедить людей в своей точке зрения без давления.", category: "Социальные навыки", options: agreementOptions },
      { id: 211, text: "Мне легко работать в команде и находить компромиссы.", category: "Социальные навыки", options: agreementOptions },
      { id: 212, text: "Я умею конструктивно разрешать конфликты.", category: "Социальные навыки", options: agreementOptions },

      // Мотивация
      { id: 213, text: "Я ставлю перед собой цели и упорно двигаюсь к ним.", category: "Мотивация", options: agreementOptions },
      { id: 214, text: "Меня мотивирует сам процесс, а не только результат.", category: "Мотивация", options: agreementOptions },
      { id: 215, text: "Я оптимистичен даже в сложных обстоятельствах.", category: "Мотивация", options: agreementOptions },
    ]
  },

  // 7. СТИЛЬ ОБУЧЕНИЯ -> AI ЧАТ
  "learning-style": {
    id: "learning-style",
    type: "chat",
    title: "Стиль обучения",
    description: "Определите, как вы лучше всего усваиваете информацию.",
    icon: "school",
    gradient: "from-cyan-500 to-blue-600",
    initialMessage: "Привет! Давай разберёмся, какой способ обучения подходит тебе лучше всего. Вспомни последний раз, когда ты изучал что-то новое (навык, язык, технологию). Как ты к этому подошёл?",
    systemInstruction: `
      Ты — эксперт по образовательным методикам и стилям обучения.
      Твоя задача — определить доминирующий стиль обучения пользователя по модели VARK (Visual, Auditory, Read/Write, Kinesthetic).

      Алгоритм:
      1. Задай 4-5 ситуативных вопросов о том, как пользователь предпочитает изучать новое.
      2. Проанализируй ответы и определи доминирующий стиль.
      3. В конце дай развёрнутую обратную связь:
         - Какой стиль доминирует
         - Как это использовать для эффективного обучения
         - Конкретные техники и инструменты для этого стиля

      Будь дружелюбен и приводи понятные примеры. Язык: русский.
    `
  }
};

export const getAssessmentById = (id: string): AssessmentConfig | undefined => {
  return assessmentsDatabase[id];
};

export const getAllAssessments = () => Object.values(assessmentsDatabase);
