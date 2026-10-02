import type { Request } from 'express';
import { z } from 'zod';
import { ValidationException } from '../../core/errors.js';

export function parseBody<T extends z.ZodType>(schema: T, request: Request): z.infer<T> {
  const result = schema.safeParse(request.body);
  if (!result.success) throw new ValidationException('Invalid request body.', result.error.flatten());
  return result.data;
}

export function parseParams<T extends z.ZodType>(schema: T, request: Request): z.infer<T> {
  const result = schema.safeParse(request.params);
  if (!result.success) throw new ValidationException('Invalid route parameters.', result.error.flatten());
  return result.data;
}

export function parseQuery<T extends z.ZodType>(schema: T, request: Request): z.infer<T> {
  const result = schema.safeParse(request.query);
  if (!result.success) throw new ValidationException('Invalid query parameters.', result.error.flatten());
  return result.data;
}