import {logger} from '../logging/logger.js';
export function captureException(error:unknown,context:Record<string,unknown>={}){logger.error({err:error,...context},'error-monitor event');}