export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Lessons: { categoryId: number; title: string };
  LessonDetail: { lessonId: number };
  Roleplay: undefined;
  Review: undefined;
  Profile: undefined;
};
