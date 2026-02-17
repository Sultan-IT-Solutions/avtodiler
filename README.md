# Luxury Auto Kazakhstan

Современный лендинг для бренда Hongqi на Vite + React с локальной админ-панелью.

## Neon (Postgres) backend 



## Возможности

### 



- Публичные страницы каталога, сервисного центра и тест-драйва.

### Environment variables

Copy `.env.example` 
- Админ-панель на `/admin` для управления контентом.

### Schema

The initial database schema is in `db/schema.sql`.

Apply it in your Neon project (SQL Editor) before using the admin panel.

### What is migrated

- Admin **Cars / Offers / Dealers / Leads** sync to Neon tables via `/api/admin/*`.
- Public pages fetch shared data from `/api/public/*` with LocalStorage fallback.

## Быстрый старт

1. Установите зависимости.
2. Запустите dev-сервер Vite.

## Админ-панель

- URL: `/admin`
- Логин: `admin`
- Пароль по умолчанию: `admin123` (можно переопределить переменной `VITE_ADMIN_PASSWORD`).

## Leads (заявки)

Формы сайта отправляют лиды на `POST /api/telegram/lead` (историческое имя эндпоинта), который сохраняет их в Neon Postgres (таблица `leads`). Telegram больше не используется.

Дополнительные настройки:

- `ALLOWED_ORIGINS` (опционально, allowlist Origin)
- `RATE_LIMIT_WINDOW_MS` (опционально)
- `RATE_LIMIT_MAX` (опционально)

## Хранение данных

Данные админ-панели и заявки сохраняются в Neon Postgres.

