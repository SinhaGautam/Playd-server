import type {Request,Response,NextFunction} from 'express';
import {ApiResponse} from '../../common/http/api-response.js';
import {parseBody,parseParams,parseQuery} from '../../common/validation/validate.js';
import {MatchParamsSchema,ConversationParamsSchema,MessageQuerySchema,MessageBodySchema,ReadMessageSchema} from './chat.dto.js';
import type {ChatService} from './chat.service.js';
export class ChatController{constructor(private readonly service:ChatService){}
 createConversation=async(req:Request,res:Response,next:NextFunction)=>{try{const p=parseParams(MatchParamsSchema,req);return res.json(ApiResponse.success({conversation:await this.service.getOrCreate(req.user!.id,p.matchId)},req.requestId));}catch(e){next(e);}};
 listMessages=async(req:Request,res:Response,next:NextFunction)=>{try{const p=parseParams(ConversationParamsSchema,req),q=parseQuery(MessageQuerySchema,req);return res.json(ApiResponse.success({messages:await this.service.list(req.user!.id,p.conversationId,q.limit,q.beforeId),unreadCount:await this.service.unreadCount(req.user!.id,p.conversationId)},req.requestId));}catch(e){next(e);}};
 sendMessage=async(req:Request,res:Response,next:NextFunction)=>{try{const p=parseParams(ConversationParamsSchema,req),b=parseBody(MessageBodySchema,req);return res.status(201).json(ApiResponse.success({message:await this.service.send(req.user!.id,p.conversationId,b.body)},req.requestId));}catch(e){next(e);}};
 markRead=async(req:Request,res:Response,next:NextFunction)=>{try{const p=parseParams(ConversationParamsSchema,req),b=parseBody(ReadMessageSchema,req);await this.service.markRead(req.user!.id,p.conversationId,b.messageId);return res.status(204).send();}catch(e){next(e);}};
}