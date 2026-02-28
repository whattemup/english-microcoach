export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Lessons: { categoryId: number; title: string };
  LessonDetail: { lessonId: number };
  Roleplay:
    | {
        lessonId: number;
        phraseId: number;
        expected: string;
        translation: string;
      }
    | undefined;
  Review: undefined;
  Profile: undefined;
};
