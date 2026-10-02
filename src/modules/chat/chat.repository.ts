import {prisma} from '../../infrastructure/database/prisma.js';
import {NotFoundException} from '../../core/errors.js';
import type {ConversationSummary,MessageResponse} from './chat.dto.js';

export class ChatRepository{
  public async getActiveMatch(userId:string,matchId:string){return prisma.match.findFirst({where:{id:matchId,status:'active',OR:[{userAId:userId},{userBId:userId}]},select:{id:true,userAId:true,userBId:true}});}
  public async getOrCreateConversation(userId:string,matchId:string):Promise<ConversationSummary>{
    const match=await this.getActiveMatch(userId,matchId);
    if(!match)throw new NotFoundException('MATCH_NOT_FOUND','Active match not found.');
    const conversation=await prisma.$transaction(async tx=>{
      const created=await tx.conversation.upsert({where:{matchId},create:{matchId},update:{}});
      await tx.conversationMember.createMany({data:[{conversationId:created.id,userId:match.userAId},{conversationId:created.id,userId:match.userBId}],skipDuplicates:true});
      return created;
    });
    const otherUserId=match.userAId===userId?match.userBId:match.userAId;
    const profile=await prisma.userProfile.findUnique({where:{userId:otherUserId},select:{displayName:true,avatarUrl:true}});
    if(!profile)throw new NotFoundException('PROFILE_NOT_FOUND','User profile not found.');
    return{id:conversation.id,matchId,createdAt:conversation.createdAt.toISOString(),otherUser:{userId:otherUserId,displayName:profile.displayName,avatarUrl:profile.avatarUrl}};
  }
  public async requireMember(userId:string,conversationId:string):Promise<void>{
    const member=await prisma.conversationMember.findUnique({where:{conversationId_userId:{conversationId,userId}},include:{conversation:{include:{match:true}}}});
    if(!member||member.conversation.match.status!=='active')throw new NotFoundException('CONVERSATION_NOT_FOUND','Conversation not found.');
  }
  public async listMessages(userId:string,conversationId:string,limit:number,beforeId?:bigint):Promise<MessageResponse[]>{
    await this.requireMember(userId,conversationId);
    const rows=await prisma.message.findMany({where:{conversationId,deletedAt:null,...(beforeId?{id:{lt:beforeId}}:{})},orderBy:{id:'desc'},take:limit});
    return rows.map(row=>({id:row.id.toString(),senderUserId:row.senderUserId,body:row.body,createdAt:row.createdAt.toISOString(),editedAt:row.editedAt?.toISOString()??null}));
  }
  public async sendMessage(userId:string,conversationId:string,body:string):Promise<MessageResponse>{
    await this.requireMember(userId,conversationId);
    const message=await prisma.$transaction(async tx=>{
      const created=await tx.message.create({data:{conversationId,senderUserId:userId,body:body.trim()}});
      const members=await tx.conversationMember.findMany({where:{conversationId,userId:{not:userId}},select:{userId:true}});
      if(members.length)await tx.notification.createMany({data:members.map(member=>({userId:member.userId,type:'message' as const,title:'New message',body:created.body.slice(0,120)}))});
      return created;
    });
    return{id:message.id.toString(),senderUserId:message.senderUserId,body:message.body,createdAt:message.createdAt.toISOString(),editedAt:message.editedAt?.toISOString()??null};
  }
}