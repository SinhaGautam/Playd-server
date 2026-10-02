import { z } from 'zod';
export const CredentialsSchema=z.object({email:z.string().trim().email().max(254),password:z.string().min(8).max(128)});
export type CredentialsDto=z.infer<typeof CredentialsSchema>;
export interface AuthUserResponse { id:string; email:string; status:'active'|'suspended'|'deleted'; }
export interface AuthResponse { user:AuthUserResponse; accessToken:string; }