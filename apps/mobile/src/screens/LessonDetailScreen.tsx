import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getLesson } from '../api/endpoints';
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

  const phrases = useMemo(() => [...(lesson?.phrases ?? [])].sort((a, b) => a.order - b.order), [lesson]);
  const phrase = useMemo(
    () => phrases.find((item) => item.id === selectedPhraseId) ?? phrases[0],
    [phrases, selectedPhraseId]
  );
  const hasPhrase = !!phrase?.expected;
  const canRecord = hasPhrase;

  const handleSpeak = async () => {
    Alert.alert('TTS', 'Botón presionado');
    console.log('[TTS] pressed');
    console.log('[TTS] phrase.expected:', JSON.stringify(phrase?.expected));

    const voices = await Speech.getAvailableVoicesAsync().catch(() => []);
    console.log('[TTS] voices count:', voices.length);
    console.log(
      '[TTS] first voices:',
      voices.slice(0, 3).map((voice: { language?: string; name?: string }) => ({
        language: voice.language,
        name: voice.name
      }))
    );

    const textToSpeak = phrase?.expected?.trim();

    if (!textToSpeak) {
      Alert.alert('Error', 'No hay frase para reproducir.');
      return;
    }

    try {
      Speech.stop();
      Speech.speak(textToSpeak, { language: 'en-US', rate: 0.9 });
      console.log('[TTS] speak invoked');
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

  return <View style={{ flex: 1, padding: 16 }}>
    <Text style={{ fontSize: 20, fontWeight: '700' }}>{lesson?.title}</Text>

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
