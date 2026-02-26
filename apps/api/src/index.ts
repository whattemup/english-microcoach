import { app } from './app.js';
import { config } from './config.js';
import { prisma } from './prisma.js';

const server = app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${config.port} (${config.nodeEnv})`);
});

const shutdown = async (signal: string): Promise<void> => {
  // eslint-disable-next-line no-console
  console.log(`Received ${signal}, shutting down...`);
  server.close(async (err) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error('Error closing HTTP server', err);
      process.exitCode = 1;
    }
    try {
      await prisma.$disconnect();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error disconnecting Prisma', e);
      process.exitCode = 1;
    } finally {
      process.exit();
    }
  });
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled promise rejection', reason);
});
process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('Uncaught exception', err);
  process.exit(1);
});
