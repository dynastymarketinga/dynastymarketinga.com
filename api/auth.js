import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { createVercelBeginHandler } = require('netlify-cms-oauth-provider-node');

export default createVercelBeginHandler({}, { useEnv: true });
