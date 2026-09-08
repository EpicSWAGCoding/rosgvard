# Деплой на сервер (быстрый старт)

Предположения: на сервере есть Docker и docker-compose, доступ по SSH и PostgreSQL уже развернут.

1) Клонируем репозиторий на сервере:

```bash
ssh user@server
cd /srv
git clone <repo-url> rosgvard
cd rosgvard
```

2) Создаём файл `.env` в корне проекта с необходимыми переменными:

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=very_secret_value
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

3) Собираем образы и запускаем сервисы:

```bash
docker-compose build --pull
docker-compose up -d
```

4) (Опционально) Запуск миграций Prisma на продакшн базе:

```bash
docker-compose exec backend npx prisma migrate deploy --schema=prisma/schema.prisma
```

5) Получение сертификатов Let's Encrypt (пример ручной команды):

```bash
# Остановите nginx proxy контейнер временно, если он уже запущен
docker-compose stop proxy

docker run --rm -v $(pwd)/letsencrypt:/var/www/certbot certbot/certbot certonly \
  --webroot -w /var/www/certbot -d example.com -d www.example.com --email admin@example.com --agree-tos --no-eff-email

# После получения certs — запустите прокси
docker-compose start proxy
```

TLS: сертификаты сохраняются в `./letsencrypt/live/<domain>/` — настройте nginx конфиг при необходимости.

6) Просмотр логов и отладка:

```bash
docker-compose logs -f backend
docker-compose logs -f proxy
```

Примечания:
- `DATABASE_URL` указывает на существующую Postgres на сервере.
- Если хотите, можно добавить сервис Postgres в `docker-compose.yml` и использовать его локально.
- Для автоматического обновления сертификатов используйте `certbot renew` в cron или запустите certbot контейнер с флагами.
