export const LEVEL_ORDER = ['A1', 'A2', 'B1'] as const;

export type Level = (typeof LEVEL_ORDER)[number];

export type ProgressSnapshot = {
  attemptsCount: number;
  avgScoreRecent: number;
  unlockedLevels: Level[];
};

const average = (scores: number[]): number => {
  if (scores.length === 0) return 0;
  return Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1));
};

export const computeProgress = (recentScoresDesc: number[]): ProgressSnapshot => {
  const attemptsCount = recentScoresDesc.length;
  const unlockedLevels: Level[] = ['A1'];

  const avgLast5 = average(recentScoresDesc.slice(0, 5));
  const canUnlockA2 = attemptsCount >= 5 && avgLast5 >= 70;
  if (canUnlockA2) {
    unlockedLevels.push('A2');
  }

  const avgLast10 = average(recentScoresDesc.slice(0, 10));
  const canUnlockB1 = canUnlockA2 && attemptsCount >= 15 && avgLast10 >= 75;
  if (canUnlockB1) {
    unlockedLevels.push('B1');
  }

  return {
    attemptsCount,
    avgScoreRecent: avgLast10,
    unlockedLevels
  };
};
