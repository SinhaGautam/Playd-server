import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt=promisify(scryptCallback);
const KEY_LENGTH=64;
const SALT_BYTES=16;

export class PasswordService {
  public async hash(password:string):Promise<string>{
    const salt=randomBytes(SALT_BYTES).toString('base64url');
    const derived=(await scrypt(password,salt,KEY_LENGTH)) as Buffer;
    return `scrypt:${salt}:${derived.toString('base64url')}`;
  }
  public async verify(password:string,encoded:string):Promise<boolean>{
    const [scheme,salt,expected]=encoded.split(':');
    if(scheme!=='scrypt'||!salt||!expected)return false;
    const actual=(await scrypt(password,salt,KEY_LENGTH)) as Buffer;
    const expectedBuffer=Buffer.from(expected,'base64url');
    return expectedBuffer.length===actual.length&&timingSafeEqual(actual,expectedBuffer);
  }
}