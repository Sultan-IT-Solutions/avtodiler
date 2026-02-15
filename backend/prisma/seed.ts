import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { prisma } from '../src/prisma';

dotenv.config();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@pm.local';
  const password = process.env.ADMIN_PASSWORD || 'admin12345';

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.create({
    data: {
      email,
      passwordHash
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
