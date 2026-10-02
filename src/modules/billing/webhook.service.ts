import {prisma} from '../../infrastructure/database/prisma.js';
import type {PaymentProviderSubscriptionEvent} from './payment-provider.js';
export async function handleSubscriptionWebhook(event:PaymentProviderSubscriptionEvent){
 const exists=await prisma.webhookEvent.findUnique({where:{providerEventId:event.providerEventId}});if(exists)return;
 await prisma.$transaction(async tx=>{await tx.webhookEvent.create({data:{providerEventId:event.providerEventId,provider:event.provider,eventType:'subscription',payload:event as any}});await tx.subscription.updateMany({where:{provider:event.provider,providerSubscriptionId:event.subscriptionId},data:{status:event.status,currentPeriodStart:event.periodStart,currentPeriodEnd:event.periodEnd}});});
}