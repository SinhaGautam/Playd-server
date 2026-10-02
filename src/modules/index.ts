import type { Express } from 'express';
import { BaseModule } from '../common/modules/base.module.js';
import { healthRouter } from './health/health.routes.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { DiscoveryModule } from './discovery/discovery.module.js';
import { MatchingModule } from './matching/matching.module.js';
import { ChatModule } from './chat/chat.module.js';
import { SafetyModule } from './safety/safety.module.js';
import { BillingModule } from './billing/billing.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';

export function registerModules(app:Express):void{
  app.use(healthRouter());
  const modules:BaseModule[]=[new AuthModule(),new UsersModule(),new DiscoveryModule(),new MatchingModule(),new ChatModule(),new SafetyModule(),new BillingModule(),new NotificationsModule()];
  for(const module of modules) module.register(app);
}