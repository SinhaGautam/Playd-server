import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { ProfileSchema, UserPreferencesSchema } from "../src/modules/users/users.dto.js";

describe("sports and profile preferences", () => {
  const apps: ReturnType<typeof buildApp>[] = [];

  afterEach(async () => {
    await Promise.all(apps.map((app) => app.close()));
    apps.length = 0;
  });

  it("requires authentication for the sports catalogue", async () => {
    const app = buildApp();
    apps.push(app);
    const response = await app.inject({ method: "GET", url: "/v1/sports" });
    expect(response.statusCode).toBe(401);
  });

  it("requires authentication for preference updates", async () => {
    const app = buildApp();
    apps.push(app);
    const response = await app.inject({
      method: "PUT",
      url: "/v1/users/preferences",
      payload: { maxDistanceKm: 25 },
    });
    expect(response.statusCode).toBe(401);
  });

  it("only accepts skill levels supported by the backend", () => {
    expect(ProfileSchema.safeParse({
      displayName: "Test player",
      sports: [{ slug: "cricket", skillLevel: "advanced" }],
    }).success).toBe(true);
    expect(ProfileSchema.safeParse({
      displayName: "Test player",
      sports: [{ slug: "cricket", skillLevel: "competitive" }],
    }).success).toBe(false);
  });

  it("validates discovery radius against database constraints", () => {
    expect(UserPreferencesSchema.safeParse({ maxDistanceKm: 1000 }).success).toBe(true);
    expect(UserPreferencesSchema.safeParse({ maxDistanceKm: 1001 }).success).toBe(false);
    expect(UserPreferencesSchema.safeParse({ maxDistanceKm: -1 }).success).toBe(false);
  });
});
