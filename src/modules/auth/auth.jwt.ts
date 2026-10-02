import { jwtVerify, SignJWT } from 'jose';
import { env } from '../../config/env.js';
import { UnauthorizedException } from '../../core/errors.js';
import type { AuthenticatedUser } from './auth.types.js';
const secret=new TextEncoder().encode(env.JWT_SECRET);
export async function createAccessToken(user:AuthenticatedUser):Promise<string>{
  return new SignJWT({email:user.email,status:user.status}).setProtectedHeader({alg:'HS256',typ:'JWT'}).setSubject(user.id).setIssuedAt().setExpirationTime(env.JWT_EXPIRES_IN).sign(secret);
}
export async function verifyAccessToken(token:string):Promise<AuthenticatedUser>{
  try{
    const {payload}=await jwtVerify(token,secret,{algorithms:['HS256']});
    if(!payload.sub||typeof payload.email!=='string'||!['active','suspended','deleted'].includes(String(payload.status))) throw new Error('invalid claims');
    return {id:payload.sub,email:payload.email,status:payload.status as AuthenticatedUser['status']};
  }catch{throw new UnauthorizedException();}
}