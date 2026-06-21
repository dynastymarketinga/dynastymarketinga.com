import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { createVercelCompleteHandler } = require('netlify-cms-oauth-provider-node');

export default createVercelCompleteHandler({}, { useEnv: true });
