import type { Request } from 'express';
import type { AuthenticatedUser } from '../../modules/auth/auth.types.js';

declare module 'express-serve-static-core' {
  interface Request {
    requestId: string;
    user?: AuthenticatedUser;
  }
}

export type AppRequest = Request;