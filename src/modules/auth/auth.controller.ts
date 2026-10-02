import type { Request,Response,NextFunction } from 'express';
import { parseBody } from '../../common/validation/validate.js';
import { ApiResponse } from '../../common/http/api-response.js';
import { CredentialsSchema } from './auth.dto.js';
import { AuthService } from './auth.service.js';

export class AuthController {
  public constructor(private readonly service:AuthService){}
  public register=async(req:Request,res:Response,next:NextFunction)=>{try{const data=parseBody(CredentialsSchema,req);const result=await this.service.register(data);return res.status(201).json(ApiResponse.success(result,req.requestId));}catch(error){next(error);}};
  public login=async(req:Request,res:Response,next:NextFunction)=>{try{const data=parseBody(CredentialsSchema,req);const result=await this.service.login(data);return res.json(ApiResponse.success(result,req.requestId));}catch(error){next(error);}};
}