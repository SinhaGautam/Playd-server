import { NotFoundException } from "../../core/errors.js";
import { DEFAULT_DISCOVERY_RADIUS_KM, DISCOVERY_RADIUS_MAX_KM, DISCOVERY_RADIUS_MIN_KM, DISCOVERY_RADIUS_STEP_KM, type ProfileDto, type UserPreferencesDto } from "./users.dto.js";
import type { UsersRepository } from "./users.repository.js";

export class UsersService {
  public constructor(private readonly repository: UsersRepository) {}

  public listSports() {
    return this.repository.listActiveSports().then((sports) => ({
      sports,
      skillLevels: ["beginner", "intermediate", "advanced"] as const,
      discoveryRadius: { minKm: DISCOVERY_RADIUS_MIN_KM, maxKm: DISCOVERY_RADIUS_MAX_KM, stepKm: DISCOVERY_RADIUS_STEP_KM, defaultKm: DEFAULT_DISCOVERY_RADIUS_KM },
    }));
  }

  public async getUserById(userId: string) {
    const user = await this.repository.findUser(userId);
    if (!user) throw new NotFoundException("USER_NOT_FOUND", "User not found.");
    return { user, profile: await this.repository.findProfile(userId) };
  }

  public async updateProfile(userId: string, dto: ProfileDto) {
    return { profile: await this.repository.upsertProfile(userId, dto) };
  }

  public updatePreferences(userId: string, dto: UserPreferencesDto) {
    return this.repository.upsertPreferences(userId, dto);
  }
}
