// SAPC IntellySys: Adaptive Mood Telemetry & Fallback Analytics Engine
// Implements Exponential Moving Average (EMA) Time Decay, 3-Tier Fallback Hierarchy,
// and Disengagement Anomaly Detection (non-punitive missingness handling).

export interface MoodCheckinEntry {
  id?: string | number;
  student_id?: number;
  lrn?: string;
  mood_score: number; // 1 (Overwhelmed) to 5 (Energized)
  mood_emoji?: string;
  energy_level?: number; // 1 to 5
  primary_stressor?: string;
  reflection_note?: string;
  created_at: string; // ISO String
}

export interface TelemetryAnalysisResult {
  frequency_tier: "high_frequency" | "low_frequency" | "baseline_fallback";
  tier_label: string;
  total_checkins: number;
  checkins_last_14d: number;
  time_decayed_mood_avg: number; // 1.0 - 5.0
  negative_mood_ratio: number; // % check-ins <= 2
  acute_distress_streak_days: number;
  primary_stressor: string;
  baseline_screener_weight: number; // e.g. 0.60, 0.80, or 1.00
  telemetry_weight: number; // e.g. 0.40, 0.20, or 0.00
  telemetry_penalty_points: number; // -8 to +24 pts
  disengagement_anomaly_detected: boolean;
  disengagement_reason?: string;
  explanation: string;
}

/**
 * Computes the time-decayed exponential weight for a check-in.
 * w(t) = exp(-delta_days / tau) where tau = 10 days half-life parameter.
 */
export function calculateTimeDecayWeight(checkinDateIso: string, halfLifeDays: number = 10): number {
  const now = Date.now();
  const checkinTime = new Date(checkinDateIso).getTime();
  const diffDays = Math.max(0, (now - checkinTime) / (1000 * 60 * 60 * 24));
  return Math.exp(-diffDays / halfLifeDays);
}

/**
 * Evaluates a student's mood check-in stream against the 3-tier fallback hierarchy.
 * @param checkins List of mood entries (sorted newest to oldest)
 * @param daysAbsent Recent academic unexcused absences (for disengagement anomaly cross-reference)
 * @param baselinePsychRisk Base GAD-7/PHQ-9 risk score (0-100)
 */
export function analyzeMoodTelemetry(
  checkins: MoodCheckinEntry[] = [],
  daysAbsent: number = 0,
  _baselinePsychRisk: number = 20
): TelemetryAnalysisResult {
  const now = Date.now();
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

  const recent14d = checkins.filter(c => {
    const t = new Date(c.created_at).getTime();
    return now - t <= fourteenDaysMs;
  });

  const count14d = recent14d.length;

  // Case 1: Zero Responses / Non-Adherent (Graceful Fallback)
  if (count14d === 0) {
    // Check if student HAD a past streak of logging that suddenly stopped
    const hadPastCheckins = checkins.length >= 5;
    const isDisengaged = hadPastCheckins && daysAbsent >= 3;

    return {
      frequency_tier: "baseline_fallback",
      tier_label: "Quarterly Baseline Fallback",
      total_checkins: checkins.length,
      checkins_last_14d: 0,
      time_decayed_mood_avg: 3.5, // neutral
      negative_mood_ratio: 0,
      acute_distress_streak_days: 0,
      primary_stressor: "None / Not Reported",
      baseline_screener_weight: 1.0,
      telemetry_weight: 0.0,
      telemetry_penalty_points: 0,
      disengagement_anomaly_detected: isDisengaged,
      disengagement_reason: isDisengaged 
        ? `Student had ${checkins.length} past check-ins but ceased logging for >14 days with ${daysAbsent} unexcused absences.`
        : undefined,
      explanation: "No recent daily mood logs. Evaluated 100% on formal quarterly GAD-7 / PHQ-9 screeners with zero non-response penalty."
    };
  }

  // Calculate Weighted Time-Decayed Mood Average
  let weightedSum = 0;
  let totalWeights = 0;
  let negativeCount = 0;
  let acuteStreak = 0;
  let inStreak = true;

  const stressorCounts: Record<string, number> = {};

  for (let i = 0; i < recent14d.length; i++) {
    const c = recent14d[i];
    const w = calculateTimeDecayWeight(c.created_at);
    weightedSum += c.mood_score * w;
    totalWeights += w;

    if (c.mood_score <= 2) {
      negativeCount++;
    }

    // Measure active distress streak from latest entries
    if (inStreak) {
      if (c.mood_score <= 2) {
        acuteStreak++;
      } else {
        inStreak = false;
      }
    }

    if (c.primary_stressor && c.primary_stressor !== "None / Peaceful") {
      stressorCounts[c.primary_stressor] = (stressorCounts[c.primary_stressor] || 0) + 1;
    }
  }

  const timeDecayedAvg = totalWeights > 0 ? parseFloat((weightedSum / totalWeights).toFixed(2)) : 3.0;
  const negativeRatio = parseFloat((negativeCount / recent14d.length).toFixed(2));

  // Determine Primary Stressor
  let topStressor = "None / Peaceful";
  let maxCount = 0;
  for (const [st, cnt] of Object.entries(stressorCounts)) {
    if (cnt > maxCount) {
      maxCount = cnt;
      topStressor = st;
    }
  }

  // Calculate Telemetry Penalty / Relief Points
  let telemetryPenalty = 0;
  if (timeDecayedAvg >= 4.2) {
    telemetryPenalty -= 8; // Protective buffer
  } else if (timeDecayedAvg < 2.0) {
    telemetryPenalty += 24; // Chronic severe distress
  } else if (timeDecayedAvg < 3.0) {
    telemetryPenalty += 12; // Moderate strain
  }

  if (negativeRatio > 0.6) {
    telemetryPenalty += 10;
  }

  if (acuteStreak >= 3) {
    telemetryPenalty += 15; // Acute distress alert
  }

  // Determine Hierarchy Tier
  const isHighFreq = count14d >= 4; // >= 2 check-ins per week in 14 days
  const baselineWeight = isHighFreq ? 0.60 : 0.80;
  const telemetryWeight = isHighFreq ? 0.40 : 0.20;

  // Check for sudden dropoff
  const daysSinceLast = (now - new Date(recent14d[0].created_at).getTime()) / (1000 * 60 * 60 * 24);
  const isDisengaged = checkins.length >= 8 && daysSinceLast >= 7 && daysAbsent >= 2;

  return {
    frequency_tier: isHighFreq ? "high_frequency" : "low_frequency",
    tier_label: isHighFreq ? "High-Frequency Active Pulse" : "Sparse Telemetry (Decayed EMA)",
    total_checkins: checkins.length,
    checkins_last_14d: count14d,
    time_decayed_mood_avg: timeDecayedAvg,
    negative_mood_ratio: negativeRatio,
    acute_distress_streak_days: acuteStreak,
    primary_stressor: topStressor,
    baseline_screener_weight: baselineWeight,
    telemetry_weight: telemetryWeight,
    telemetry_penalty_points: telemetryPenalty,
    disengagement_anomaly_detected: isDisengaged,
    disengagement_reason: isDisengaged
      ? `Active logger went quiet (${Math.round(daysSinceLast)} days since last entry) with ${daysAbsent} concurrent class absences.`
      : undefined,
    explanation: isHighFreq
      ? `Active pulse (${count14d} check-ins in 14d, Time-decayed Mood Avg: ${timeDecayedAvg}/5.0). Blended 60% screener + 40% live telemetry.`
      : `Sparse check-ins (${count14d} in 14d). Weighted 80% screener + 20% time-decayed mood pulse.`
  };
}
