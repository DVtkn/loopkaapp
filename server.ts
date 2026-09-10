import app, { startServer, logger, callGroqChat } from "./src/server/index.ts";

export { logger, callGroqChat };
export default app;

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    logger.error("Fatal startup error in server.ts", err);
    process.exit(1);
  });
}

