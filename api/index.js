// Loads the compiled NestJS serverless handler from dist/.
// The path is constructed dynamically so ncc cannot hoist the require()
// outside our try/catch (static analysis cannot resolve a computed string).
// includeFiles:"dist/**" in vercel.json ensures these files are in the
// Lambda package so Node.js can resolve them at runtime.
const nodePath = require('path');
const handlerPath = nodePath.join(__dirname, '..', 'dist', 'main.vercel');
console.log('[api/index] loading, node', process.version, 'handler:', handlerPath);
let loadedHandler;
try {
  loadedHandler = require(handlerPath);
  console.log('[api/index] handler loaded OK, type:', typeof loadedHandler);
} catch (err) {
  console.error('[api/index] REQUIRE FAILED:', err && err.stack ? err.stack : String(err));
  loadedHandler = (_req, res) => {
    res.status(500).json({ error: 'Module load failed', detail: String(err && err.message ? err.message : err) });
  };
}
module.exports = loadedHandler;
