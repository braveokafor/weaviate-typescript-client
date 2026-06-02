import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';

export function createKeepAliveAgent(secure: boolean): HttpAgent | HttpsAgent {
  return secure ? new HttpsAgent({ keepAlive: true }) : new HttpAgent({ keepAlive: true });
}
