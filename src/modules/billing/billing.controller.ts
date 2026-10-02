import type {Request,Response,NextFunction} from 'express';
import {ApiResponse} from '../../common/http/api-response.js';
import {parseBody} from '../../common/validation/validate.js';
import {CouponSchema} from './billing.dto.js';
import type {BillingService} from './billing.service.js';
export class BillingController{public constructor(private readonly service:BillingService){}public subscription=async(req:Request,res:Response,next:NextFunction)=>{try{return res.json(ApiResponse.success({subscription:await this.service.getSubscription(req.user!.id)},req.requestId));}catch(e){next(e);}};public redeem=async(req:Request,res:Response,next:NextFunction)=>{try{return res.json(ApiResponse.success({subscription:await this.service.redeem(req.user!.id,parseBody(CouponSchema,req))},req.requestId));}catch(e){next(e);}};}