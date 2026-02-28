// Use default import to support ESM/CJS interop when running seed via tsx on Node 22.
import prismaPkg from '@prisma/client';

const { PrismaClient } = prismaPkg as { PrismaClient: new () => import('@prisma/client').PrismaClient };

const prisma = new PrismaClient();

const categoryData = [
  { name: 'Conversación', description: 'Frases comunes para conversaciones cotidianas.' },
  { name: 'Trabajo', description: 'Inglés profesional para oficina y reuniones.' },
  { name: 'Vida diaria', description: 'Inglés práctico para tu día a día.' }
];

const buildLessons = (
  categoryId: number,
  prefix: string
): Array<{
  title: string;
  level: string;
  categoryId: number;
  phrases: { create: Array<{ expected: string; translation: string; tags: string[]; order: number }> };
}> =>
  Array.from({ length: 10 }).map((_, i) => ({
    categoryId,
    title: `${prefix} ${i + 1}`,
    level: i < 4 ? 'A1' : i < 7 ? 'A2' : 'B1',
    phrases: {
      create: [
        { expected: `Sample phrase ${i + 1}A`, translation: `Frase ejemplo ${i + 1}A`, tags: ['seed'], order: 0 },
        { expected: `Sample phrase ${i + 1}B`, translation: `Frase ejemplo ${i + 1}B`, tags: ['seed'], order: 1 }
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

  const categories: Array<{ id: number; name: string }> = [];
  for (const c of categoryData) {
    const created = await prisma.lessonCategory.create({ data: c });
    categories.push({ id: created.id, name: created.name });
  }

  for (const c of categories) {
    const prefix = c.name === 'Conversación' ? 'Conversation' : c.name === 'Trabajo' ? 'Work' : 'Daily Life';
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
