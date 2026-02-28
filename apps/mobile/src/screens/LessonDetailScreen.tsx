import React, { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getLesson } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { recordAudio } from '../utils/audio';
import { apiRequest } from '../api/client';
import { PhraseDiff } from '../components/PhraseDiff';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonDetail'>;

type LessonPhrase = {
  id: number;
  expected: string;
  translation: string;
  tags: string[];
  order: number;
};

type LessonDetail = {
  id: number;
  title: string;
  level: string;
  categoryId: number;
  phrases: LessonPhrase[];
};

const EMPTY_LESSON_MESSAGE = 'Esta lección no tiene frases todavía.';

export const LessonDetailScreen: React.FC<Props> = ({ route }) => {
  const { accessToken } = useAuth();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [rec, setRec] = useState<{ stop: () => Promise<string> } | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (accessToken) getLesson(accessToken, route.params.lessonId).then(setLesson);
  }, [accessToken, route.params.lessonId]);

  const phrase = useMemo(() => lesson?.phrases?.[0], [lesson]);
  const hasPhrase = !!phrase?.expected;
  const canRecord = hasPhrase;

  return <View style={{ flex: 1, padding: 16 }}>
    <Text style={{ fontSize: 20, fontWeight: '700' }}>{lesson?.title}</Text>
    {hasPhrase ? (
      <>
        <Text style={{ marginTop: 12 }}>{phrase?.expected}</Text>
        <Text style={{ color: '#4b5563' }}>{phrase?.translation}</Text>
      </>
    ) : (
      <Text style={{ marginTop: 12, color: '#4b5563' }}>{EMPTY_LESSON_MESSAGE}</Text>
    )}

    <PrimaryButton title={rec ? 'Detener grabación' : 'Grabar voz'} disabled={!canRecord && !rec} onPress={async () => {
      if (!canRecord) return;

      if (!rec) setRec(await recordAudio());
      else {
        const uri = await rec.stop();
        setRec(null);
        const form = new FormData();
        form.append('audio', { uri, name: 'attempt.m4a', type: 'audio/m4a' } as never);
        form.append('phraseId', String(phrase.id));
        form.append('expectedText', phrase.expected);
        const attemptResult = await apiRequest('/attempts', { method: 'POST', body: form }, accessToken ?? undefined);
        setResult(attemptResult);
      }
    }} />

    {result ? (
      <View style={{ marginTop: 12 }}>
        <Text>Score: {result.score}</Text>
        <Text>Tip: {result.spanishTip}</Text>
        <PhraseDiff highlights={result.highlights ?? []} />
        <PrimaryButton title="Intentar de nuevo" onPress={() => setResult(null)} />
      </View>
    ) : null}
  </View>;
};
