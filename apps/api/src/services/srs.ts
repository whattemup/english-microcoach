export interface ReviewState {
  intervalDays: number;
  repetitions: number;
  easeFactor: number;
}

export const updateSrs = (state: ReviewState, quality: number): ReviewState => {
  let { intervalDays, repetitions, easeFactor } = state;
  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * easeFactor);
  }
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  return { intervalDays, repetitions, easeFactor };
};
