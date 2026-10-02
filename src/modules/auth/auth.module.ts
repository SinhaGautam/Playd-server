import type { Express } from 'express';
import { BaseModule } from '../../common/modules/base.module.js';
import { PasswordService } from '../../common/security/password.service.js';
import { AuthController } from './auth.controller.js';
import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';
import { authRouter } from './auth.routes.js';
export class AuthModule extends BaseModule{
 public register(app:Express):void{
  const repository=new AuthRepository();
  const service=new AuthService(repository,new PasswordService());
  app.use(authRouter(new AuthController(service)));
 }
}