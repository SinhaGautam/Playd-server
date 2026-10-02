import {Router} from 'express';
import type {AuthController} from './auth.controller.js';
export function authRouter(controller:AuthController):Router{const router=Router();router.post('/v1/auth/register',controller.register);router.post('/v1/auth/login',controller.login);return router;}