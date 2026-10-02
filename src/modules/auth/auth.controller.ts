import type {Request,Response,NextFunction} from 'express';
import {parseBody} from '../../common/validation/validate.js';
import {ApiResponse} from '../../common/http/api-response.js';
import {CredentialsSchema} from './auth.dto.js';
import type {AuthService} from './auth.service.js';
export class AuthController{public constructor(private readonly service:AuthService){}public register=async(req:Request,res:Response,next:NextFunction)=>{try{const data=parseBody(CredentialsSchema,req);return res.status(201).json(ApiResponse.success(await this.service.register(data),req.requestId));}catch(e){next(e);}};public login=async(req:Request,res:Response,next:NextFunction)=>{try{const data=parseBody(CredentialsSchema,req);return res.json(ApiResponse.success(await this.service.login(data),req.requestId));}catch(e){next(e);}};}