# LifeCompass AI

Профессиональная платформа для психологической диагностики и профориентации. Приложение использует стандартизированные методики (RIASEC, Big Five) и ИИ-аналитику (Google Gemini) для формирования персональных рекомендаций.

**Продакшен:** https://lifecompass.zhezu.kz

## Технический стек

| Слой | Технологии |
|------|-----------|
| **Frontend** | React 19, TypeScript, Vite 6 |
| **Стилизация** | Tailwind CSS 4 (Dark Mode) |
| **Маршрутизация** | React Router Dom 7 |
| **Визуализация** | Recharts 3 (радарные диаграммы) |
| **AI** | Google Gemini 2.0 Flash (`@google/genai`) |
| **Сервер** | Node.js + Express 4 (CommonJS) |
| **Хостинг** | Plesk (Phusion Passenger) на hoster.kz |

## Архитектура

```
Клиент (React SPA)  ──→  Express сервер (app.js)  ──→  Google Gemini API
       │                        │
   dist/index.html         /api/* эндпоинты
```

Приложение — это **SPA с серверным бэкендом**:
- **Frontend** собирается Vite в `dist/` и раздаётся Express как статика
- **Backend** (`app.js`) предоставляет API для AI-функций (чат, анализ результатов)
- Gemini SDK загружается через **динамический `import()`** (ESM-совместимость с CommonJS)

## Структура проекта

```
/
├── app.js                  # Node.js сервер (Express, Gemini API)
├── package.json            # Зависимости (runtime + dev)
├── vite.config.ts          # Конфигурация сборки
├── tsconfig.json           # TypeScript конфигурация
├── index.html              # HTML точка входа (Vite)
├── index.tsx               # React точка входа
├── App.tsx                 # Корневой компонент с роутингом
├── styles.css              # Глобальные стили (Tailwind)
├── types.ts                # TypeScript интерфейсы
├── deploy.sh               # Скрипт деплоя на Plesk
├── .env.example            # Шаблон переменных среды
├── .htaccess               # Apache rewrite для Passenger
│
├── components/
│   ├── Layout.tsx          # Основной layout с Sidebar
│   ├── Sidebar.tsx         # Боковое меню навигации
│   ├── RadarChart.tsx      # Компонент радарной диаграммы
│   └── ProtectedRoute.tsx  # Защита маршрутов (авторизация)
│
├── contexts/
│   └── AuthContext.tsx      # Контекст авторизации
│
├── pages/
│   ├── Landing.tsx         # Лендинг (главная)
│   ├── Login.tsx           # Вход
│   ├── Register.tsx        # Регистрация
│   ├── Dashboard.tsx       # Обзор тестов
│   ├── Assessment.tsx      # Прохождение теста (квиз / AI-чат)
│   ├── Results.tsx         # Результаты с AI-анализом
│   ├── History.tsx         # История прохождений
│   └── Profile.tsx         # Профиль пользователя
│
├── services/
│   ├── assessmentData.ts   # Реестр тестов, вопросов, вариантов
│   ├── geminiService.ts    # API-клиент для бэкенда (/api/*)
│   └── historyService.ts   # Локальное хранение истории
│
└── public/
    ├── favicon.svg
    ├── robots.txt
    └── fonts/              # Material Symbols (offline)
```

## API эндпоинты (app.js)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/health` | Диагностика: версия Node.js, статус SDK, наличие ключа |
| GET | `/api/status` | `{ configured: true/false }` — готов ли AI |
| POST | `/api/chat/start` | Создание чат-сессии (возвращает `sessionId`) |
| POST | `/api/chat/message` | Отправка сообщения в чат-сессию |
| POST | `/api/analyze/quiz` | AI-анализ результатов квиза (архетип, карьера, сильные стороны) |
| POST | `/api/analyze/chat` | AI-анализ диалога (баллы по категориям + архетип) |

## Быстрый старт (локальная разработка)

```bash
# 1. Установка зависимостей
npm install

# 2. Настройка API ключа (опционально — приложение работает и без AI)
cp .env.example .env
# Отредактируйте .env, вставив свой Gemini API ключ

# 3. Запуск dev-сервера (только фронтенд, hot reload)
npm run dev

# 4. Запуск полного сервера (фронтенд + API)
npm run build && npm start
```

Откройте http://localhost:5173 (dev) или http://localhost:3000 (production).

## Переменные среды

| Переменная | Описание | По умолчанию |
|-----------|----------|-------------|
| `GEMINI_API_KEY` | API ключ Google Gemini ([получить](https://aistudio.google.com/apikey)) | — (AI отключён) |
| `PORT` | Порт сервера | `3000` |

Ключ можно задать:
1. **Plesk** → Node.js → «Персональные переменные среды»
2. Файл `.env` в корне проекта (фоллбэк)

## Деплой на Plesk (hoster.kz)

```bash
# Только сборка
npm run deploy

# Сборка + загрузка по FTP
npm run deploy:upload
```

### Ручной деплой

1. Загрузите на сервер: `app.js`, `package.json`, `package-lock.json`, `.htaccess`, `dist/`
2. В Plesk → Node.js:
   - **Startup file:** `app.js`
   - **Document root:** `/dist`
   - Нажмите **«Установка NPM»** (Install NPM)
   - Задайте `GEMINI_API_KEY` в переменных среды
   - Нажмите **«Перезапустить приложение»**
3. Проверьте: `https://lifecompass.zhezu.kz/api/health`

### Структура на сервере

```
/var/www/vhosts/zhezu.kz/LifeCompass.zhezu.kz/
├── app.js                  ← Startup file
├── package.json
├── node_modules/           ← Создаётся «Установка NPM»
└── dist/                   ← Document root
    ├── index.html
    └── assets/
```

### Диагностика

- `/api/health` — полная диагностика сервера
- `/api/status` — проверка готовности AI
- Если `geminiLoaded: false` — проверьте логи (`npm install` мог не установить SDK)
- Если `apiKeyPresent: false` — ключ не доходит до процесса, задайте через Plesk UI

## Как добавить новый тест

1. Откройте `services/assessmentData.ts`
2. Добавьте новый объект в `assessmentsDatabase` с уникальным ID
3. Определите вопросы с категориями для анализа
4. В `pages/Dashboard.tsx` добавьте карточку в массив `assessmentsUI`

```typescript
"new-test-id": {
  id: "new-test-id",
  title: "Название теста",
  questions: [
    {
      id: 1,
      text: "Текст вопроса",
      category: "Категория для анализа",
      options: standardOptions
    }
  ]
}
```

## Безопасность и приватность

Приложение спроектировано с учётом требований закона РК о защите персональных данных:

1. **Анонимизация:** AI не получает ФИО, email или другие прямые идентификаторы
2. **Локальность:** Персональные данные хранятся только на клиенте (localStorage)
3. **Трансграничная передача:** В Gemini отправляются только векторы ответов
4. **Сессии:** Чат-сессии хранятся в памяти сервера и автоматически удаляются через 1 час
