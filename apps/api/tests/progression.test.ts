import { describe, expect, it } from 'vitest';
import { computeProgress } from '../src/services/progression.js';

describe('computeProgress', () => {
  it('keeps only A1 unlocked for new users', () => {
    const progress = computeProgress([]);

    expect(progress.attemptsCount).toBe(0);
    expect(progress.avgScoreRecent).toBe(0);
    expect(progress.unlockedLevels).toEqual(['A1']);
  });

  it('unlocks A2 after 5 attempts with avg >= 70 in last 5', () => {
    const progress = computeProgress([80, 70, 75, 70, 70]);

    expect(progress.attemptsCount).toBe(5);
    expect(progress.unlockedLevels).toEqual(['A1', 'A2']);
  });

  it('unlocks B1 after 15 attempts with avg >= 75 in last 10', () => {
    const progress = computeProgress([90, 85, 80, 75, 80, 80, 75, 75, 80, 75, 60, 60, 60, 60, 60]);

    expect(progress.attemptsCount).toBe(15);
    expect(progress.avgScoreRecent).toBe(79.5);
    expect(progress.unlockedLevels).toEqual(['A1', 'A2', 'B1']);
  });
});
