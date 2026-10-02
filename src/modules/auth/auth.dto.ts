import { z } from 'zod';
export const CredentialsSchema=z.object({email:z.string().trim().email().max(254),password:z.string().min(8).max(128)});
export const RefreshSchema=z.object({refreshToken:z.string().min(20).max(200)});
export const TokenSchema=z.object({token:z.string().min(20).max(300)});
export const ResetPasswordSchema=z.object({token:z.string().min(20).max(300),password:z.string().min(8).max(128)});
export interface AuthUserResponse{id:string;email:string;status:'active'|'suspended'|'deleted';}
export interface AuthResponse{user:AuthUserResponse;accessToken:string;refreshToken:string;verificationRequired:boolean;verificationToken?:string;}