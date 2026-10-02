import {UnauthorizedException} from '../../core/errors.js';
import type {PasswordService} from '../../common/security/password.service.js';
import {createAccessToken} from './auth.jwt.js';
import type {AuthResponse,CredentialsDto} from './auth.dto.js';
import type {AuthRepository} from './auth.repository.js';
import {env} from '../../config/env.js';
export type CredentialsDto=import('./auth.dto.js').CredentialsDto;
export class AuthService{
 constructor(private readonly repository:AuthRepository,private readonly passwords:PasswordService){}
 private async tokens(user:any){const safe={id:user.id,email:user.email,status:user.status};return{user:safe,accessToken:await createAccessToken({id:user.id,email:user.email,status:user.status,role:user.role}),refreshToken:await this.repository.createSession(user.id),verificationRequired:!user.emailVerifiedAt};}
 async register(dto:CredentialsDto):Promise<AuthResponse>{const email=dto.email.trim().toLowerCase();const user=await this.repository.createUser(email,await this.passwords.hash(dto.password));const verificationToken=await this.repository.createVerification(user.id);const response=await this.tokens({...user,emailVerifiedAt:null});return env.NODE_ENV==='production'?response:{...response,verificationToken};}
 async login(dto:CredentialsDto):Promise<AuthResponse>{const email=dto.email.trim().toLowerCase();const user=await this.repository.findByEmail(email);if(!user||!(await this.passwords.verify(dto.password,user.passwordHash)))throw new UnauthorizedException('Invalid email or password.');if(user.status!=='active')throw new UnauthorizedException('Account is not available.');return this.tokens(user);}
 async refresh(token:string){const result=await this.repository.refresh(token);if(result.user.status!=='active')throw new UnauthorizedException('Account is not available.');return this.tokens(result.user);}
 async logout(token:string){await this.repository.revokeSession(token);}
 async verifyEmail(token:string){await this.repository.verifyEmail(token);}
 async requestReset(email:string){const token=await this.repository.createReset(email.trim().toLowerCase());return env.NODE_ENV==='production'?{accepted:true}:{accepted:true,resetToken:token};}
 async resetPassword(token:string,password:string){await this.repository.resetPassword(token,await this.passwords.hash(password));}
 async deleteAccount(userId:string){await this.repository.deleteAccount(userId);}
}