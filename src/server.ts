import { buildApp } from './app.js';
import { env } from './config/env.js';
import { disconnectDatabase } from './infrastructure/database/prisma.js';
import { logger } from './infrastructure/logging/logger.js';

const application=buildApp();
let server: Awaited<ReturnType<Application['listen']>>|undefined;
let shuttingDown=false;

async function shutdown(signal:string):Promise<void>{
  if(shuttingDown)return;
  shuttingDown=true;
  logger.info({signal},'shutdown started');
  const timeout=setTimeout(()=>{logger.error({signal},'shutdown timeout');process.exit(1);},env.SHUTDOWN_TIMEOUT_MS);
  timeout.unref();
  try{
    if(server) await new Promise<void>((resolve,reject)=>server!.close(error=>error?reject(error):resolve()));
    await disconnectDatabase();
    clearTimeout(timeout);
    logger.info({signal},'shutdown completed');
    process.exit(0);
  }catch(error){
    logger.error({err:error,signal},'shutdown failed');
    clearTimeout(timeout);
    process.exit(1);
  }
}
process.on('SIGINT',()=>void shutdown('SIGINT'));
process.on('SIGTERM',()=>void shutdown('SIGTERM'));
try{server=await application.listen();logger.info({host:env.HOST,port:env.PORT},'server started');}
catch(error){logger.error({err:error},'server startup failed');await disconnectDatabase();process.exit(1);}