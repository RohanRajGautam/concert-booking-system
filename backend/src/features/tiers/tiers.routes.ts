import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { listTiers } from './tiers.service';

export const tierRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get('/', async (_request, reply) => {
    const tiers = await listTiers();
    return reply.send(tiers);
  });
};
