import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AppError } from '../../core/errors.js';
import { requireAuth } from '../auth/auth.hooks.js';
import { getUserProfile, upsertUserProfile } from './users.service.js';

const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  bio: z.string().max(500).nullable().optional(),
  dateOfBirth: z.string().date().nullable().optional(),
  avatarUrl: z.string().url().max(2048).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional()
});

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/users/me', { preHandler: requireAuth }, async (request) => {
    return {
      user: request.user,
      profile: await getUserProfile(request.user.id).catch((error: unknown) => {
        if (error instanceof AppError && error.code === 'PROFILE_NOT_FOUND') return null;
        throw error;
      })
    };
  });

  app.put('/v1/users/me/profile', { preHandler: requireAuth }, async (request) => {
    const body = profileSchema.safeParse(request.body);
    if (!body.success) {
      throw new AppError('VALIDATION_ERROR', 'Invalid profile payload.', 400, body.error.flatten());
    }

    const data = {
      displayName: body.data.displayName,
      bio: body.data.bio ?? null,
      dateOfBirth: body.data.dateOfBirth ?? null,
      avatarUrl: body.data.avatarUrl ?? null,
      latitude: body.data.latitude ?? null,
      longitude: body.data.longitude ?? null,
      city: body.data.city ?? null
    };

    return { profile: await upsertUserProfile(request.user.id, data) };
  });
}
