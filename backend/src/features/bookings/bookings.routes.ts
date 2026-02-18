import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { createBooking, getUserBookings } from './bookings.service';

const CreateBookingSchema = z.object({
  tierId: z.string().uuid(),
  userId: z.string().uuid(),
  quantity: z.number().int().positive().max(10),
  idempotencyKey: z.string().min(1).max(512),
});

export const bookingRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post('/', async (request, reply) => {
    const parsed = CreateBookingSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: parsed.error.errors[0].message,
      });
    }

    const { booking, fromCache } = await createBooking(parsed.data);
    return reply.status(fromCache ? 200 : 201).send(booking);
  });

  app.get<{ Params: { userId: string } }>('/:userId', async (request, reply) => {
    const uuidCheck = z.string().uuid().safeParse(request.params.userId);
    if (!uuidCheck.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: 'userId must be a valid UUID',
      });
    }

    const bookings = await getUserBookings(request.params.userId);
    return reply.send(bookings);
  });
};
