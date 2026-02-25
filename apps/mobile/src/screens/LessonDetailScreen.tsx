import React, { useEffect, useState } from 'react';
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

export const LessonDetailScreen: React.FC<Props> = ({ route }) => {
  const { accessToken } = useAuth();
  const [lesson, setLesson] = useState<{ title: string; phrases: Array<{ id: number; text: string; translation: string }> } | null>(null);
  const [rec, setRec] = useState<{ stop: () => Promise<string> } | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (accessToken) getLesson(accessToken, route.params.lessonId).then(setLesson);
  }, [accessToken, route.params.lessonId]);

  const phrase = lesson?.phrases?.[0];

  return <View style={{ flex: 1, padding: 16 }}>
    <Text style={{ fontSize: 20, fontWeight: '700' }}>{lesson?.title}</Text>
    <Text style={{ marginTop: 12 }}>{phrase?.text}</Text>
    <Text style={{ color: '#4b5563' }}>{phrase?.translation}</Text>

    <PrimaryButton title={rec ? 'Detener grabación' : 'Grabar voz'} onPress={async () => {
      if (!rec) setRec(await recordAudio());
      else {
        const uri = await rec.stop();
        setRec(null);
        const form = new FormData();
        form.append('audio', { uri, name: 'attempt.m4a', type: 'audio/m4a' } as never);
        form.append('lessonPhraseId', String(phrase?.id));
        form.append('expectedText', phrase?.text ?? '');
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
