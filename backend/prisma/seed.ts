import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function hashPassword(plain: string): Promise<string> {
  // Mesma lógica/parâmetros usados no AuthService.register
  return argon2.hash(plain, { type: argon2.argon2id });
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