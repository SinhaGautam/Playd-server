import { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../infrastructure/database/prisma.js';
import { ConflictException } from '../../core/errors.js';
import type { AuthUserResponse } from './auth.dto.js';

export class AuthRepository {
  public async createUser(email:string,passwordHash:string):Promise<AuthUserResponse>{
    try{
      return await prisma.user.create({data:{email,passwordHash},select:{id:true,email:true,status:true}});
    }catch(error){
      if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002') throw new ConflictException('EMAIL_ALREADY_EXISTS','An account with this email already exists.');
      throw error;
    }
  }
  public async findByEmail(email:string):Promise<(AuthUserResponse&{passwordHash:string})|null>{
    return prisma.user.findUnique({where:{email},select:{id:true,email:true,status:true,passwordHash:true}});
  }
}