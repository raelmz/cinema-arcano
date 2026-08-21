import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function hashPassword(plain: string): Promise<string> {
  // Mesma lógica/parâmetros usados no AuthService.register
  return argon2.hash(plain, { type: argon2.argon2id });
}

/**
 * Seed da sala única do Cinema Arcano — decisão 4.31.
 * Idempotente: pode rodar `npx prisma db seed` várias vezes sem duplicar
 * a sala nem os assentos.
 */
async function seedRoomAndSeats() {
  const ROOM_NAME = 'Cinema Arcano — Sala 1';
  const ROWS = 5;
  const SEATS_PER_ROW = 8; // 5 x 8 = 40 assentos, decisão 4.31

  // Room não tem campo único além do id, então checamos existência pelo
  // nome antes de criar (upsert não serve aqui de forma direta).
  let room = await prisma.room.findFirst({ where: { name: ROOM_NAME } });

  if (!room) {
    room = await prisma.room.create({
      data: {
        name: ROOM_NAME,
        rows: ROWS,
        seatsPerRow: SEATS_PER_ROW,
      },
    });
    console.log(`✅ Sala criada -> ${room.name}`);
  } else {
    console.log(`✅ Sala já existia -> ${room.name}`);
  }

  const seatsData: { roomId: string; row: number; number: number }[] = [];
  for (let row = 1; row <= ROWS; row++) {
    for (let number = 1; number <= SEATS_PER_ROW; number++) {
      seatsData.push({ roomId: room.id, row, number });
    }
  }

  // @@unique([roomId, row, number]) no schema garante que isso é seguro
  // rodar de novo: skipDuplicates ignora os que já existem.
  const result = await prisma.seat.createMany({
    data: seatsData,
    skipDuplicates: true,
  });

  console.log(`✅ Assentos criados nesta execução: ${result.count} (total esperado: 40)`);
}

async function main() {
  const users = [
    {
      email: 'admin@cinemaarcano.com',
      name: 'Administrador Arcano',
      password: 'Admin@123',
      role: Role.ADMIN,
    },
    {
      email: 'cliente1@cinemaarcano.com',
      name: 'Cliente Um',
      password: 'Cliente1@123',
      role: Role.CUSTOMER,
    },
    {
      email: 'cliente2@cinemaarcano.com',
      name: 'Cliente Dois',
      password: 'Cliente2@123',
      role: Role.CUSTOMER,
    },
    {
      email: 'portaria@cinemaarcano.com',
      name: 'Portaria Arcano',
      password: 'Portaria@123',
      role: Role.GATE,
    },
  ];

  for (const user of users) {
    const passwordHash = await hashPassword(user.password);

    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash,
        role: user.role,
      },
      create: {
        email: user.email,
        name: user.name,
        passwordHash,
        role: user.role,
      },
    });

    console.log(`✅ ${created.role.padEnd(8)} -> ${created.email}`);
  }

  await seedRoomAndSeats();

  console.log('\nSeed concluído.');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao rodar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });