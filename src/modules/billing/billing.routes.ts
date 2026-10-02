import {Router} from 'express';
import {requireAuth} from '../auth/auth.middleware.js';
import type {BillingController} from './billing.controller.js';
export function billingRouter(c:BillingController):Router{const r=Router();r.get('/v1/billing/subscription',requireAuth,c.subscription);r.post('/v1/billing/coupons/redeem',requireAuth,c.redeem);return r;}