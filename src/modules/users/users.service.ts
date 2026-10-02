import { NotFoundException } from '../../core/errors.js';
import type { ProfileDto } from './users.dto.js';
import { UsersRepository } from './users.repository.js';

export class UsersService{
 public constructor(private readonly repository:UsersRepository){}
 public async getMe(userId:string){const user=await this.repository.findUser(userId);if(!user)throw new NotFoundException('USER_NOT_FOUND','User not found.');return {user,profile:await this.repository.findProfile(userId)};}
 public async updateProfile(userId:string,dto:ProfileDto){return {profile:await this.repository.upsertProfile(userId,dto)};}
}