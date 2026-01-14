import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function ensureUser() {
  try {
    // Check if any user exists
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('No users found. Creating default user...');
      
      const user = await prisma.user.create({
        data: {
          id: randomUUID(),
          email: 'admin@qreatestudios.com',
          name: 'Admin User',
          emailVerified: new Date(),
          updatedAt: new Date(),
        },
      });
      
      console.log('✅ Default user created:', user.email);
      console.log('User ID:', user.id);
      console.log('\nYou can now sign in with this email or update your session to use this ID.');
    } else {
      console.log(`Found ${userCount} user(s) in database`);
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
      
      console.log('\nRecent users:');
      users.forEach(u => {
        console.log(`- ${u.email} (${u.name}) - ID: ${u.id}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

ensureUser();
