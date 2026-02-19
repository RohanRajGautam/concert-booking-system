import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { registerUser, loginUser } from './auth.service';

const RegisterSchema = z.object({
  username: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post('/register', async (request, reply) => {
    const parsed = RegisterSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: parsed.error.errors[0].message,
      });
    }

    const result = await registerUser(
      parsed.data.username,
      parsed.data.email,
      parsed.data.password,
    );
    return reply.status(201).send(result);
  });

  app.post('/login', async (request, reply) => {
    const parsed = LoginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: parsed.error.errors[0].message,
      });
    }

    const result = await loginUser(parsed.data.email, parsed.data.password);
    return reply.status(200).send(result);
  });
};
