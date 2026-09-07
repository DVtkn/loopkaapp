const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace('function sanitizeString(str) {', 'function sanitizeString(str: any): any {');
code = code.replace('function sanitizePayload(obj) {', 'function sanitizePayload(obj: any): any {');
code = code.replace('const sanitized = {};', 'const sanitized: any = {};');

fs.writeFileSync('server.ts', code);
