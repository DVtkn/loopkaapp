export interface RawUserAnswer {
  questionId: string;
  selectedValue: string | number;
  weight?: string | number;
  reactionTimeMs?: number | null;
  toggleCount?: number | null;
  targetType?: string | null;
  rawPayload?: any;
}

export interface PsychProfileVectorResult {
  eSafety: number;
  aAutonomy: number;
  cCloseness: number;
  rRepair: number;
  vFuture: number;
  consistencyScore: number;
}

export function calculateIndividualVector(userAnswers: RawUserAnswer[]): PsychProfileVectorResult {
  let eSafety = 50;
  let aAutonomy = 50;
  let cCloseness = 50;
  let rRepair = 50;
  let vFuture = 50;

  let totalToggles = 0;
  let rapidClicks = 0;
  let totalValidAnswers = 0;

  for (const ans of userAnswers) {
    if (!ans) continue;
    totalValidAnswers++;

    const val = Number(ans.selectedValue) || 0;
    let baseWeight = Number(ans.weight) || 1.0;

    // Latency & toggle weighting
    const reactionMs = ans.reactionTimeMs != null ? Number(ans.reactionTimeMs) : null;
    const toggles = ans.toggleCount != null ? Number(ans.toggleCount) : 0;
    totalToggles += toggles;

    if (reactionMs !== null && reactionMs < 800) {
      rapidClicks++;
      baseWeight *= 0.85; // Low confidence for hyper-fast click
    }

    if (toggles >= 3) {
      baseWeight *= 0.9; // Uncertainty / vacillation
    }

    // Process trade_off payload if present
    if (ans.rawPayload && typeof ans.rawPayload === 'object') {
      const payload = ans.rawPayload;
      if (payload.c_closeness != null) cCloseness += (Number(payload.c_closeness) - 2.5) * 4 * baseWeight;
      if (payload.e_safety != null) eSafety += (Number(payload.e_safety) - 2.5) * 4 * baseWeight;
      if (payload.a_autonomy != null) aAutonomy += (Number(payload.a_autonomy) - 2.5) * 4 * baseWeight;
      if (payload.r_repair != null) rRepair += (Number(payload.r_repair) - 2.5) * 4 * baseWeight;
      if (payload.v_future != null) vFuture += (Number(payload.v_future) - 2.5) * 4 * baseWeight;
      
      // Also check by raw item keys
      if (payload.words != null) cCloseness += (Number(payload.words) - 2.5) * 3 * baseWeight;
      if (payload.time != null) cCloseness += (Number(payload.time) - 2.5) * 3 * baseWeight;
      if (payload.acts != null) eSafety += (Number(payload.acts) - 2.5) * 3 * baseWeight;
      if (payload.touch != null) cCloseness += (Number(payload.touch) - 2.5) * 3 * baseWeight;
      if (payload.intimacy != null) cCloseness += (Number(payload.intimacy) - 3.3) * 3.5 * baseWeight;
      if (payload.passion != null) cCloseness += (Number(payload.passion) - 3.3) * 3.5 * baseWeight;
      if (payload.commitment != null) vFuture += (Number(payload.commitment) - 3.3) * 4 * baseWeight;
      if (payload.safety != null) eSafety += (Number(payload.safety) - 2.5) * 3 * baseWeight;
      if (payload.autonomy != null) aAutonomy += (Number(payload.autonomy) - 2.5) * 4 * baseWeight;
      if (payload.future != null) vFuture += (Number(payload.future) - 2.5) * 4 * baseWeight;
    }

    // Process standard question contributions
    const qId = ans.questionId || '';
    if (qId.startsWith('q-s1')) {
      // Attachment ECR
      eSafety += (val - 3) * 5 * baseWeight;
      if (qId === 'q-s1-2' || qId === 'q-s1-4') cCloseness += (val - 3) * 4 * baseWeight;
      if (qId === 'q-s1-3' || qId === 'q-s1-5') aAutonomy += (val - 3) * 4 * baseWeight;
    } else if (qId.startsWith('q-s2')) {
      // Love Languages
      cCloseness += (val - 3) * 4 * baseWeight;
      if (qId === 'q-s2-5') eSafety += (val - 3) * 4 * baseWeight;
    } else if (qId.startsWith('q-s3')) {
      // Gottman
      rRepair += (val - 3) * 6 * baseWeight;
      eSafety += (val - 3) * 3 * baseWeight;
    } else if (qId.startsWith('q-c1')) {
      // Ideal Day
      cCloseness += (val - 3) * 3 * baseWeight;
      aAutonomy += (val - 3) * 3 * baseWeight;
      vFuture += (val - 3) * 4 * baseWeight;
    } else if (qId.startsWith('q-s4')) {
      // Sternberg
      if (qId === 'q-s4-1') cCloseness += (val - 3) * 6 * baseWeight;
      if (qId === 'q-s4-2') cCloseness += (val - 3) * 5 * baseWeight;
      if (qId === 'q-s4-3') vFuture += (val - 3) * 6 * baseWeight;
    } else if (qId.startsWith('q-d1')) {
      // Family Scripts
      vFuture += (val - 3) * 5 * baseWeight;
      rRepair += (val - 3) * 4 * baseWeight;
    } else if (qId.startsWith('q-d2')) {
      // TKI Conflicts
      rRepair += (val - 3) * 5 * baseWeight;
      aAutonomy += (val - 3) * 3 * baseWeight;
    }
  }

  // Calculate consistency score [0-100]
  let consistency = 95;
  if (totalValidAnswers > 0) {
    const rapidRate = rapidClicks / totalValidAnswers;
    const toggleRate = totalToggles / totalValidAnswers;
    consistency -= rapidRate * 30;
    consistency -= Math.min(25, toggleRate * 10);
  }
  consistency = Math.max(40, Math.min(100, Math.round(consistency)));

  return {
    eSafety: Math.round(Math.min(100, Math.max(10, eSafety)) * 10) / 10,
    aAutonomy: Math.round(Math.min(100, Math.max(10, aAutonomy)) * 10) / 10,
    cCloseness: Math.round(Math.min(100, Math.max(10, cCloseness)) * 10) / 10,
    rRepair: Math.round(Math.min(100, Math.max(10, rRepair)) * 10) / 10,
    vFuture: Math.round(Math.min(100, Math.max(10, vFuture)) * 10) / 10,
    consistencyScore: consistency
  };
}
