import type { FastifyInstance } from 'fastify';
export async function usersRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/users/me', async (_request, reply) => reply.code(501).send({
    error: 'NOT_IMPLEMENTED',
    message: 'User module scaffolded; authentication and user profile implementation is planned for V1.'
  }));
}
