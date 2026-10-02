import type { Express } from 'express';

export abstract class BaseModule {
  public abstract register(app: Express): void;
}