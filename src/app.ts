import { Application } from './infrastructure/http/application.js';
export function buildApp(): Application { return new Application(); }