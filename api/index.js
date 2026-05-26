// Re-exports the compiled NestJS serverless handler from dist/.
// includeFiles:"dist/**" in vercel.json ensures dist/ is present in the Lambda.
const nodePath = require('path');
module.exports = require(nodePath.join(__dirname, '..', 'dist', 'main.vercel'));
