const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'typeof __dirname !== "undefined"\n    ? __dirname\n    : path.dirname(fileURLToPath(import.meta.url));',
  'process.cwd();'
);

code = code.replace(
  'typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));',
  'process.cwd();'
);

fs.writeFileSync('server.ts', code);
