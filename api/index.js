// Re-exports the compiled NestJS serverless handler from dist/.
// All relative requires inside dist/main.vercel.js resolve correctly
// within the dist/ tree — no path issues.
module.exports = require('../dist/main.vercel');
