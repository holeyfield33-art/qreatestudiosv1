import { PrismaClient } from '@prisma/client';
import { hashQRPassword } from '../lib/utils/qr-password';

const prisma = new PrismaClient();

async function main() {
  const qrCodes = await prisma.qRCode.findMany({
    where: { isSecure: true, password: { not: null } },
    select: { id: true, password: true },
  });

  let updatedCount = 0;

  for (const qr of qrCodes) {
    if (qr.password && !qr.password.startsWith('$2')) {
      const hashed = await hashQRPassword(qr.password);
      await prisma.qRCode.update({
        where: { id: qr.id },
        data: { password: hashed },
      });
      updatedCount += 1;
    }
  }

  console.log(`Migrated ${updatedCount} QR passwords.`);
}

main()
  .catch((error) => {
    console.error('QR password migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
