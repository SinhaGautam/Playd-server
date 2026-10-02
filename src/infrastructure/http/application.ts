import express, { type Express } from 'express';
import type { IncomingHttpHeaders, Server } from 'node:http';
import supertest from 'supertest';
import { env } from '../../config/env.js';
import { requestContextMiddleware, notFoundMiddleware, errorMiddleware } from '../../common/http/error.middleware.js';
import { registerModules } from '../../modules/index.js';
import { rateLimit } from '../../common/security/rate-limit.js';
import { idempotency } from './idempotency.middleware.js';

export interface InjectRequest {
  method: string;
  url: string;
  headers?: Record<string, string>;
  payload?: unknown;
}
export interface InjectResponse {
  statusCode: number;
  headers: IncomingHttpHeaders;
  body: unknown;
  json(): unknown;
}

export class Application {
  public readonly express: Express;

  public constructor() {
    this.express = express();
    this.express.disable('x-powered-by');
    this.express.set('trust proxy', env.TRUST_PROXY);
    this.express.use(requestContextMiddleware);
    this.express.use(express.json({ limit: '64kb' }));
    this.express.use(rateLimit(300, 60_000));
    this.express.use(idempotency());
    registerModules(this.express);
    this.express.use(notFoundMiddleware);
    this.express.use(errorMiddleware);
  }

  public listen(): Promise<Server> {
    return new Promise((resolve, reject) => {
      const server = this.express.listen(env.PORT, env.HOST, () => resolve(server));
      server.once('error', reject);
    });
  }

  public async close(): Promise<void> {}

  public async inject(input: InjectRequest): Promise<InjectResponse> {
    const method = input.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';
    const agent = supertest(this.express);
    const request =
      method === 'get' ? agent.get(input.url) :
      method === 'post' ? agent.post(input.url) :
      method === 'put' ? agent.put(input.url) :
      method === 'patch' ? agent.patch(input.url) :
      agent.delete(input.url);

    request.ok(() => true);
    if (input.headers) {
      for (const [key, value] of Object.entries(input.headers)) request.set(key, value);
    }
    if (input.payload !== undefined && input.payload !== null) {
      request.send(input.payload as string | object);
    }

    const response = await request;
    return {
      statusCode: response.status,
      headers: response.headers,
      body: response.body,
      json: () => response.body
    };
  }
}