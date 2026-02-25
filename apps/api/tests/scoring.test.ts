import { describe, expect, it } from 'vitest';
import { scoreAttempt } from '../src/services/scoring.js';

describe('scoreAttempt', () => {
  it('returns 100 for exact match', () => {
    const result = scoreAttempt('Hello how are you', 'Hello how are you');
    expect(result.score).toBe(100);
    expect(result.missing).toHaveLength(0);
    expect(result.extra).toHaveLength(0);
  });

  it('detects missing and extra words', () => {
    const result = scoreAttempt('I would like coffee please', 'I would coffee now');
    expect(result.score).toBeLessThan(100);
    expect(result.missing.length).toBeGreaterThan(0);
    expect(result.extra.length).toBeGreaterThan(0);
  });
});
