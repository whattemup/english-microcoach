export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  message: string;
  details?: unknown;
}

export interface CategoryDTO {
  id: number;
  name: string;
  description: string;
}

export interface LessonDTO {
  id: number;
  categoryId: number;
  title: string;
  level: string;
}

export interface LessonDetailDTO extends LessonDTO {
  phrases: Array<{
    id: number;
    expected: string;
    translation: string;
  }>;
}

export interface AttemptResultDTO {
  transcript: string;
  confidence: number;
  score: number;
  highlights: Array<{ word: string; status: 'correct' | 'missing' | 'extra' | 'different' }>;
  missing: string[];
  extra: string[];
  spanishTip: string;
}
