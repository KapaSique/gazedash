# GazeDash

Веб-дашборд для быстрого просмотра внимания водителя по сессиям: список → деталка → таймлайн → метрики внимания/рисков.

## Что внутри
- **web/** — Vite + React + TypeScript + Tailwind/shadcn/ui, страницы `Sessions`, `SessionDetail`, `Timeline`, загрузка JSON событий, сортировки/фильтры.
- **api/** — FastAPI с мок-данными и подсчётом метрик по событиям.
- **PRD.md** — краткое ТЗ.

## Быстрый старт
### 1) API (mock)
```bash
cd api
python -m venv .venv
source .venv/bin/activate  # или .venv\\Scripts\\activate в Windows
pip install fastapi uvicorn pydantic
uvicorn main:app --reload --port 8000
```
Эндпоинты: `/sessions`, `/sessions/{id}`, `/sessions/{id}/events`, `/sessions/{id}/stats`, `/docs`.

### 2) Frontend
```bash
cd web
npm install
npm run dev
# dev-сервер: http://localhost:5173
```
Переменная `VITE_API_URL` по умолчанию `http://127.0.0.1:8000`. Если API на другом хосте/порту, задайте в `.env.local`.

### 3) Сборка/проверки
```bash
npm run build   # tsc + vite build
npm run lint    # eslint
```

## Основные фичи
- Список сессий и деталка с метриками: attention%, offroad/phone/drowsy counts & %.
- Таймлайн внимания (bin 5s) на Recharts.
- Фильтр событий по типу и сортировка по времени.
- Импорт событий из JSON на странице сессии (ожидает массив объектов с полями ts, type, value, confidence).
- Темная/светлая тема через Tailwind (класс `dark`), переключается в UI.

## Стек
- **Frontend:** React 19, React Router 7, Tailwind + shadcn/ui, Vite, TypeScript.
- **Charts:** Recharts.
- **Backend:** FastAPI, Pydantic, Uvicorn (mock storage in-memory).

## Структура
- `web/src/pages` — страницы (Sessions, SessionDetail, Timeline и т.п.).
- `web/src/shared/api` — HTTP-клиент и типы.
- `web/src/shared/ui` — Layout/карточки/прочие UI-утилиты.
- `api/main.py` — FastAPI приложение, мок-сессии и вычисление метрик.

## Импорт своих логов
1) Откройте страницу сессии `/sessions/:id`.
2) Кнопка `Import JSON` — выберите файл. Формат: массив `{ ts, type, value, confidence }` или `{ events: [...] }`.
3) После загрузки метрики пересчитаются, события появятся в таблице/таймлайне.

## Известные моменты
- В `tailwind.config.js` уже прописан правильный glob `./src/**/*.{js,ts,jsx,tsx}` — без него shadcn-классы не соберутся.
- API хранит данные в памяти; перезапуск сбрасывает мок.

## Полезные команды
- `uvicorn main:app --reload --port 8000` — запустить API (из каталога `api`).
- `npm run dev` — фронт dev-server.
- `npm run preview` — локальный предпросмотр собранного фронта.

