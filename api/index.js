// Minimal diagnostic handler: tests whether the Lambda env itself runs.
// If this returns 200, we know the runtime works and the bug is in NestJS init.
// If this ALSO fails with FUNCTION_INVOCATION_FAILED there's an env-level issue.
module.exports = (_req, res) => {
  res.status(200).json({
    ok: true,
    node: process.version,
    cwd: process.cwd(),
    dirname: __dirname,
  });
};
