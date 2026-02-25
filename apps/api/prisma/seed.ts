import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categoryData = [
  { name: 'Conversación diaria', description: 'Frases comunes para situaciones cotidianas.' },
  { name: 'Trabajo y negocios', description: 'Inglés profesional para oficina y reuniones.' },
  { name: 'Viajes', description: 'Inglés útil para aeropuertos, hoteles y turismo.' }
];

const buildLessons = (categoryId: number, prefix: string): Array<{ title: string; level: string; categoryId: number; phrases: { create: Array<{ text: string; translation: string }> } }> =>
  Array.from({ length: 10 }).map((_, i) => ({
    categoryId,
    title: `${prefix} ${i + 1}`,
    level: i < 4 ? 'A1' : i < 7 ? 'A2' : 'B1',
    phrases: {
      create: [
        { text: `Sample phrase ${i + 1}A`, translation: `Frase ejemplo ${i + 1}A` },
        { text: `Sample phrase ${i + 1}B`, translation: `Frase ejemplo ${i + 1}B` }
      ]
    }
  }));

async function main(): Promise<void> {
  await prisma.mistake.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.reviewItem.deleteMany();
  await prisma.lessonPhrase.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.lessonCategory.deleteMany();

  const categories = [] as { id: number; name: string }[];
  for (const c of categoryData) {
    const created = await prisma.lessonCategory.create({ data: c });
    categories.push(created);
  }

  for (const c of categories) {
    const prefix = c.name === 'Conversación diaria' ? 'Daily Talk' : c.name === 'Trabajo y negocios' ? 'Work English' : 'Travel English';
    for (const lesson of buildLessons(c.id, prefix)) {
      await prisma.lesson.create({ data: lesson });
    }
  }

  // eslint-disable-next-line no-console
  console.log('Seed completado: 3 categorías y 30 lecciones creadas.');
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
