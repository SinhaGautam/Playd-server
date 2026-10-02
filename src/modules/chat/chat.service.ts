import type {ChatRepository} from './chat.repository.js';
export class ChatService{
  public constructor(private readonly repository:ChatRepository){}
  public getOrCreate(userId:string,matchId:string){return this.repository.getOrCreateConversation(userId,matchId);}
  public list(userId:string,conversationId:string,limit:number,beforeId?:bigint){return this.repository.listMessages(userId,conversationId,limit,beforeId);}
  public send(userId:string,conversationId:string,body:string){return this.repository.sendMessage(userId,conversationId,body);}\n  public markRead(userId:string,conversationId:string,messageId:bigint){return this.repository.markRead(userId,conversationId,messageId);}\n  public unreadCount(userId:string,conversationId:string){return this.repository.unreadCount(userId,conversationId);}
}