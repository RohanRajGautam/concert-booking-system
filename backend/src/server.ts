import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config';
import { runMigrations } from './db/migrate';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { tierRoutes } from './features/tiers/tiers.routes';
import { bookingRoutes } from './features/bookings/bookings.routes';

export function buildServer() {
  const app = Fastify({ 
    logger: config.nodeEnv === 'development'
      ? { transport: { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' } } }
      : true
  });

  app.register(cors, { origin: true });
  app.addHook('onRequest', requestLogger);
  app.setErrorHandler(errorHandler);

  app.get('/health', async () => ({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  }));

  app.register(tierRoutes, { prefix: '/api/tiers' });
  app.register(bookingRoutes, { prefix: '/api/bookings' });

  return app;
}

async function start() {
  console.log('[server] running migrations...');
  await runMigrations();

  const app = buildServer();
  try {
    const address = await app.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`[server] listening on ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}
