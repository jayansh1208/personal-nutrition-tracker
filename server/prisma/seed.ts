import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial configuration...');

  // 1. Initial App Settings
  const existingSettings = await prisma.appSettings.findFirst();
  if (!existingSettings) {
    await prisma.appSettings.create({
      data: {
        timezone: 'Asia/Kolkata',
        defaultWeightUnit: 'kg',
        defaultCalorieUnit: 'kcal'
      }
    });
    console.log('Created default AppSettings');
  }

  // 2. Initial Daily Goals
  const existingGoals = await prisma.dailyGoals.findFirst();
  if (!existingGoals) {
    const today = new Date().toISOString().split('T')[0];
    await prisma.dailyGoals.create({
      data: {
        calorieTarget: 2000,
        proteinTarget: 125,
        liquidTarget: 3000,
        effectiveFrom: today
      }
    });
    console.log(`Created default DailyGoals effective from ${today}`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
