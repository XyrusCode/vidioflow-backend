// Step-by-step module loader to find which require() fails on Node.js 24 Linux.
// Returns JSON so every step is visible even if something crashes mid-way.
const steps = [];
function tryLoad(label, fn) {
  try { const r = fn(); steps.push({ ok: true, step: label, type: typeof r }); return r; }
  catch (e) { steps.push({ ok: false, step: label, error: e && e.message ? e.message : String(e) }); return null; }
}

// Test each package that could fail on Linux/Node24
tryLoad('require:path', () => require('path'));
tryLoad('require:express', () => require('express'));
tryLoad('require:@nestjs/core', () => require('@nestjs/core'));
tryLoad('require:@nestjs/common', () => require('@nestjs/common'));
tryLoad('require:@nestjs/config', () => require('@nestjs/config'));
tryLoad('require:@nestjs/jwt', () => require('@nestjs/jwt'));
tryLoad('require:@nestjs/passport', () => require('@nestjs/passport'));
tryLoad('require:@nestjs/typeorm', () => require('@nestjs/typeorm'));
tryLoad('require:@nestjs/platform-express', () => require('@nestjs/platform-express'));
tryLoad('require:typeorm', () => require('typeorm'));
tryLoad('require:bcryptjs', () => require('bcryptjs'));
tryLoad('require:passport', () => require('passport'));
tryLoad('require:passport-jwt', () => require('passport-jwt'));
tryLoad('require:msedge-tts', () => require('msedge-tts'));
tryLoad('require:pg', () => require('pg'));
const p = require('path');
tryLoad('require:dist/main.vercel', () => require(p.join(__dirname, '..', 'dist', 'main.vercel')));

module.exports = (_req, res) => {
  const failed = steps.find(s => !s.ok);
  res.status(failed ? 500 : 200).json({ steps });
};
