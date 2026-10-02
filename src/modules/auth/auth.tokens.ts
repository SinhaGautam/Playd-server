import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '../../infrastructure/database/prisma.js';
export function hashToken(token:string){return createHash('sha256').update(token).digest('hex');}
export async function createSession(userId:string){const token=randomBytes(48).toString('base64url');await prisma.authSession.create({data:{userId,tokenHash:hashToken(token),expiresAt:new Date(Date.now()+30*86400000)}});return token;}
export async function consumeSession(token:string){const row=await prisma.authSession.findUnique({where:{tokenHash:hashToken(token)}});if(!row||row.expiresAt<=new Date())return null;return{userId:row.userId};}