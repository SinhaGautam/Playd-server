import type { RequestHandler } from 'express';
import { UnauthorizedException } from '../../core/errors.js';
import { verifyAccessToken } from './auth.jwt.js';
export const requireAuth: RequestHandler = async (request,_response,next) => {
  try {
    const authorization=request.header('authorization');
    if(!authorization?.startsWith('Bearer ')) throw new UnauthorizedException();
    request.user=await verifyAccessToken(authorization.slice(7).trim());
    next();
  } catch(error){ next(error); }
};