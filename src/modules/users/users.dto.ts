import { z } from "zod";

export const DISCOVERY_RADIUS_MIN_KM = 0;
export const DISCOVERY_RADIUS_MAX_KM = 1000;
export const DISCOVERY_RADIUS_STEP_KM = 5;
export const DEFAULT_DISCOVERY_RADIUS_KM = 50;

const UserSportSelectionSchema = z.object({
  slug: z.string().trim().min(1).max(80),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
});

export const ProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  bio: z.string().max(500).nullable().optional(),
  dateOfBirth: z.string().date().nullable().optional(),
  avatarUrl: z.string().url().max(2048).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  sports: z.array(UserSportSelectionSchema).max(50).optional(),
});

export const UserPreferencesSchema = z.object({
  maxDistanceKm: z.number().min(DISCOVERY_RADIUS_MIN_KM).max(DISCOVERY_RADIUS_MAX_KM).nullable(),
});

export type ProfileDto = z.infer<typeof ProfileSchema>;
export type UserPreferencesDto = z.infer<typeof UserPreferencesSchema>;
export interface UserProfileResponse {
  userId: string;
  displayName: string;
  bio: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  sports: Array<{ slug: string; name: string; skillLevel: "beginner" | "intermediate" | "advanced" }>;
  maxDistanceKm: number | null;
}
export interface SportCatalogueItem {
  slug: string;
  name: string;
}
