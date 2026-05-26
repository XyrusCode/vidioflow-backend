// Wraps the NestJS handler and catches both sync and async invocation errors.
// Module loading is confirmed fine on Node24 Linux; this catches handler crashes.
const nodePath = require('path');
const nestHandler = require(nodePath.join(__dirname, '..', 'dist', 'main.vercel'));

// Trap any uncaught process-level errors so they show up as JSON
process.on('uncaughtException', (err) => {
  console.error('[api] uncaughtException:', err && err.stack ? err.stack : String(err));
});
process.on('unhandledRejection', (reason) => {
  console.error('[api] unhandledRejection:', reason instanceof Error ? reason.stack : String(reason));
});

module.exports = async (req, res) => {
  try {
    console.log('[api] handler invoked, method:', req.method, 'url:', req.url);
    await nestHandler(req, res);
    console.log('[api] handler completed');
  } catch (err) {
    console.error('[api] handler threw:', err && err.stack ? err.stack : String(err));
    if (!res.headersSent) {
      res.status(500).json({ error: 'Handler failed', detail: err && err.message ? err.message : String(err) });
    }
  }
};
