import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import type { UsersController } from "./users.controller.js";

export function usersRouter(controller: UsersController): Router {
  const r = Router();
  r.get("/v1/sports", requireAuth, controller.listSports);
  r.get("/v1/users", requireAuth, controller.getUserById);
  r.put("/v1/users/profile", requireAuth, controller.updateProfile);
  r.put("/v1/users/preferences", requireAuth, controller.updatePreferences);
  return r;
}
