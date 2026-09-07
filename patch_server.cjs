const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const endpointsToAuth = [
  'app.post("/api/auth/update-profile", ',
  'app.post("/api/auth/change-password", ',
  'app.post("/api/auth/reset-password", ',
  'app.post("/api/pair/request", ',
  'app.post("/api/pair/accept", ',
  'app.post("/api/pair/reject", ',
  'app.post("/api/pair/disconnect", ',
  'app.post("/api/chat/messages", ',
  'app.post("/api/couple/sync", ',
  'app.post("/api/push/subscribe", ',
  'app.post("/api/push/send-test", ',
  'app.post("/api/ai/chat", ',
  'app.post("/api/ai/generate-report", ',
  'app.post("/api/ai/date-idea", '
];

endpointsToAuth.forEach(ep => {
  code = code.replace(ep, ep.replace(', ', ', requireAuth, '));
});

// Also fix GET methods if needed:
const getEndpoints = [
  'app.get("/api/auth/user/:login", ',
  'app.get("/api/pair/status/:login", ',
  'app.get("/api/chat/messages/:coupleId", ',
  'app.get("/api/ai/messages/:login", '
];

getEndpoints.forEach(ep => {
  code = code.replace(ep, ep.replace(', ', ', requireAuth, '));
});

fs.writeFileSync('server.ts', code);
