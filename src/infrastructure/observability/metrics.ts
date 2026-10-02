import { logger } from '../logging/logger.js';
const startedAt=Date.now();let requests=0;let errors=0;let durationMs=0;
export function recordRequest(duration:number,isError:boolean){requests++;durationMs+=duration;if(isError)errors++;}
export function metricsSnapshot(){return{uptimeSeconds:Math.floor((Date.now()-startedAt)/1000),requests,errors,averageLatencyMs:requests?Math.round(durationMs/requests):0};}
export function logMetrics(){logger.info({metrics:metricsSnapshot()},'metrics snapshot');}