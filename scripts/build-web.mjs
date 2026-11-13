import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.NODE_ENV = 'production';
const { build } = await import('vite');

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../client');

await build({
  root: clientRoot,
  configFile: path.join(clientRoot, 'vite.config.js'),
});
