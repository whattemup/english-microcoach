const normalize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, '')
    .split(/\s+/)
    .filter(Boolean);

const levenshtein = (a: string[], b: string[]): number => {
  const dp = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i]![0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0]![j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + cost);
    }
  }
  return dp[a.length]![b.length]!;
};

export interface ScoreResult {
  score: number;
  highlights: Array<{ word: string; status: 'correct' | 'missing' | 'extra' | 'different' }>;
  missing: string[];
  extra: string[];
  spanishTip: string;
}

export const scoreAttempt = (expectedText: string, transcript: string): ScoreResult => {
  const expected = normalize(expectedText);
  const actual = normalize(transcript);
  const distance = levenshtein(expected, actual);
  const maxLen = Math.max(expected.length, actual.length, 1);
  const similarity = 1 - distance / maxLen;
  const score = Math.max(0, Math.min(100, Math.round(similarity * 100)));

  const highlights: ScoreResult['highlights'] = [];
  const missing: string[] = [];
  const extra: string[] = [];

  for (let i = 0; i < Math.max(expected.length, actual.length); i += 1) {
    const e = expected[i];
    const a = actual[i];
    if (e && a) {
      if (e === a) highlights.push({ word: a, status: 'correct' });
      else highlights.push({ word: `${a}→${e}`, status: "different" });
    } else if (e && !a) {
      missing.push(e);
      highlights.push({ word: e, status: 'missing' });
    } else if (!e && a) {
      extra.push(a);
      highlights.push({ word: a, status: 'extra' });
    }
  }

  const spanishTip =
    score >= 85
      ? "¡Muy bien! Tu pronunciación y precisión son sólidas."
      : "Consejo: habla más despacio y compara cada palabra con la frase objetivo.";
  return { score, highlights, missing, extra, spanishTip };
};
