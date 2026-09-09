import { desc, eq } from "drizzle-orm";
import { db, isSqlConfigured } from "../../db/client.ts";
import { aiInsights } from "../../db/schema.ts";
import { recordDailyMetrics, getTrends } from "../../analytics.ts";
import { generateWeeklyInsight } from "../../insights.ts";

export { recordDailyMetrics, getTrends, generateWeeklyInsight };

export async function fetchAiInsights(coupleId: string) {
  if (!isSqlConfigured() || !db) {
    return [];
  }

  const insights = await db
    .select()
    .from(aiInsights)
    .where(eq(aiInsights.coupleId, coupleId))
    .orderBy(desc(aiInsights.createdAt))
    .limit(10);

  return insights;
}
