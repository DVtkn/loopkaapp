import { PsychProfile24Scales, PsychProfileVectorResult } from './psychometrics.calc.ts';

export interface RadarSphereMetrics {
  trust: number;          // Доверие и безопасность (S1..S4)
  closeness: number;      // Эмоциональная близость (S5..S8)
  communication: number;  // Конфликтная динамика и диалог (S9..S12)
  values: number;         // Ценности и горизонт (S13..S16)
  intimacy: number;       // Интимность и страсть (S17..S20)
  lifestyle: number;      // Быт и жизнестойкость (S21..S24)
}

export interface SynergyItem {
  sphere: string;
  title: string;
  description: string;
  score: number;
  statusLabel: string;
}

export interface GrowthZoneItem {
  sphere: string;
  title: string;
  description: string;
  gap: number;
  statusLabel: string;
  recommendation: string;
}

export interface CoupleMatrixReportResult {
  radar: RadarSphereMetrics;
  overallScore: number;
  archetype: {
    title: string;
    description: string;
    leadSpheres: string[];
  };
  synergyPoints: SynergyItem[];
  growthZones: GrowthZoneItem[];
  destructivePatternsDetected: string[];
}

export function getStatusLabelByScore(score: number): string {
  if (score >= 75) return 'Синхронный резонанс';
  if (score >= 50) return 'Зона синергии';
  return 'Точка рассинхрона';
}

