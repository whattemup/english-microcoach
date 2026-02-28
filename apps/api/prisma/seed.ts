// Use default import to support ESM/CJS interop when running seed via tsx on Node 22.
import prismaPkg from '@prisma/client';

const { PrismaClient } = prismaPkg as { PrismaClient: new () => import('@prisma/client').PrismaClient };

const prisma = new PrismaClient();

type SeedPhrase = { expected: string; translation: string; tags: string[]; order: number };
type SeedLesson = { title: string; level: string; phrases: [Omit<SeedPhrase, 'order'>, Omit<SeedPhrase, 'order'>] };

const categoryData = [
  { name: 'Conversación', description: 'Frases comunes para conversaciones cotidianas.' },
  { name: 'Trabajo', description: 'Inglés profesional para oficina y reuniones.' },
  { name: 'Vida diaria', description: 'Inglés práctico para tu día a día.' }
];

const lessonsByCategory: Record<string, SeedLesson[]> = {
  Conversación: [
    {
      title: 'Saludar y presentarse',
      level: 'A1',
      phrases: [
        {
          expected: "Hi, I'm Ana. Nice to meet you.",
          translation: 'Hola, soy Ana. Mucho gusto.',
          tags: ['greetings', 'introductions']
        },
        {
          expected: 'Nice to meet you too. How are you today?',
          translation: 'Mucho gusto también. ¿Cómo estás hoy?',
          tags: ['greetings', 'small-talk']
        }
      ]
    },
    {
      title: 'Conversación casual',
      level: 'A1',
      phrases: [
        {
          expected: "It's a beautiful day, isn't it?",
          translation: 'Hace un día hermoso, ¿verdad?',
          tags: ['small-talk', 'weather']
        },
        {
          expected: 'Yes, perfect for a walk after work.',
          translation: 'Sí, perfecto para caminar después del trabajo.',
          tags: ['small-talk', 'daily-life']
        }
      ]
    },
    {
      title: 'Pedir ayuda básica',
      level: 'A1',
      phrases: [
        {
          expected: 'Excuse me, can you help me for a minute?',
          translation: 'Disculpa, ¿me puedes ayudar un minuto?',
          tags: ['asking-for-help', 'politeness']
        },
        {
          expected: "Of course. What do you need?",
          translation: 'Claro. ¿Qué necesitas?',
          tags: ['asking-for-help', 'responses']
        }
      ]
    },
    {
      title: 'Hacer planes',
      level: 'A2',
      phrases: [
        {
          expected: 'Do you want to grab coffee this afternoon?',
          translation: '¿Quieres tomar un café esta tarde?',
          tags: ['making-plans', 'social']
        },
        {
          expected: "Sure, let's meet at four near the station.",
          translation: 'Claro, nos vemos a las cuatro cerca de la estación.',
          tags: ['making-plans', 'time']
        }
      ]
    },
    {
      title: 'Pedir disculpas',
      level: 'A2',
      phrases: [
        {
          expected: "I'm sorry I'm late. The bus was delayed.",
          translation: 'Perdón por llegar tarde. El bus se retrasó.',
          tags: ['apologizing', 'transportation']
        },
        {
          expected: "No problem, thanks for letting me know.",
          translation: 'No pasa nada, gracias por avisarme.',
          tags: ['apologizing', 'politeness']
        }
      ]
    },
    {
      title: 'Agradecer con naturalidad',
      level: 'A2',
      phrases: [
        {
          expected: 'Thanks a lot for your help today.',
          translation: 'Muchas gracias por tu ayuda hoy.',
          tags: ['thanking', 'politeness']
        },
        {
          expected: "You're welcome. I'm happy to help.",
          translation: 'De nada. Me da gusto ayudar.',
          tags: ['thanking', 'responses']
        }
      ]
    },
    {
      title: 'Pedir en un restaurante',
      level: 'A2',
      phrases: [
        {
          expected: "I'd like the chicken sandwich, please.",
          translation: 'Quisiera el sándwich de pollo, por favor.',
          tags: ['ordering-food', 'restaurant']
        },
        {
          expected: 'Great choice. Would you like fries with that?',
          translation: 'Buena elección. ¿Quieres papas con eso?',
          tags: ['ordering-food', 'follow-up']
        }
      ]
    },
    {
      title: 'Pedir direcciones',
      level: 'B1',
      phrases: [
        {
          expected: 'Could you tell me how to get to the museum?',
          translation: '¿Podrías decirme cómo llegar al museo?',
          tags: ['directions', 'asking-for-help']
        },
        {
          expected: "Go straight and turn left at the second light.",
          translation: 'Sigue derecho y gira a la izquierda en el segundo semáforo.',
          tags: ['directions', 'navigation']
        }
      ]
    },
    {
      title: 'Confirmar si entendiste',
      level: 'B1',
      phrases: [
        {
          expected: 'So, we meet tomorrow at nine, right?',
          translation: 'Entonces, nos vemos mañana a las nueve, ¿cierto?',
          tags: ['checking-understanding', 'confirming']
        },
        {
          expected: "Exactly, and don't forget to bring your ID.",
          translation: 'Exacto, y no olvides traer tu identificación.',
          tags: ['checking-understanding', 'details']
        }
      ]
    },
    {
      title: 'Presentar a otra persona',
      level: 'B1',
      phrases: [
        {
          expected: 'This is my colleague Marta. She works with me.',
          translation: 'Ella es mi colega Marta. Trabaja conmigo.',
          tags: ['introductions', 'networking']
        },
        {
          expected: "Nice to meet you, Marta. I've heard great things.",
          translation: 'Mucho gusto, Marta. He escuchado cosas muy buenas.',
          tags: ['introductions', 'small-talk']
        }
      ]
    }
  ],
  Trabajo: [
    {
      title: 'Abrir una reunión',
      level: 'A1',
      phrases: [
        {
          expected: "Good morning, everyone. Let's start the meeting.",
          translation: 'Buenos días a todos. Empecemos la reunión.',
          tags: ['meetings', 'opening']
        },
        {
          expected: 'Great, first we will review this week\'s goals.',
          translation: 'Perfecto, primero revisaremos los objetivos de esta semana.',
          tags: ['meetings', 'agenda']
        }
      ]
    },
    {
      title: 'Agendar una llamada',
      level: 'A1',
      phrases: [
        {
          expected: 'Can we schedule a call for tomorrow morning?',
          translation: '¿Podemos agendar una llamada para mañana en la mañana?',
          tags: ['scheduling', 'calls']
        },
        {
          expected: 'Yes, 10 a.m. works well for me.',
          translation: 'Sí, las 10 a. m. me funciona bien.',
          tags: ['scheduling', 'time']
        }
      ]
    },
    {
      title: 'Dar actualización de estado',
      level: 'A2',
      phrases: [
        {
          expected: "I've finished the design and started development.",
          translation: 'Ya terminé el diseño y empecé el desarrollo.',
          tags: ['status-updates', 'progress']
        },
        {
          expected: 'Thanks, please share a demo by Friday.',
          translation: 'Gracias, por favor comparte una demo para el viernes.',
          tags: ['status-updates', 'next-steps']
        }
      ]
    },
    {
      title: 'Pedir aclaración',
      level: 'A2',
      phrases: [
        {
          expected: 'Sorry, could you clarify the last point?',
          translation: 'Perdón, ¿podrías aclarar el último punto?',
          tags: ['clarifying', 'meetings']
        },
        {
          expected: 'Sure, we need approval before we launch.',
          translation: 'Claro, necesitamos aprobación antes de lanzar.',
          tags: ['clarifying', 'project']
        }
      ]
    },
    {
      title: 'Escribir un correo breve',
      level: 'A2',
      phrases: [
        {
          expected: 'I\'m writing to confirm our meeting on Monday.',
          translation: 'Escribo para confirmar nuestra reunión del lunes.',
          tags: ['emailing', 'confirmation']
        },
        {
          expected: "Thanks for confirming. I'll send the invite now.",
          translation: 'Gracias por confirmar. Envío la invitación ahora.',
          tags: ['emailing', 'follow-up']
        }
      ]
    },
    {
      title: 'Hablar de fechas límite',
      level: 'B1',
      phrases: [
        {
          expected: 'The deadline is tight, but we can make it.',
          translation: 'La fecha límite es ajustada, pero podemos lograrla.',
          tags: ['deadlines', 'planning']
        },
        {
          expected: 'Okay, let\'s prioritize the critical tasks first.',
          translation: 'Bien, prioricemos primero las tareas críticas.',
          tags: ['deadlines', 'priorities']
        }
      ]
    },
    {
      title: 'Reportar un bloqueo',
      level: 'B1',
      phrases: [
        {
          expected: "I'm blocked because we still need client feedback.",
          translation: 'Estoy bloqueado porque aún necesitamos feedback del cliente.',
          tags: ['blockers', 'status-updates']
        },
        {
          expected: "Understood. I'll contact them this afternoon.",
          translation: 'Entendido. Los contactaré esta tarde.',
          tags: ['blockers', 'next-steps']
        }
      ]
    },
    {
      title: 'Hacer una petición amable',
      level: 'A2',
      phrases: [
        {
          expected: 'Could you review this document when you have time?',
          translation: '¿Podrías revisar este documento cuando tengas tiempo?',
          tags: ['polite-requests', 'review']
        },
        {
          expected: "Of course, I'll send comments before lunch.",
          translation: 'Claro, enviaré comentarios antes del almuerzo.',
          tags: ['polite-requests', 'commitments']
        }
      ]
    },
    {
      title: 'Dar seguimiento',
      level: 'B1',
      phrases: [
        {
          expected: 'Just following up on the proposal I sent yesterday.',
          translation: 'Solo doy seguimiento a la propuesta que envié ayer.',
          tags: ['follow-ups', 'emailing']
        },
        {
          expected: "Thanks for the reminder. We'll reply today.",
          translation: 'Gracias por el recordatorio. Responderemos hoy.',
          tags: ['follow-ups', 'responses']
        }
      ]
    },
    {
      title: 'Reportar progreso semanal',
      level: 'B1',
      phrases: [
        {
          expected: 'This week we completed three key features.',
          translation: 'Esta semana completamos tres funciones clave.',
          tags: ['reporting-progress', 'status-updates']
        },
        {
          expected: 'Excellent progress. Keep the same pace next week.',
          translation: 'Excelente avance. Mantengan el mismo ritmo la próxima semana.',
          tags: ['reporting-progress', 'feedback']
        }
      ]
    }
  ],
  'Vida diaria': [
    {
      title: 'Comprar en una tienda',
      level: 'A1',
      phrases: [
        {
          expected: 'How much is this T-shirt?',
          translation: '¿Cuánto cuesta esta camiseta?',
          tags: ['shopping', 'prices']
        },
        {
          expected: "It's twenty dollars, and it's on sale today.",
          translation: 'Cuesta veinte dólares y hoy está en oferta.',
          tags: ['shopping', 'offers']
        }
      ]
    },
    {
      title: 'Pedir una cita',
      level: 'A2',
      phrases: [
        {
          expected: "I'd like to make a dentist appointment.",
          translation: 'Me gustaría agendar una cita con el dentista.',
          tags: ['appointments', 'health']
        },
        {
          expected: 'Sure, we have an opening on Thursday at 3 p.m.',
          translation: 'Claro, tenemos un espacio el jueves a las 3 p. m.',
          tags: ['appointments', 'scheduling']
        }
      ]
    },
    {
      title: 'Moverse en transporte público',
      level: 'A2',
      phrases: [
        {
          expected: 'Does this bus go to the city center?',
          translation: '¿Este bus va al centro de la ciudad?',
          tags: ['transportation', 'directions']
        },
        {
          expected: 'Yes, but you need to get off at the next stop.',
          translation: 'Sí, pero debes bajarte en la siguiente parada.',
          tags: ['transportation', 'instructions']
        }
      ]
    },
    {
      title: 'Check-in en hotel',
      level: 'A1',
      phrases: [
        {
          expected: 'Hi, I have a reservation under Lopez.',
          translation: 'Hola, tengo una reserva a nombre de Lopez.',
          tags: ['hotel', 'check-in']
        },
        {
          expected: 'Welcome, Mr. Lopez. May I see your passport?',
          translation: 'Bienvenido, señor Lopez. ¿Puedo ver su pasaporte?',
          tags: ['hotel', 'front-desk']
        }
      ]
    },
    {
      title: 'Pedir la cuenta en restaurante',
      level: 'A1',
      phrases: [
        {
          expected: 'Could we have the bill, please?',
          translation: '¿Nos trae la cuenta, por favor?',
          tags: ['restaurant', 'payments']
        },
        {
          expected: 'Of course. Would you like to pay by card or cash?',
          translation: 'Claro. ¿Quieren pagar con tarjeta o efectivo?',
          tags: ['restaurant', 'payments']
        }
      ]
    },
    {
      title: 'Pedir ayuda en emergencia',
      level: 'B1',
      phrases: [
        {
          expected: 'Please call an ambulance. My friend is hurt.',
          translation: 'Por favor llame una ambulancia. Mi amigo está herido.',
          tags: ['emergencies', 'health']
        },
        {
          expected: "Stay calm. Help is on the way right now.",
          translation: 'Mantén la calma. La ayuda viene en camino ahora.',
          tags: ['emergencies', 'responses']
        }
      ]
    },
    {
      title: 'Tareas del hogar',
      level: 'A2',
      phrases: [
        {
          expected: 'Can you take out the trash tonight?',
          translation: '¿Puedes sacar la basura esta noche?',
          tags: ['household', 'chores']
        },
        {
          expected: "Sure, I'll do it after dinner.",
          translation: 'Claro, lo haré después de cenar.',
          tags: ['household', 'commitments']
        }
      ]
    },
    {
      title: 'Hablar del día y la hora',
      level: 'A1',
      phrases: [
        {
          expected: 'What time does the store open on Sundays?',
          translation: '¿A qué hora abre la tienda los domingos?',
          tags: ['time-day', 'shopping']
        },
        {
          expected: 'It opens at ten in the morning.',
          translation: 'Abre a las diez de la mañana.',
          tags: ['time-day', 'answers']
        }
      ]
    },
    {
      title: 'Hablar de preferencias',
      level: 'A2',
      phrases: [
        {
          expected: 'I prefer tea, but I can drink coffee too.',
          translation: 'Prefiero té, pero también puedo tomar café.',
          tags: ['preferences', 'food-drink']
        },
        {
          expected: 'Great, then I\'ll make tea for both of us.',
          translation: 'Genial, entonces prepararé té para los dos.',
          tags: ['preferences', 'responses']
        }
      ]
    },
    {
      title: 'Hacer una queja básica',
      level: 'B1',
      phrases: [
        {
          expected: "Excuse me, this product doesn't work properly.",
          translation: 'Disculpe, este producto no funciona correctamente.',
          tags: ['complaints', 'basic-services']
        },
        {
          expected: "I'm sorry about that. We can replace it today.",
          translation: 'Lamento eso. Podemos reemplazarlo hoy.',
          tags: ['complaints', 'solutions']
        }
      ]
    }
  ]
};

const buildLessons = (
  categoryId: number,
  categoryName: string
): Array<{
  title: string;
  level: string;
  categoryId: number;
  phrases: { create: Array<{ expected: string; translation: string; tags: string[]; order: number }> };
}> =>
  (lessonsByCategory[categoryName] ?? []).map((lesson) => ({
    categoryId,
    title: lesson.title,
    level: lesson.level,
    phrases: {
      create: lesson.phrases.map((phrase, index) => ({ ...phrase, order: index }))
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
    for (const lesson of buildLessons(c.id, c.name)) {
      await prisma.lesson.create({ data: lesson });
    }
  }

  // eslint-disable-next-line no-console
  console.log('Seed completado: 3 categorías y 30 lecciones creadas con contenido real.');
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
