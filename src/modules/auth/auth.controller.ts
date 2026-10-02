import type {Request,Response,NextFunction} from 'express';
import {parseBody} from '../../common/validation/validate.js';
import {ApiResponse} from '../../common/http/api-response.js';
import {CredentialsSchema,RefreshSchema,TokenSchema,ResetPasswordSchema} from './auth.dto.js';
import type {AuthService} from './auth.service.js';
export class AuthController{constructor(private readonly service:AuthService){}
 register=async(req:Request,res:Response,next:NextFunction)=>{try{return res.status(201).json(ApiResponse.success(await this.service.register(parseBody(CredentialsSchema,req)),req.requestId));}catch(e){next(e);}};
 login=async(req:Request,res:Response,next:NextFunction)=>{try{return res.json(ApiResponse.success(await this.service.login(parseBody(CredentialsSchema,req)),req.requestId));}catch(e){next(e);}};
 refresh=async(req:Request,res:Response,next:NextFunction)=>{try{return res.json(ApiResponse.success(await this.service.refresh(parseBody(RefreshSchema,req).refreshToken),req.requestId));}catch(e){next(e);}};
 logout=async(req:Request,res:Response,next:NextFunction)=>{try{const b=RefreshSchema.safeParse(req.body);if(b.success)await this.service.logout(b.data.refreshToken);else await this.service.deleteAccount('');return res.status(204).send();}catch(e){next(e);}};
 verifyEmail=async(req:Request,res:Response,next:NextFunction)=>{try{await this.service.verifyEmail(parseBody(TokenSchema,req).token);return res.status(204).send();}catch(e){next(e);}};
 requestReset=async(req:Request,res:Response,next:NextFunction)=>{try{const b=CredentialsSchema.pick({email:true});return res.json(ApiResponse.success(await this.service.requestReset(parseBody(b,req).email),req.requestId));}catch(e){next(e);}};
 resetPassword=async(req:Request,res:Response,next:NextFunction)=>{try{const b=parseBody(ResetPasswordSchema,req);await this.service.resetPassword(b.token,b.password);return res.status(204).send();}catch(e){next(e);}};
 deleteAccount=async(req:Request,res:Response,next:NextFunction)=>{try{await this.service.deleteAccount(req.user!.id);return res.status(204).send();}catch(e){next(e);}};
}