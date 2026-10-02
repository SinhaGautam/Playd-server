import type {CouponDto,SubscriptionResponse} from './billing.dto.js';
import type {BillingRepository} from './billing.repository.js';
export class BillingService{
  public constructor(private readonly repository:BillingRepository){}
  public getSubscription(userId:string):Promise<SubscriptionResponse|null>{return this.repository.getSubscription(userId);}
  public redeem(userId:string,dto:CouponDto):Promise<SubscriptionResponse>{return this.repository.redeem(userId,dto);}
}