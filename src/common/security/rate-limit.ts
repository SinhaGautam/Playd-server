import type { RequestHandler } from 'express';
import { AppException } from '../../core/errors.js';
type Bucket={count:number;resetAt:number};
const buckets=new Map<string,Bucket>();
export function rateLimit(limit:number,windowMs:number,keyer:(req:any)=>string=(req)=>req.ip):RequestHandler{
 return (req,_res,next)=>{const now=Date.now();const key=keyer(req);let b=buckets.get(key);
 if(!b||b.resetAt<=now){b={count:0,resetAt:now+windowMs};buckets.set(key,b);}
 b.count++;if(b.count>limit){next(new AppException('RATE_LIMITED','Too many requests. Please try again later.',429,{retryAfterMs:b.resetAt-now}));return;}next();};
}