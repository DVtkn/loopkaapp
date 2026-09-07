const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const xssMiddleware = `
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function sanitizePayload(obj) {
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizePayload(item));
  }
  if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizePayload(obj[key]);
      }
    }
    return sanitized;
  }
  return obj;
}

app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizePayload(req.body);
  }
  next();
});
`;

code = code.replace('app.use(express.urlencoded({ extended: true, limit: "100kb" }));', 'app.use(express.urlencoded({ extended: true, limit: "100kb" }));\n' + xssMiddleware);

fs.writeFileSync('server.ts', code);
