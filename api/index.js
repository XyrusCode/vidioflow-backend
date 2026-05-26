// Re-exports the compiled NestJS serverless handler from dist/.
// Wrapped in try/catch so require() failures surface as JSON 500s
// instead of the opaque FUNCTION_INVOCATION_FAILED HTML page.
console.log('[api/index] loading, node', process.version, 'cwd:', process.cwd());
try {
  module.exports = require('../dist/main.vercel');
  console.log('[api/index] handler loaded OK, type:', typeof module.exports);
} catch (err) {
  console.error('[api/index] REQUIRE FAILED:', err && err.stack ? err.stack : String(err));
  module.exports = (_req, res) => {
    res.status(500).json({ error: 'Module load failed', detail: String(err && err.message ? err.message : err) });
  };
}
