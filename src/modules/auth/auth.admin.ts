import type {RequestHandler} from 'express';
import {ForbiddenException} from '../../core/errors.js';
export const requireAdmin:RequestHandler=(req,_res,next)=>{if(req.user?.role!=='admin'){next(new ForbiddenException('Admin access required.'));return;}next();};