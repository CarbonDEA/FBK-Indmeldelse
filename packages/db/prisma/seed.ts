import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sequence for member numbers
  await prisma.$executeRawUnsafe(`
    CREATE SEQUENCE IF NOT EXISTS member_no_seq START WITH 1001 INCREMENT BY 1;
  `);

  console.log('✅ Sequence created');

  // Create test applications
  const testApplication = await prisma.application.create({
    data: {
      dataJson: {
        name: 'Test Bruger',
        email: 'test@example.com',
        phone: '+4512345678',
        notes: 'Test application for development',
      },
      status: 'PENDING',
    },
  });

  console.log('✅ Test application created:', testApplication.id);

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
