import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const email = process.env.DEV_USER_EMAIL ?? 'dev@qreatestudios.local';
const password = process.env.DEV_USER_PASSWORD ?? 'DevPassword123!';
const name = process.env.DEV_USER_NAME ?? 'Dev User';

const userId = process.env.DEV_USER_ID ?? 'dev-user';
const orgId = process.env.DEV_ORG_ID ?? 'dev-org';
const memberId = process.env.DEV_ORG_MEMBER_ID ?? 'dev-member';

async function main() {
  const hashedPassword = await bcrypt.hash(password, 10);
  const now = new Date();

  await prisma.organization.upsert({
    where: { id: orgId },
    update: {
      name: 'Dev Organization',
      ownerId: userId,
      plan: 'BUSINESS',
      updatedAt: now,
    },
    create: {
      id: orgId,
      name: 'Dev Organization',
      ownerId: userId,
      plan: 'BUSINESS',
      isWhiteLabel: false,
      updatedAt: now,
    },
  });

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
      role: 'ADMIN',
      parentOrganizationId: orgId,
      updatedAt: now,
    },
    create: {
      id: userId,
      email,
      name,
      password: hashedPassword,
      role: 'ADMIN',
      parentOrganizationId: orgId,
      updatedAt: now,
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: orgId,
        userId,
      },
    },
    update: {
      role: 'OWNER',
    },
    create: {
      id: memberId === 'dev-member' ? randomUUID() : memberId,
      organizationId: orgId,
      userId,
      role: 'OWNER',
    },
  });

  console.log('Seeded dev user:', { email, password, organization: 'Dev Organization' });
}

main()
  .catch((error) => {
    console.error('Failed to seed dev user:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
