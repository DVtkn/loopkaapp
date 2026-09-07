const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// For each endpoint, we need to enforce RBAC. This is a bit tricky to do with regex.
// Since we have req.userLogin set by requireAuth, let's just make a global check in requireAuth
// that if req.body.login exists, it MUST match req.userLogin. And for params.login, it MUST match.
