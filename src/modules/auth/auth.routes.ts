import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AppError } from '../../core/errors.js';
import { authenticateUser, registerUser } from './auth.service.js';
import { createAccessToken } from './auth.jwt.js';

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128)
});

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/v1/auth/register', async (request, reply) => {
    const parsed = credentialsSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AppError('VALIDATION_ERROR', 'Invalid registration payload.', 400, parsed.error.flatten());
    }

    const user = await registerUser(parsed.data.email, parsed.data.password);
    const accessToken = await createAccessToken(user);
    return reply.code(201).send({ user, accessToken });
  });

  app.post('/v1/auth/login', async (request) => {
    const parsed = credentialsSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AppError('VALIDATION_ERROR', 'Invalid login payload.', 400, parsed.error.flatten());
    }

    const user = await authenticateUser(parsed.data.email, parsed.data.password);
    const accessToken = await createAccessToken(user);
    return { user, accessToken };
  });
}
