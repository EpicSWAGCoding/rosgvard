// Скрипт импорта личного состава из users-seed.json в базу данных.
// Запускать внутри контейнера backend:
//   docker compose exec backend node import-users.js
//
// Пароли хешируются через bcryptjs перед сохранением — в базе они
// НИКОГДА не хранятся в открытом виде.

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const dataPath = path.join(__dirname, 'users-seed.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(raw);

  console.log(`Найдено отделений: ${data.squads.length}, сотрудников: ${data.users.length}`);

  // 1. Создаём отделения (если ещё не существуют по имени)
  const squadIdByName = {};
  for (const squad of data.squads) {
    let existing = await prisma.squad.findFirst({ where: { name: squad.name } });
    if (!existing) {
      existing = await prisma.squad.create({ data: { name: squad.name } });
      console.log(`Создано отделение: ${squad.name}`);
    } else {
      console.log(`Отделение уже существует: ${squad.name}`);
    }
    squadIdByName[squad.name] = existing.id;
  }

  // 2. Создаём пользователей
  let created = 0;
  let skipped = 0;
  for (const u of data.users) {
    const existing = await prisma.user.findUnique({ where: { phone: u.tempLogin } });
    if (existing) {
      console.log(`Пропущен (логин уже существует): ${u.fullName} (${u.tempLogin})`);
      skipped++;
      continue;
    }

    const passwordHash = await bcrypt.hash(u.tempPassword, 10);

    await prisma.user.create({
      data: {
        fullName: u.fullName,
        phone: u.tempLogin,
        password: passwordHash,
        rank: u.rank,
        position: u.position,
        role: u.role,
        status: u.status,
        serviceStartDate: u.serviceStartDate ? new Date(u.serviceStartDate) : null,
        squadId: u.squad ? squadIdByName[u.squad] : null,
      },
    });
    created++;
  }

  console.log(`\nГотово. Создано: ${created}, пропущено (уже было): ${skipped}`);
}

main()
  .catch((e) => {
    console.error('Ошибка импорта:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
