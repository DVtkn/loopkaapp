import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const DEFAULT_NEON_URL = 'postgresql://neondb_owner:npg_U8YAVhgIb2NJ@ep-winter-moon-b1gv1vb3-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || DEFAULT_NEON_URL;

export default defineConfig({
  schema: "./src/db/schema.ts",
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
