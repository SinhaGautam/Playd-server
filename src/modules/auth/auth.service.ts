import {UnauthorizedException} from '../../core/errors.js';
import type {PasswordService} from '../../common/security/password.service.js';
import {createAccessToken} from './auth.jwt.js';
import type {AuthResponse,CredentialsDto} from './auth.dto.js';
import type {AuthRepository} from './auth.repository.js';
import {env} from '../../config/env.js';
import {audit} from '../../infrastructure/observability/audit.js';
type TokenUser={id:string;email:string;status:'active'|'suspended'|'deleted';role:'user'|'admin';emailVerifiedAt:Date|null};
export class AuthService{
 constructor(private readonly repository:AuthRepository,private readonly passwords:PasswordService){}
 private async tokenResponse(user:TokenUser,refreshToken?:string):Promise<AuthResponse>{const safe={id:user.id,email:user.email,status:user.status};const token=refreshToken??await this.repository.createSession(user.id);const base={user:safe,accessToken:await createAccessToken({id:user.id,email:user.email,status:user.status,role:user.role}),refreshToken:token,verificationRequired:!user.emailVerifiedAt};return env.NODE_ENV==='production'||user.emailVerifiedAt?base:{...base,verificationToken:await this.repository.createVerification(user.id)};}
 async register(dto:CredentialsDto){const email=dto.email.trim().toLowerCase();const user=await this.repository.createUser(email,await this.passwords.hash(dto.password));return this.tokenResponse({...user,emailVerifiedAt:null});}
 async login(dto:CredentialsDto){const email=dto.email.trim().toLowerCase();const user=await this.repository.findByEmail(email);if(!user||!(await this.passwords.verify(dto.password,user.passwordHash)))throw new UnauthorizedException('Invalid email or password.');if(user.status!=='active')throw new UnauthorizedException('Account is not available.');await audit(user.id,'auth.login','user',user.id);return this.tokenResponse(user);}
 async refresh(token:string){const result=await this.repository.refresh(token);if(result.user.status!=='active')throw new UnauthorizedException('Account is not available.');return this.tokenResponse(result.user,result.refreshToken);}
 async logout(token:string|undefined,userId:string){if(token)await this.repository.revokeSession(token);else await this.repository.revokeAll(userId);await audit(userId,'auth.logout','user',userId);}
 async verifyEmail(token:string){await this.repository.verifyEmail(token);}
 async requestReset(email:string){const token=await this.repository.createReset(email.trim().toLowerCase());return env.NODE_ENV==='production'?{accepted:true}:{accepted:true,resetToken:token};}
 async resetPassword(token:string,password:string){await this.repository.resetPassword(token,await this.passwords.hash(password));}
 async deleteAccount(userId:string){await this.repository.deleteAccount(userId);await audit(userId,'auth.account.delete','user',userId);}
}