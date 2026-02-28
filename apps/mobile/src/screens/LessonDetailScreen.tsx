import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system';
import { RootStackParamList } from '../types';
import { getLesson, getLessons } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { recordAudio } from '../utils/audio';
import { apiRequest } from '../api/client';
import { PhraseDiff } from '../components/PhraseDiff';
import { SpanishError } from '../components/SpanishError';
import * as Speech from 'expo-speech';

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
const EXPLAIN_ERROR = 'No se pudo obtener explicación';
const SUCCESS_SCORE = 80;
const DAILY_GOAL = 5;
const DAILY_PRACTICE_PATH = `${FileSystem.documentDirectory ?? ''}dailyPractice.json`;

type DailyPracticeRecord = {
  date: string;
  count: number;
};

const buildMockExplanation = (phrase: LessonPhrase): string =>
  `Esta frase se usa para comunicar: "${phrase.expected}". En español significa: "${phrase.translation}".`;

export const LessonDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { accessToken } = useAuth();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [selectedPhraseId, setSelectedPhraseId] = useState<number | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [rec, setRec] = useState<{ stop: () => Promise<string> } | null>(null);
  const [result, setResult] = useState<any>(null);
  const [dailyCount, setDailyCount] = useState<number>(0);

  useEffect(() => {
    if (!accessToken) return;
    getLesson(accessToken, route.params.lessonId)
      .then((lessonData) => {
        setLesson(lessonData);
        const firstPhrase = [...(lessonData.phrases ?? [])].sort((a, b) => a.order - b.order)[0];
        setSelectedPhraseId(firstPhrase?.id ?? null);
      })
      .catch(() => setLesson(null));
  }, [accessToken, route.params.lessonId]);

  useEffect(() => {
    const loadDailyProgress = async () => {
      try {
        const raw = await FileSystem.readAsStringAsync(DAILY_PRACTICE_PATH);
        if (!raw) {
          setDailyCount(0);
          return;
        }
        const parsed = JSON.parse(raw) as DailyPracticeRecord;
        const today = new Date().toISOString().slice(0, 10);
        if (parsed.date !== today) {
          setDailyCount(0);
          await FileSystem.writeAsStringAsync(DAILY_PRACTICE_PATH, JSON.stringify({ date: today, count: 0 }));
          return;
        }
        setDailyCount(parsed.count ?? 0);
      } catch {
        setDailyCount(0);
      }
    };

    loadDailyProgress();
  }, []);

  const phrases = useMemo(() => [...(lesson?.phrases ?? [])].sort((a, b) => a.order - b.order), [lesson]);
  const phrase = useMemo(
    () => phrases.find((item) => item.id === selectedPhraseId) ?? phrases[0],
    [phrases, selectedPhraseId]
  );
  const hasPhrase = !!phrase?.expected;
  const canRecord = hasPhrase;
  const isSuccessfulAttempt = !!result && typeof result.score === 'number' && result.score >= SUCCESS_SCORE;
  const missingWords = result?.missing ?? [];
  const extraWords = result?.extra ?? [];

  const handleSpeak = async () => {
    const textToSpeak = phrase?.expected?.trim();

    if (!textToSpeak) {
      Alert.alert('Error', 'No hay frase para reproducir.');
      return;
    }

    try {
      Speech.stop();
      Speech.speak(textToSpeak, { language: 'en-US', rate: 0.9 });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo reproducir el audio.');
    }
  };

  useEffect(() => {
    setExplanation('');
    setError('');
    setResult(null);
    setRec(null);
  }, [phrase?.id]);

  const trackDailyPractice = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const nextCount = dailyCount + 1;
    setDailyCount(nextCount);
    await FileSystem.writeAsStringAsync(DAILY_PRACTICE_PATH, JSON.stringify({ date: today, count: nextCount }));
  };

  const goToNextPhraseOrLesson = async () => {
    if (!phrase || !lesson || !accessToken) return;

    const currentPhraseIndex = phrases.findIndex((item) => item.id === phrase.id);
    const nextPhrase = currentPhraseIndex >= 0 ? phrases[currentPhraseIndex + 1] : null;

    if (nextPhrase) {
      setSelectedPhraseId(nextPhrase.id);
      return;
    }

    try {
      const categoryLessons = await getLessons(accessToken, lesson.categoryId);
      const orderedLessons = [...categoryLessons].sort((a, b) => a.id - b.id);
      const currentLessonIndex = orderedLessons.findIndex((item) => item.id === lesson.id);
      const nextLesson = currentLessonIndex >= 0 ? orderedLessons[currentLessonIndex + 1] : null;

      if (nextLesson) {
        navigation.replace('LessonDetail', { lessonId: nextLesson.id });
        return;
      }

      Alert.alert('¡Excelente!', 'Terminaste esta lección. Elige otra para seguir practicando.');
      navigation.navigate('Lessons', { categoryId: lesson.categoryId, title: 'Lecciones' });
    } catch {
      Alert.alert('Aviso', 'No pudimos cargar la siguiente lección.');
    }
  };

  return <View style={{ flex: 1, padding: 16 }}>
    <Text style={{ fontSize: 20, fontWeight: '700' }}>{lesson?.title}</Text>
    <View style={{ marginTop: 8, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#eff6ff', borderRadius: 8 }}>
      <Text style={{ fontWeight: '600', color: '#1d4ed8' }}>Meta diaria: {DAILY_GOAL} prácticas</Text>
      <Text style={{ color: '#1e3a8a', marginTop: 2 }}>{Math.min(dailyCount, DAILY_GOAL)}/{DAILY_GOAL}</Text>
    </View>

    <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
      {['Escucha', 'Habla', 'Repite'].map((step, index) => {
        const isActive = index === 0 || (index === 1 && rec) || (index === 2 && result);

        return (
          <View key={step} style={{ flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: isActive ? '#dcfce7' : '#f3f4f6' }}>
            <Text style={{ textAlign: 'center', color: isActive ? '#166534' : '#6b7280', fontWeight: '600' }}>{step}</Text>
          </View>
        );
      })}
    </View>

    {phrases.length > 1 ? (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
        {phrases.map((item, index) => (
          <View key={item.id} style={{ marginRight: 8 }}>
            <PrimaryButton
              title={`Frase ${index + 1}`}
              onPress={() => setSelectedPhraseId(item.id)}
              disabled={selectedPhraseId === item.id}
            />
          </View>
        ))}
      </View>
    ) : null}

    {hasPhrase ? (
      <>
        <Text style={{ marginTop: 12 }}>{phrase?.expected}</Text>
        <Text style={{ color: '#4b5563' }}>{phrase?.translation}</Text>

        <PrimaryButton
          title="Explicar en español"
          disabled={!hasPhrase}
          onPress={async () => {
            if (!phrase) return;
            setError('');
            try {
              setExplanation(buildMockExplanation(phrase));
            } catch {
              setError(EXPLAIN_ERROR);
            }
          }}
        />
        <PrimaryButton
          title="Escucharlo"
          disabled={!hasPhrase}
          onPress={handleSpeak}
        />
        <PrimaryButton
          title="Practicar (Roleplay)"
          disabled={!hasPhrase}
          onPress={() => {
            if (!phrase) return;
            navigation.navigate('Roleplay', {
              lessonId: lesson?.id ?? route.params.lessonId,
              phraseId: phrase.id,
              expected: phrase.expected,
              translation: phrase.translation
            });
          }}
        />
      </>
    ) : (
      <Text style={{ marginTop: 12, color: '#4b5563' }}>{EMPTY_LESSON_MESSAGE}</Text>
    )}

    {explanation ? <Text style={{ marginTop: 8 }}>{explanation}</Text> : null}
    <SpanishError message={error} />

    <PrimaryButton title={rec ? 'Detener grabación' : 'Grabar voz'} disabled={!canRecord && !rec} onPress={async () => {
      if (!canRecord || !phrase) return;

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
        await trackDailyPractice();
      }
    }} />

    {result ? (
      <View style={{ marginTop: 12 }}>
        <Text>Score: {result.score}</Text>
        <Text>Transcripción: {result.transcript || '—'}</Text>
        <Text>Faltaron: {missingWords.length ? missingWords.join(', ') : 'Ninguna'}</Text>
        <Text>Sobraron: {extraWords.length ? extraWords.join(', ') : 'Ninguna'}</Text>
        <Text>Tip en español: {result.spanishTip}</Text>
        <PhraseDiff highlights={result.highlights ?? []} />

        {isSuccessfulAttempt ? (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#15803d', marginBottom: 6 }}>¡Bien!</Text>
            <PrimaryButton title="Siguiente" onPress={goToNextPhraseOrLesson} />
          </View>
        ) : (
          <PrimaryButton title="Intentar de nuevo" onPress={() => setResult(null)} />
        )}
      </View>
    ) : null}
  </View>;
};
