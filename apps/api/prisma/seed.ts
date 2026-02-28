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
      title: 'Presentarte con confianza',
      level: 'A1',
      phrases: [
        {
          expected: 'Hi, I’m Fernando. Nice to meet you.',
          translation: 'Hola, soy Fernando. Mucho gusto.',
          tags: ['greeting', 'introductions']
        },
        {
          expected: 'Nice to meet you too. Where are you from?',
          translation: 'Mucho gusto también. ¿De dónde eres?',
          tags: ['greeting', 'introductions']
        }
      ]
    },
    {
      title: 'Romper el hielo',
      level: 'A1',
      phrases: [
        {
          expected: 'How’s your day going?',
          translation: '¿Cómo va tu día?',
          tags: ['small-talk', 'daily']
        },
        {
          expected: 'It’s going well, thanks. How about yours?',
          translation: 'Va bien, gracias. ¿Y el tuyo?',
          tags: ['small-talk', 'daily']
        }
      ]
    },
    {
      title: 'Pedir repetición',
      level: 'A1',
      phrases: [
        {
          expected: 'Sorry, could you say that again?',
          translation: 'Perdón, ¿puedes repetir eso?',
          tags: ['clarifying', 'listening']
        },
        {
          expected: 'Of course. Let me say it more slowly.',
          translation: 'Claro. Déjame decirlo más despacio.',
          tags: ['clarifying', 'listening']
        }
      ]
    },
    {
      title: 'Hacer planes',
      level: 'A2',
      phrases: [
        {
          expected: 'Are you free this weekend?',
          translation: '¿Estás libre este fin de semana?',
          tags: ['planning', 'weekend']
        },
        {
          expected: 'Yes, what did you have in mind?',
          translation: 'Sí, ¿qué tienes en mente?',
          tags: ['planning', 'weekend']
        }
      ]
    },
    {
      title: 'Invitar a alguien',
      level: 'A2',
      phrases: [
        {
          expected: 'Would you like to grab coffee later?',
          translation: '¿Te gustaría tomar un café más tarde?',
          tags: ['inviting', 'social']
        },
        {
          expected: 'Sure, that sounds great. What time?',
          translation: 'Claro, suena bien. ¿A qué hora?',
          tags: ['inviting', 'social']
        }
      ]
    },
    {
      title: 'Dar tu opinión',
      level: 'A2',
      phrases: [
        {
          expected: 'I think that’s a good idea.',
          translation: 'Creo que es una buena idea.',
          tags: ['opinions', 'agreement']
        },
        {
          expected: 'I agree. Let’s try it.',
          translation: 'Estoy de acuerdo. Intentémoslo.',
          tags: ['opinions', 'agreement']
        }
      ]
    },
    {
      title: 'Desacuerdo educado',
      level: 'B1',
      phrases: [
        {
          expected: 'I’m not sure I agree with that.',
          translation: 'No estoy seguro de estar de acuerdo con eso.',
          tags: ['opinions', 'disagreement']
        },
        {
          expected: 'That’s fair. What would you suggest instead?',
          translation: 'Es válido. ¿Qué sugerirías en su lugar?',
          tags: ['opinions', 'disagreement']
        }
      ]
    },
    {
      title: 'Pedir ayuda',
      level: 'A1',
      phrases: [
        {
          expected: 'Can you help me for a moment?',
          translation: '¿Puedes ayudarme un momento?',
          tags: ['help', 'polite']
        },
        {
          expected: 'Of course. What do you need?',
          translation: 'Claro. ¿Qué necesitas?',
          tags: ['help', 'polite']
        }
      ]
    },
    {
      title: 'Pedir direcciones',
      level: 'A2',
      phrases: [
        {
          expected: 'Excuse me, how do I get to the station?',
          translation: 'Disculpa, ¿cómo llego a la estación?',
          tags: ['directions', 'travel']
        },
        {
          expected: 'Go straight and turn left at the corner.',
          translation: 'Ve derecho y gira a la izquierda en la esquina.',
          tags: ['directions', 'travel']
        }
      ]
    },
    {
      title: 'Cerrar conversación',
      level: 'A2',
      phrases: [
        {
          expected: 'It was great talking to you.',
          translation: 'Fue un gusto hablar contigo.',
          tags: ['closing', 'polite']
        },
        {
          expected: 'Likewise. Let’s stay in touch.',
          translation: 'Igualmente. Mantengámonos en contacto.',
          tags: ['closing', 'polite']
        }
      ]
    }
  ],
  Trabajo: [
    {
      title: 'Programar reunión',
      level: 'A1',
      phrases: [
        {
          expected: 'Can we schedule a meeting for tomorrow?',
          translation: '¿Podemos agendar una reunión para mañana?',
          tags: ['scheduling', 'meetings']
        },
        {
          expected: 'Yes, what time works for you?',
          translation: 'Sí, ¿qué hora te funciona?',
          tags: ['scheduling', 'meetings']
        }
      ]
    },
    {
      title: 'Confirmar disponibilidad',
      level: 'A1',
      phrases: [
        {
          expected: 'Are you available at 3 PM?',
          translation: '¿Estás disponible a las 3 PM?',
          tags: ['scheduling', 'availability']
        },
        {
          expected: 'Yes, that works for me.',
          translation: 'Sí, me funciona.',
          tags: ['scheduling', 'availability']
        }
      ]
    },
    {
      title: 'Pedir aclaración',
      level: 'A2',
      phrases: [
        {
          expected: 'Could you clarify that point?',
          translation: '¿Podrías aclarar ese punto?',
          tags: ['clarifying', 'meetings']
        },
        {
          expected: 'Sure, let me explain it differently.',
          translation: 'Claro, déjame explicarlo de otra manera.',
          tags: ['clarifying', 'meetings']
        }
      ]
    },
    {
      title: 'Dar actualización',
      level: 'A2',
      phrases: [
        {
          expected: 'We’re making good progress on the project.',
          translation: 'Estamos avanzando bien en el proyecto.',
          tags: ['status', 'updates']
        },
        {
          expected: 'That’s great to hear. What’s next?',
          translation: 'Qué bueno escuchar eso. ¿Qué sigue?',
          tags: ['status', 'updates']
        }
      ]
    },
    {
      title: 'Reportar problema',
      level: 'A2',
      phrases: [
        {
          expected: 'We’re facing a small delay.',
          translation: 'Estamos enfrentando un pequeño retraso.',
          tags: ['blockers', 'status']
        },
        {
          expected: 'What’s causing it?',
          translation: '¿Qué lo está causando?',
          tags: ['blockers', 'status']
        }
      ]
    },
    {
      title: 'Pedir plazo extra',
      level: 'B1',
      phrases: [
        {
          expected: 'Could we extend the deadline by two days?',
          translation: '¿Podríamos extender la fecha límite dos días?',
          tags: ['deadlines', 'negotiation']
        },
        {
          expected: 'That might be possible. Let me check.',
          translation: 'Puede ser posible. Déjame revisar.',
          tags: ['deadlines', 'negotiation']
        }
      ]
    },
    {
      title: 'Dar retroalimentación',
      level: 'B1',
      phrases: [
        {
          expected: 'I’d suggest improving the introduction.',
          translation: 'Sugeriría mejorar la introducción.',
          tags: ['feedback', 'writing']
        },
        {
          expected: 'Thanks for the feedback. I’ll revise it.',
          translation: 'Gracias por la retroalimentación. Lo revisaré.',
          tags: ['feedback', 'writing']
        }
      ]
    },
    {
      title: 'Hacer seguimiento',
      level: 'A2',
      phrases: [
        {
          expected: 'Just following up on my previous email.',
          translation: 'Solo dando seguimiento a mi correo anterior.',
          tags: ['email', 'follow-up']
        },
        {
          expected: 'Thanks for the reminder. I’ll respond today.',
          translation: 'Gracias por el recordatorio. Responderé hoy.',
          tags: ['email', 'follow-up']
        }
      ]
    },
    {
      title: 'Confirmar entrega',
      level: 'A1',
      phrases: [
        {
          expected: 'I’ve sent the document.',
          translation: 'Ya envié el documento.',
          tags: ['delivery', 'documents']
        },
        {
          expected: 'Got it. I’ll review it shortly.',
          translation: 'Recibido. Lo revisaré pronto.',
          tags: ['delivery', 'documents']
        }
      ]
    },
    {
      title: 'Cerrar reunión',
      level: 'A2',
      phrases: [
        {
          expected: 'Let’s summarize the next steps.',
          translation: 'Resumamos los siguientes pasos.',
          tags: ['meetings', 'closing']
        },
        {
          expected: 'Perfect. I’ll send the action items.',
          translation: 'Perfecto. Enviaré los puntos de acción.',
          tags: ['meetings', 'closing']
        }
      ]
    }
  ],
  'Vida diaria': [
    {
      title: 'Pedir en restaurante',
      level: 'A1',
      phrases: [
        {
          expected: 'I’d like a chicken sandwich, please.',
          translation: 'Me gustaría un sándwich de pollo, por favor.',
          tags: ['restaurant', 'ordering']
        },
        {
          expected: 'Would you like fries with that?',
          translation: '¿Le gustaría papas con eso?',
          tags: ['restaurant', 'ordering']
        }
      ]
    },
    {
      title: 'Pagar cuenta',
      level: 'A1',
      phrases: [
        {
          expected: 'Can I have the bill, please?',
          translation: '¿Me puede traer la cuenta, por favor?',
          tags: ['restaurant', 'payment']
        },
        {
          expected: 'Of course. I’ll bring it right away.',
          translation: 'Claro. Se la traigo enseguida.',
          tags: ['restaurant', 'payment']
        }
      ]
    },
    {
      title: 'En hotel',
      level: 'A1',
      phrases: [
        {
          expected: 'I have a reservation under Garcia.',
          translation: 'Tengo una reservación a nombre de García.',
          tags: ['hotel', 'check-in']
        },
        {
          expected: 'Welcome. May I see your ID?',
          translation: 'Bienvenido. ¿Puedo ver su identificación?',
          tags: ['hotel', 'check-in']
        }
      ]
    },
    {
      title: 'Transporte',
      level: 'A2',
      phrases: [
        {
          expected: 'How long does it take to get there?',
          translation: '¿Cuánto tiempo se tarda en llegar?',
          tags: ['transport', 'time']
        },
        {
          expected: 'About twenty minutes by bus.',
          translation: 'Aproximadamente veinte minutos en autobús.',
          tags: ['transport', 'time']
        }
      ]
    },
    {
      title: 'Compras',
      level: 'A1',
      phrases: [
        {
          expected: 'Do you have this in a different size?',
          translation: '¿Tiene esto en otra talla?',
          tags: ['shopping', 'sizes']
        },
        {
          expected: 'Let me check in the back.',
          translation: 'Déjeme revisar en la parte de atrás.',
          tags: ['shopping', 'sizes']
        }
      ]
    },
    {
      title: 'Hacer cita',
      level: 'A2',
      phrases: [
        {
          expected: 'I’d like to make an appointment.',
          translation: 'Me gustaría hacer una cita.',
          tags: ['appointments', 'scheduling']
        },
        {
          expected: 'Sure. What day works for you?',
          translation: 'Claro. ¿Qué día le funciona?',
          tags: ['appointments', 'scheduling']
        }
      ]
    },
    {
      title: 'Preferencia',
      level: 'A2',
      phrases: [
        {
          expected: 'I prefer something less spicy.',
          translation: 'Prefiero algo menos picante.',
          tags: ['preferences', 'food']
        },
        {
          expected: 'No problem. I’ll recommend this one.',
          translation: 'No hay problema. Le recomiendo este.',
          tags: ['preferences', 'food']
        }
      ]
    },
    {
      title: 'Emergencia leve',
      level: 'B1',
      phrases: [
        {
          expected: 'I’m not feeling well. I need a doctor.',
          translation: 'No me siento bien. Necesito un médico.',
          tags: ['health', 'urgent']
        },
        {
          expected: 'We can call one right away.',
          translation: 'Podemos llamar a uno de inmediato.',
          tags: ['health', 'urgent']
        }
      ]
    },
    {
      title: 'Error en cobro',
      level: 'A2',
      phrases: [
        {
          expected: 'There seems to be a mistake on my bill.',
          translation: 'Parece haber un error en mi cuenta.',
          tags: ['billing', 'complaints']
        },
        {
          expected: 'Let me fix that for you.',
          translation: 'Permítame corregirlo.',
          tags: ['billing', 'complaints']
        }
      ]
    },
    {
      title: 'Fin de semana',
      level: 'A1',
      phrases: [
        {
          expected: 'What do you usually do on weekends?',
          translation: '¿Qué sueles hacer los fines de semana?',
          tags: ['small-talk', 'weekend']
        },
        {
          expected: 'I usually spend time with my family.',
          translation: 'Normalmente paso tiempo con mi familia.',
          tags: ['small-talk', 'weekend']
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
