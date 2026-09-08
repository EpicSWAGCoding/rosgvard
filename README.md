# Rosgvard shifts — backend skeleton

Минимальный каркас backend для проекта учёта смен — Express + TypeScript + Prisma.

Quick start:

1. Скопируйте `.env.example` в `.env` и укажите `DATABASE_URL`.
2. Установите зависимости:

```bash
npm install
```

3. Инициализируйте Prisma и выполните миграцию (пример):

```bash
npx prisma migrate dev --name init
```

4. Запустите в dev режиме:

```bash
npm run dev
```

Frontend (development):

1. Перейдите в папку `frontend`

```bash
cd frontend
npm install
npm run dev
```

Frontend (production build):

```bash
cd frontend
npm install
npm run build
cd ..
NODE_ENV=production npm run build
NODE_ENV=production npm start
```

Environment variables required (см. `.env.example`):
- `DATABASE_URL` — строка подключения к Postgres
- `JWT_SECRET` — секрет для подписи JWT
- `VAPID_PUBLIC_KEY` и `VAPID_PRIVATE_KEY` — ключи VAPID для web-push

