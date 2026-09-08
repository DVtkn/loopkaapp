import { db, isSqlConfigured } from './src/db/index.ts';
import { users, coupleData, pairRequests, chatMessages } from './src/db/schema.ts';
import { sql } from 'drizzle-orm';

async function checkData() {
  console.log('SQL Configured:', isSqlConfigured());
  if (!db) {
     console.error('DB instance is null');
     process.exit(1);
  }
  try {
    const usersCount = await db.select({ count: sql`count(*)` }).from(users);
    const coupleDataCount = await db.select({ count: sql`count(*)` }).from(coupleData);
    const pairReqCount = await db.select({ count: sql`count(*)` }).from(pairRequests);
    const chatCount = await db.select({ count: sql`count(*)` }).from(chatMessages);

    console.log('--- Database Stats (Neon) ---');
    console.log(`Users: ${usersCount[0].count}`);
    console.log(`Couple Data: ${coupleDataCount[0].count}`);
    console.log(`Pair Requests: ${pairReqCount[0].count}`);
    console.log(`Chat Messages: ${chatCount[0].count}`);
    console.log('SUCCESS: All tables are accessible!');
  } catch (err) {
    console.error('Error querying data:', err);
  }
  process.exit(0);
}

checkData();
