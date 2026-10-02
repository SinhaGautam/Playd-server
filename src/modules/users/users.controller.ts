import type { Request,Response,NextFunction } from 'express';
import { ApiResponse } from '../../common/http/api-response.js';
import { parseBody } from '../../common/validation/validate.js';
import { ProfileSchema } from './users.dto.js';
import { UsersService } from './users.service.js';
export class UsersController{public constructor(private readonly service:UsersService){} public me=async(req:Request,res:Response,next:NextFunction)=>{try{return res.json(ApiResponse.success(await this.service.getMe(req.user!.id),req.requestId));}catch(error){next(error);}};public updateProfile=async(req:Request,res:Response,next:NextFunction)=>{try{return res.json(ApiResponse.success(await this.service.updateProfile(req.user!.id,parseBody(ProfileSchema,req)),req.requestId));}catch(error){next(error);}};}