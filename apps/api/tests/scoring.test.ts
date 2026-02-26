import { describe, it, expect } from "vitest";
import { scoreAttempt } from "../src/services/scoring.js";

describe("scoreAttempt", () => {
  it("returns 100 for exact match", () => {
    const r = scoreAttempt("Hi everyone, thanks for joining.", "hi everyone thanks for joining");
    expect(r.score).toBe(100);
    expect(r.missing.length).toBe(0);
    expect(r.extra.length).toBe(0);
  });

  it("detects missing words", () => {
    const r = scoreAttempt("can you help me with this task", "can you help me");
    expect(r.score).toBeLessThan(100);
    expect(r.missing.length).toBeGreaterThan(0);
  });

  it("detects extra words", () => {
    const r = scoreAttempt("can you help me with this task", "can you help me with this task please");
    expect(r.score).toBeLessThan(100);
    expect(r.extra.length).toBeGreaterThan(0);
  });
});