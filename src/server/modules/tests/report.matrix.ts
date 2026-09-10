export interface PsychVector {
  eSafety: number;
  aAutonomy: number;
  cCloseness: number;
  rRepair: number;
  vFuture: number;
  consistencyScore?: number;
}

export interface CoupleRadarResult {
  radar: {
    trust: number;
    closeness: number;
    communication: number;
    intimacy: number;
    values: number;
  };
  archetype: {
    title: string;
    description: string;
    leadSpheres: string[];
  };
  blindSpots: {
    discrepancies: Array<{
      sphere: string;
      title: string;
      description: string;
      gap: number;
    }>;
    synergies: Array<{
      sphere: string;
      title: string;
      description: string;
    }>;
  };
}

import { db, isSqlConfigured } from "../../db/client.ts";
import { userPsychProfiles } from "../../db/schema.ts";
import { eq } from "drizzle-orm";

export interface CoupleRadarInput {
  coupleId: string;
  user1Id: string;
  user2Id: string;
}

export async function calculateCoupleRadar(input: CoupleRadarInput): Promise<CoupleRadarResult> {
  if (!isSqlConfigured() || !db) {
    throw new Error("Database not configured");
  }
  
  // Fetch psych profiles for both users
  const [profile1, profile2] = await Promise.all([
    db.select().from(userPsychProfiles).where(eq(userPsychProfiles.userId, input.user1Id)).limit(1),
    db.select().from(userPsychProfiles).where(eq(userPsychProfiles.userId, input.user2Id)).limit(1),
  ]);

  const v1 = profile1[0]?.traitScores as PsychVector | undefined;
  const v2 = profile2[0]?.traitScores as PsychVector | undefined;

  if (!v1 || !v2) {
    throw new Error("Psych profiles not found for one or both users");
  }

  // Ensure all required fields exist with defaults
  const vec1: PsychVector = {
    eSafety: v1.eSafety ?? 50,
    aAutonomy: v1.aAutonomy ?? 50,
    cCloseness: v1.cCloseness ?? 50,
    rRepair: v1.rRepair ?? 50,
    vFuture: v1.vFuture ?? 50,
    consistencyScore: v1.consistencyScore ?? 95,
  };
  const vec2: PsychVector = {
    eSafety: v2.eSafety ?? 50,
    aAutonomy: v2.aAutonomy ?? 50,
    cCloseness: v2.cCloseness ?? 50,
    rRepair: v2.rRepair ?? 50,
    vFuture: v2.vFuture ?? 50,
    consistencyScore: v2.consistencyScore ?? 95,
  };

  return calculateCoupleRadarMatrix(vec1, vec2);
}

