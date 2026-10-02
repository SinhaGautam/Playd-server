import {Prisma} from '../../generated/prisma/client.js';
import {prisma} from '../database/prisma.js';
export async function audit(userId:string|null,action:string,targetType:string,targetId:string|null,metadata?:unknown):Promise<void>{await prisma.auditLog.create({data:{userId,action,targetType,targetId,...(metadata===undefined?{}:{metadata:metadata as Prisma.InputJsonValue})}});}