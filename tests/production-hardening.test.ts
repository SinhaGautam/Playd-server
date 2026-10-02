import {describe,expect,it} from 'vitest';
import {rateLimit} from '../src/common/security/rate-limit.js';
import {metricsSnapshot,recordRequest} from '../src/infrastructure/observability/metrics.js';
import {createAccessToken,verifyAccessToken} from '../src/modules/auth/auth.jwt.js';
import {readFileSync} from 'node:fs';
describe('V1 security hardening',()=>{
 it('rate limits repeated requests per key',()=>{const handler=rateLimit(1,60_000,req=>req.key);const req={key:'test'};let calls=0;handler(req as any,{} as any,()=>{calls++;});handler(req as any,{} as any,()=>{calls++;});expect(calls).toBe(1);});
 it('creates and verifies short-lived access JWTs with role claims',async()=>{const token=await createAccessToken({id:'00000000-0000-0000-0000-000000000001',email:'test@example.com',status:'active',role:'user'});const user=await verifyAccessToken(token);expect(user.role).toBe('user');expect(user.id).toBe('00000000-0000-0000-0000-000000000001');});
 it('records request metrics',()=>{const before=metricsSnapshot().requests;recordRequest(12,false);expect(metricsSnapshot().requests).toBe(before+1);});
 it('migration contains production security state',()=>{const sql=readFileSync('src/db/migrations/004_production_hardening.sql','utf8');for(const table of ['auth_sessions','password_reset_tokens','email_verification_tokens','audit_logs','idempotency_keys','webhook_events','message_reads'])expect(sql).toContain(table);});
});