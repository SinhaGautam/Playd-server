import type { FastifyInstance } from 'fastify';
import { AppError } from '../../core/errors.js';

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/users/me', async () => {
    throw new AppError(
      'NOT_IMPLEMENTED',
      'User module scaffolded; authentication and user profile implementation is planned for V1.',
      501
    );
  });
}
