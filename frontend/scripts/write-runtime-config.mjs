import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const apiBaseUrl = (process.env.API_BASE_URL ?? '').trim().replace(/\/$/, '');
if (apiBaseUrl && !/^https:\/\//i.test(apiBaseUrl)) {
  throw new Error('API_BASE_URL must use HTTPS in hosted deployments.');
}

const config = `window.__CLINIC_CONFIG__ = ${JSON.stringify({ apiBaseUrl })};\n`;
await writeFile(resolve('public/runtime-config.js'), config, 'utf8');