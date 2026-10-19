import { prisma } from "../../infrastructure/database/prisma.js";
import { ValidationException } from "../../core/errors.js";
import type {
  ProfileDto,
  UserPreferencesDto,
  UserProfileResponse,
} from "./users.dto.js";

export class UsersRepository {
  public async listActiveSports() {
    return prisma.sport.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    });
  }

  public async findProfile(
    userId: string,
  ): Promise<UserProfileResponse | null> {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            sports: {
              include: { sport: { select: { slug: true, name: true } } },
              orderBy: { sportId: "asc" },
            },
            preferences: { select: { maxDistanceKm: true } },
          },
        },
      },
    });
    if (!profile) return null;
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      bio: profile.bio,
      dateOfBirth: profile.dateOfBirth?.toISOString().slice(0, 10) ?? null,
      avatarUrl: profile.avatarUrl,
      latitude: profile.latitude?.toNumber() ?? null,
      longitude: profile.longitude?.toNumber() ?? null,
      city: profile.city,
      sports: profile.user.sports.map((item) => ({
        slug: item.sport.slug,
        name: item.sport.name,
        skillLevel: item.skillLevel,
      })),
      maxDistanceKm: profile.user.preferences?.maxDistanceKm?.toNumber() ?? null,
    };
  }

  public async upsertProfile(
    userId: string,
    dto: ProfileDto,
  ): Promise<UserProfileResponse> {
    await prisma.$transaction(async (tx) => {
      await tx.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          displayName: dto.displayName,
          bio: dto.bio ?? null,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          avatarUrl: dto.avatarUrl ?? null,
          latitude: dto.latitude ?? null,
          longitude: dto.longitude ?? null,
          city: dto.city ?? null,
        },
        update: {
          displayName: dto.displayName,
          bio: dto.bio ?? null,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          avatarUrl: dto.avatarUrl ?? null,
          latitude: dto.latitude ?? null,
          longitude: dto.longitude ?? null,
          city: dto.city ?? null,
        },
      });

      if (dto.sports !== undefined) {
        const slugs = dto.sports.map((sport) => sport.slug);
        if (new Set(slugs).size !== slugs.length) {
          throw new ValidationException("Each sport can only be selected once.");
        }
        const activeSports = await tx.sport.findMany({
          where: { active: true, slug: { in: slugs } },
          select: { id: true, slug: true },
        });
        if (activeSports.length !== slugs.length) {
          throw new ValidationException("One or more selected sports are unavailable.");
        }
        await tx.userSport.deleteMany({ where: { userId } });
        if (dto.sports.length) {
          await tx.userSport.createMany({
            data: dto.sports.map((selection) => ({
              userId,
              sportId: activeSports.find((sport) => sport.slug === selection.slug)!.id,
              skillLevel: selection.skillLevel,
            })),
          });
        }
      }
    });

    const profile = await this.findProfile(userId);
    if (!profile) throw new Error("Profile upsert completed but profile could not be reloaded.");
    return profile;
  }

  public async upsertPreferences(userId: string, dto: UserPreferencesDto) {
    const preference = await prisma.userPreference.upsert({
      where: { userId },
      create: { userId, maxDistanceKm: dto.maxDistanceKm },
      update: { maxDistanceKm: dto.maxDistanceKm },
      select: { userId: true, maxDistanceKm: true, updatedAt: true },
    });
    return {
      preferences: {
        userId: preference.userId,
        maxDistanceKm: preference.maxDistanceKm?.toNumber() ?? null,
        updatedAt: preference.updatedAt,
      },
    };
  }

  public async findUser(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, status: true },
    });
  }
}