export function calculateCoupleRadarMatrix(v1: PsychVector, v2: PsychVector): CoupleRadarResult {
  // 1. Calculate the 5 Radar dimensions
  // Trust (Доверие): combines emotional safety and repair capability
  const avgSafety = (v1.eSafety + v2.eSafety) / 2;
  const avgRepair = (v1.rRepair + v2.rRepair) / 2;
  const trust = Math.min(100, Math.max(10, Math.round((avgSafety * 0.6 + avgRepair * 0.4) * 10) / 10));

  // Closeness (Близость): emotional warmth and shared presence
  const avgCloseness = (v1.cCloseness + v2.cCloseness) / 2;
  const closeness = Math.min(100, Math.max(10, Math.round(avgCloseness * 10) / 10));

  // Communication (Общение): repair capacity modulated by autonomy balance
  const deltaAutonomy = Math.abs(v1.aAutonomy - v2.aAutonomy);
  const commBase = (v1.rRepair + v2.rRepair) / 2;
  const commPenalty = deltaAutonomy > 20 ? (deltaAutonomy - 20) * 0.3 : 0;
  const communication = Math.min(100, Math.max(10, Math.round((commBase - commPenalty) * 10) / 10));

  // Intimacy (Интимность): closeness and healthy autonomy
  const avgAutonomy = (v1.aAutonomy + v2.aAutonomy) / 2;
  const intimacy = Math.min(100, Math.max(10, Math.round((avgCloseness * 0.65 + avgAutonomy * 0.35) * 10) / 10));

  // Values (Ценности): non-linear penalty for divergence
  const avgFuture = (v1.vFuture + v2.vFuture) / 2;
  const deltaValues = Math.abs(v1.vFuture - v2.vFuture);
  const valuesPenalty = deltaValues * 0.5 + Math.pow(deltaValues, 2) * 0.25 / 100;
  const values = Math.min(100, Math.max(10, Math.round((avgFuture - valuesPenalty) * 10) / 10));

  const radar = { trust, closeness, communication, intimacy, values };

  // 2. Determine lead spheres & Archetype
  const sphereScores: Array<{ key: string; score: number }> = [
    { key: 'trust', score: trust },
    { key: 'closeness', score: closeness },
    { key: 'communication', score: communication },
    { key: 'intimacy', score: intimacy },
    { key: 'values', score: values },
  ].sort((a, b) => b.score - a.score);

  const leadKeys = [sphereScores[0].key, sphereScores[1].key];

  let archetypeTitle = '«Надёжная гавань & Вдохновляющий горизонт»';
  let archetypeDescription = 'Ваша пара опирается на взаимное доверие и глубокое понимание ценностей друг друга.';

  if (leadKeys.includes('trust') && leadKeys.includes('closeness')) {
    archetypeTitle = '«Тёплая гавань & Безусловное принятие»';
    archetypeDescription = 'В отношениях преобладают безопасность, нежность и готовность быть уязвимыми без страха отвержения.';
  } else if (leadKeys.includes('communication') && leadKeys.includes('trust')) {
    archetypeTitle = '«Осознанный тандем & Конструктивный диалог»';
    archetypeDescription = 'Вы умеете слышать потребности партнёра, вовремя устранять напряжение и бережно договариваться.';
  } else if (leadKeys.includes('closeness') && leadKeys.includes('intimacy')) {
    archetypeTitle = '«Искрящаяся глубина & Живая страсть»';
    archetypeDescription = 'Между вами сильное эмоциональное и романтическое притяжение, поддерживающее яркий интерес друг к другу.';
  } else if (leadKeys.includes('values') && leadKeys.includes('communication')) {
    archetypeTitle = '«Стратегический союз & Общий горизонт»';
    archetypeDescription = 'У вас синхронизированы ключевые жизненные приоритеты и выстроена прозрачная система договорённостей.';
  } else if (leadKeys.includes('trust') && leadKeys.includes('values')) {
    archetypeTitle = '«Надёжный фундамент & Верность курсу»';
    archetypeDescription = 'Отношения базируются на взаимной преданности, психологической устойчивости и общих жизненных ориентирах.';
  }

  // 3. Detect Blind Spots & Synergies
  const discrepancies: Array<{ sphere: string; title: string; description: string; gap: number }> = [];
  const synergies: Array<{ sphere: string; title: string; description: string }> = [];

  const checkGap = (gapVal: number, sphere: string, title: string, desc: string) => {
    if (gapVal >= 20) {
      discrepancies.push({ sphere, title, description: desc, gap: Math.round(gapVal) });
    }
  };

  checkGap(
    Math.abs(v1.aAutonomy - v2.aAutonomy),
    'autonomy',
    'Разный темп автономии и слияния',
    'Один партнёр нуждается в большем личном пространстве для перезагрузки, а второй ожидает более плотного совместного времени.'
  );

  checkGap(
    Math.abs(v1.eSafety - v2.eSafety),
    'safety',
    'Чувствительность к эмоциональным паузам',
    'При разногласиях одному партнёру требуется немедленное подтверждение связи, тогда как второму нужно время в тишине.'
  );

  checkGap(
    Math.abs(v1.rRepair - v2.rRepair),
    'repair',
    'Стратегия разрешения разногласий',
    'Разница между логическим анализом фактов и потребностью в эмоциональном утешении в момент конфликта.'
  );

  checkGap(
    Math.abs(v1.vFuture - v2.vFuture),
    'values',
    'Приоритеты распределения ресурсов',
    'Небольшие разночтения в балансе между сиюминутными радостями и долгосрочным стратегическим планированием.'
  );

  if (trust >= 75) {
    synergies.push({
      sphere: 'trust',
      title: 'Высокая эмоциональная безопасность',
      description: 'Вы уверены в надёжности друг друга даже в периоды повышенного внешнего стресса.'
    });
  }
  if (closeness >= 75) {
    synergies.push({
      sphere: 'closeness',
      title: 'Спонтанная нежность и теплота',
      description: 'Умение проявлять заботу через маленькие детали и ежедневные знаки внимания.'
    });
  }

  return {
    radar,
    archetype: {
      title: archetypeTitle,
      description: archetypeDescription,
      leadSpheres: leadKeys
    },
    blindSpots: {
      discrepancies,
      synergies
    }
  };
}
