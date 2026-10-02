import { prisma } from '../../infrastructure/database/prisma.js';
import type { ProfileDto, UserProfileResponse } from './users.dto.js';

export class UsersRepository {
 public async findProfile(userId:string):Promise<UserProfileResponse|null>{
  const profile=await prisma.userProfile.findUnique({where:{userId}});
  if(!profile)return null;
  return {userId:profile.userId,displayName:profile.displayName,bio:profile.bio,dateOfBirth:profile.dateOfBirth?.toISOString().slice(0,10)??null,avatarUrl:profile.avatarUrl,latitude:profile.latitude?.toNumber()??null,longitude:profile.longitude?.toNumber()??null,city:profile.city};
 }
 public async upsertProfile(userId:string,dto:ProfileDto):Promise<UserProfileResponse>{
  const profile=await prisma.userProfile.upsert({where:{userId},create:{userId,displayName:dto.displayName,bio:dto.bio??null,dateOfBirth:dto.dateOfBirth?new Date(dto.dateOfBirth):null,avatarUrl:dto.avatarUrl??null,latitude:dto.latitude??null,longitude:dto.longitude??null,city:dto.city??null},update:{displayName:dto.displayName,bio:dto.bio??null,dateOfBirth:dto.dateOfBirth?new Date(dto.dateOfBirth):null,avatarUrl:dto.avatarUrl??null,latitude:dto.latitude??null,longitude:dto.longitude??null,city:dto.city??null}});
  return {userId:profile.userId,displayName:profile.displayName,bio:profile.bio,dateOfBirth:profile.dateOfBirth?.toISOString().slice(0,10)??null,avatarUrl:profile.avatarUrl,latitude:profile.latitude?.toNumber()??null,longitude:profile.longitude?.toNumber()??null,city:profile.city};
 }
 public async findUser(userId:string){return prisma.user.findUnique({where:{id:userId},select:{id:true,email:true,status:true}});}
}