export function calculateCoupleMatrix(
  p1Scales: PsychProfile24Scales,
  p2Scales: PsychProfile24Scales
): CoupleMatrixReportResult {
  const clamp = (v: number) => Math.round(Math.min(100, Math.max(10, v)) * 10) / 10;

  // 1. SPHERE 1: Доверие и безопасность (S1..S4)
  // Synergy + Vulnerability safety
  const avgS4 = (p1Scales.s4 + p2Scales.s4) / 2;
  const avgSuspicionSafety = (200 - p1Scales.s3 - p2Scales.s3) / 2;
  const deltaAttachment = (Math.abs(p1Scales.s1 - p2Scales.s1) + Math.abs(p1Scales.s2 - p2Scales.s2)) / 2;
  const trustScore = clamp(avgS4 * 0.45 + avgSuspicionSafety * 0.35 + (100 - deltaAttachment) * 0.2);

  // 2. SPHERE 2: Эмоциональная близость (S5..S8)
  // Channel overlap & complementary resonance
  const avgChannels = (
    p1Scales.s5 + p2Scales.s5 +
    p1Scales.s6 + p2Scales.s6 +
    p1Scales.s7 + p2Scales.s7 +
    p1Scales.s8 + p2Scales.s8
  ) / 8;
  const touchMatch = 100 - Math.abs(p1Scales.s8 - p2Scales.s8);
  const timeMatch = 100 - Math.abs(p1Scales.s6 - p2Scales.s6);
  const closenessScore = clamp(avgChannels * 0.6 + touchMatch * 0.2 + timeMatch * 0.2);

  // 3. SPHERE 3: Конфликтная динамика & Диалог (S9..S12)
  const avgSoothing = (p1Scales.s12 + p2Scales.s12) / 2;
  const avgLowCriticism = (200 - p1Scales.s11 - p2Scales.s11) / 2;
  let conflictBase = avgSoothing * 0.55 + avgLowCriticism * 0.45;

  const destructivePatterns: string[] = [];
  // Pursuit vs Withdrawal penalty rule:
  const isP1PursuitP2Withdraw = p1Scales.s9 >= 65 && p2Scales.s10 >= 65;
  const isP2PursuitP1Withdraw = p2Scales.s9 >= 65 && p1Scales.s10 >= 65;
  if (isP1PursuitP2Withdraw || isP2PursuitP1Withdraw) {
    conflictBase -= 20;
    destructivePatterns.push('Паттерн «Преследователь — Дистанцирующийся» (Pursuit-Withdrawal loop)');
  }
  const communicationScore = clamp(conflictBase);

  // 4. SPHERE 4: Ценности и горизонт (S13..S16)
  // Congruence delta rule
  const deltaAutonomy = Math.abs(p1Scales.s13 - p2Scales.s13);
  const deltaAmbitions = Math.abs(p1Scales.s14 - p2Scales.s14);
  const deltaKids = Math.abs(p1Scales.s15 - p2Scales.s15);
  const deltaTraditions = Math.abs(p1Scales.s16 - p2Scales.s16);
  const avgFutureCommitment = (p1Scales.s15 + p2Scales.s15) / 2;
  const valuesPenalty = deltaKids * 0.35 + deltaAmbitions * 0.25 + deltaAutonomy * 0.25 + deltaTraditions * 0.15;
  const valuesScore = clamp(avgFutureCommitment * 0.4 + (100 - valuesPenalty) * 0.6);

  // 5. SPHERE 5: Интимность и страсть (S17..S20)
  const avgDesireTrigger = (p1Scales.s17 + p2Scales.s17) / 2;
  const avgInitiative = (p1Scales.s19 + p2Scales.s19) / 2;
  const avgOpenness = (p1Scales.s20 + p2Scales.s20) / 2;
  const deltaSpontaneity = Math.abs(p1Scales.s18 - p2Scales.s18);
  const intimacyScore = clamp(avgDesireTrigger * 0.35 + avgInitiative * 0.25 + avgOpenness * 0.2 + (100 - deltaSpontaneity) * 0.2);

  // 6. SPHERE 6: Быт и жизнестойкость (S21..S24)
  const deltaOrder = Math.abs(p1Scales.s21 - p2Scales.s21);
  const deltaBudget = Math.abs(p1Scales.s22 - p2Scales.s22);
  const avgCrisisHardiness = (p1Scales.s24 + p2Scales.s24) / 2;
  const lifestyleScore = clamp(avgCrisisHardiness * 0.4 + (100 - deltaOrder * 0.4 - deltaBudget * 0.4) * 0.6);

  const radar: RadarSphereMetrics = {
    trust: trustScore,
    closeness: closenessScore,
    communication: communicationScore,
    values: valuesScore,
    intimacy: intimacyScore,
    lifestyle: lifestyleScore,
  };

  const overallScore = Math.round(
    (trustScore + closenessScore + communicationScore + valuesScore + intimacyScore + lifestyleScore) / 6
  );

  // Determine top 2 lead spheres
  const spheresList = [
    { key: 'trust', score: trustScore, nameRu: 'Доверие' },
    { key: 'closeness', score: closenessScore, nameRu: 'Близость' },
    { key: 'communication', score: communicationScore, nameRu: 'Общение' },
    { key: 'values', score: valuesScore, nameRu: 'Ценности' },
    { key: 'intimacy', score: intimacyScore, nameRu: 'Интимность' },
    { key: 'lifestyle', score: lifestyleScore, nameRu: 'Быт' },
  ].sort((a, b) => b.score - a.score);

  const leadKeys = [spheresList[0].key, spheresList[1].key];
  const leadPair = `${leadKeys[0]}_${leadKeys[1]}`;
  const reverseLeadPair = `${leadKeys[1]}_${leadKeys[0]}`;

  // Deterministic Archetype Combinatorial Matrix (NO "якорь", only positive empowering metaphors)
  const ARCHETYPE_MAP: Record<string, { title: string; desc: string }> = {
    'trust_values': {
      title: '«Надёжная гавань & Общий горизонт»',
      desc: 'Ваш союз базируется на глубоком взаимном доверии, эмоциональной защищённости и созвучии главных жизненных целей.',
    },
    'closeness_communication': {
      title: '«Глубокий контакт & Бережный тыл»',
      desc: 'Высокая эмоциональная чуткость, умение вовремя слышать друг друга и решать любые разногласия через искренний диалог.',
    },
    'intimacy_closeness': {
      title: '«Живое пламя & Эмоциональный резонанс»',
      desc: 'Гармоничное сочетание романтического влечения, нежности и способности открыто делиться сокровенными желаниями.',
    },
    'values_lifestyle': {
      title: '«Тандем архитекторов & Прочный фундамент»',
      desc: 'Слаженная команда единомышленников: единые финансовые ориентиры, согласованный бытовой уклад и уверенность в будущем.',
    },
    'trust_communication': {
      title: '«Открытая гавань & Осознанный диалог»',
      desc: 'Спокойная психологическая безопасность и мастерство экологичной коммуникации даже в стрессовых ситуациях.',
    },
    'lifestyle_trust': {
      title: '«Уверенный тыл & Взаимная опора»',
      desc: 'Высокая жизнестойкость, предсказуемость договорённостей и взаимная забота в повседневных делах.',
    },
    'trust_closeness': {
      title: '«Тёплая гавань & Безусловное принятие»',
      desc: 'Пространство нежности, где каждый может быть уязвимым и чувствовать себя по-настоящему нужным и любимым.',
    },
    'communication_values': {
      title: '«Стратегический союз & Осознанный горизонт»',
      desc: 'Ясное понимание совместного будущего, умение договариваться по ключевым развилкам без скрытого напряжения.',
    },
    'intimacy_trust': {
      title: '«Искрящаяся глубина & Доверительный контакт»',
      desc: 'Глубокое доверие к телу и чувствам партнёра, делающее интимную близость источником взаимного ресурса.',
    },
    'lifestyle_closeness': {
      title: '«Уютный очаг & Тёплое созвучие»',
      desc: 'Радость совместного быта, бережные ритуалы заботы и комфортное распределение домашнего времени.',
    },
  };

  const matchedArchetype = ARCHETYPE_MAP[leadPair] || ARCHETYPE_MAP[reverseLeadPair] || {
    title: '«Гармоничный тандем & Совместный рост»',
    desc: 'Отношения развиваются на сбалансированной основе эмоционального тепла, уважения к границам и общих целей.',
  };

  // Build Synergy Points
  const synergyPoints: SynergyItem[] = [];
  if (trustScore >= 75) {
    synergyPoints.push({
      sphere: 'trust',
      title: 'Высокая эмоциональная безопасность',
      description: 'Уверенность в надёжности партнёра и готовность быть открытыми без страха осуждения.',
      score: trustScore,
      statusLabel: 'Синхронный резонанс',
    });
  } else if (trustScore >= 50) {
    synergyPoints.push({
      sphere: 'trust',
      title: 'Базовое доверие и опора',
      description: 'Хороший фундамент безопасности с потенциалом для ещё большей глубины контакта.',
      score: trustScore,
      statusLabel: 'Зона синергии',
    });
  }

  if (closenessScore >= 75) {
    synergyPoints.push({
      sphere: 'closeness',
      title: 'Эмоциональный резонанс и тепло',
      description: 'Совпадение главных каналов заботы и взаимная чуткость к настроению друг друга.',
      score: closenessScore,
      statusLabel: 'Синхронный резонанс',
    });
  }

  if (valuesScore >= 75) {
    synergyPoints.push({
      sphere: 'values',
      title: 'Единство жизненных приоритетов',
      description: 'Согласованный взгляд на развитие союза, семейные ценности и долгосрочные цели.',
      score: valuesScore,
      statusLabel: 'Синхронный резонанс',
    });
  }

  if (lifestyleScore >= 70) {
    synergyPoints.push({
      sphere: 'lifestyle',
      title: 'Слаженность в быту и кризисах',
      description: 'Умение быстро находить консенсус в практических вопросах и поддерживать порядок.',
      score: lifestyleScore,
      statusLabel: 'Синхронный резонанс',
    });
  }

  // Build Growth Zones
  const growthZones: GrowthZoneItem[] = [];

  if (deltaAutonomy >= 25) {
    growthZones.push({
      sphere: 'values',
      title: 'Разный темп автономии и совместности',
      description: 'Один из вас нуждается в чуть большем личном пространстве для восстановления, тогда как второй ценит более плотный контакт.',
      gap: Math.round(deltaAutonomy),
      statusLabel: deltaAutonomy >= 40 ? 'Точка рассинхрона' : 'Зона синергии и роста',
      recommendation: 'Заранее планируйте «часы автономии» без чувства вины и обид.',
    });
  }

  if (destructivePatterns.length > 0) {
    growthZones.push({
      sphere: 'communication',
      title: 'Эскалация: давление против ухода в паузу',
      description: 'При стрессе один партнёр стремится немедленно всё выяснить, а второй уходит в глухую паузу, усиливая тревогу первого.',
      gap: Math.round(Math.abs(p1Scales.s9 - p2Scales.s10)),
      statusLabel: 'Точка рассинхрона',
      recommendation: 'Используйте правило Готтмана: чёткая договорённость о 20-минутном тайм-ауте с точным обещанием вернуться к диалогу.',
    });
  }

  if (deltaBudget >= 25) {
    growthZones.push({
      sphere: 'lifestyle',
      title: 'Разница в финансовом планировании',
      description: 'Небольшие различия в балансе между сиюминутными радостями и долгосрочной подушкой безопасности.',
      gap: Math.round(deltaBudget),
      statusLabel: deltaBudget >= 40 ? 'Точка рассинхрона' : 'Зона синергии и роста',
      recommendation: 'Выделите неприкосновенный личный бюджет для каждого партнёра без отчёта по тратам.',
    });
  }

  if (growthZones.length === 0) {
    growthZones.push({
      sphere: 'communication',
      title: 'Спонтанные ритуалы обновления',
      description: 'Для поддержания яркости чувств полезно регулярно вводить новые совместные активности и впечатления.',
      gap: 15,
      statusLabel: 'Зона синергии',
      recommendation: 'Попробуйте регулярную практику «Свидание-сюрприз» раз в две недели.',
    });
  }

  return {
    radar,
    overallScore,
    archetype: {
      title: matchedArchetype.title,
      description: matchedArchetype.desc,
      leadSpheres: leadKeys,
    },
    synergyPoints,
    growthZones,
    destructivePatternsDetected: destructivePatterns,
  };
}
