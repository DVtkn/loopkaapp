import { desc, eq } from "drizzle-orm";
import { db, isSqlConfigured } from "../../db/client.ts";
import { aiInsights, coupleReports, userPsychProfiles, couples } from "../../db/schema.ts";
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

export async function getCoupleReport(coupleId: string) {
  if (!isSqlConfigured() || !db) {
    return null;
  }

  const [report] = await db
    .select()
    .from(coupleReports)
    .where(eq(coupleReports.coupleId, coupleId))
    .limit(1);

  return report || null;
}

export async function getUserPsychProfiles(coupleId: string) {
  if (!isSqlConfigured() || !db) {
    return [];
  }

  const profiles = await db
    .select()
    .from(userPsychProfiles)
    .where(eq(userPsychProfiles.coupleId, coupleId));

  return profiles;
}
