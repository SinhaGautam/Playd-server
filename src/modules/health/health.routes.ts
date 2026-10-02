import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma.js';
import { ApiResponse } from '../../common/http/api-response.js';
export function healthRouter():Router{
 const router=Router();
 router.get('/health/live',(req,res)=>res.json(ApiResponse.success({status:'ok'},req.requestId)));
 router.get('/health/ready',async(req,res,next)=>{try{await prisma.$queryRaw`SELECT 1`;return res.json(ApiResponse.success({status:'ok',database:'ok'},req.requestId));}catch(error){next(error);}});
 return router;
}