import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.MY_DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '';

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: process.env.SQL_HOST ? {
    host: process.env.SQL_HOST,
    user: process.env.SQL_ADMIN_USER || 'postgres',
    password: process.env.SQL_ADMIN_PASSWORD || '',
    database: process.env.SQL_DB_NAME || 'neondb',
    ssl: false,
  } : {
    url: dbUrl,
  },
  verbose: true,
});
