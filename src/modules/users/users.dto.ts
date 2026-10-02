import { z } from 'zod';
export const ProfileSchema=z.object({
 displayName:z.string().trim().min(1).max(80),
 bio:z.string().max(500).nullable().optional(),
 dateOfBirth:z.string().date().nullable().optional(),
 avatarUrl:z.string().url().max(2048).nullable().optional(),
 latitude:z.number().min(-90).max(90).nullable().optional(),
 longitude:z.number().min(-180).max(180).nullable().optional(),
 city:z.string().trim().max(120).nullable().optional()
});
export type ProfileDto=z.infer<typeof ProfileSchema>;
export interface UserProfileResponse { userId:string;displayName:string;bio:string|null;dateOfBirth:string|null;avatarUrl:string|null;latitude:number|null;longitude:number|null;city:string|null; }