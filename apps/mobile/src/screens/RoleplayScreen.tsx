import React, { useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Speech from 'expo-speech';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { recordAudio } from '../utils/audio';
import { apiRequest } from '../api/client';
import { RootStackParamList } from '../types';
import { SpanishError } from '../components/SpanishError';

type Props = NativeStackScreenProps<RootStackParamList, 'Roleplay'>;

type PromptPayload = {
  promptQuestion: string;
  spanishHint: string;
  suggestedAnswer: string;
};

const ROLEPLAY_ERROR = 'No se pudo completar el roleplay';

const PROMPT_BY_TAG: Record<string, PromptPayload> = {
  greeting: {
    promptQuestion: 'Nice to meet you. What do you do?',
    spanishHint: 'Preséntate y di a qué te dedicas.',
    suggestedAnswer: "I'm a designer. Nice to meet you too."
  },
  restaurant: {
    promptQuestion: 'What would you like to drink?',
    spanishHint: 'Pide una bebida de forma cortés.',
    suggestedAnswer: "I'd like a glass of water, please."
  },
  meetings: {
    promptQuestion: 'What’s your top priority today?',
    spanishHint: 'Comenta tu objetivo principal para hoy.',
    suggestedAnswer: 'My top priority is finishing the client report.'
  },
  directions: {
    promptQuestion: 'Could you repeat the directions, please?',
    spanishHint: 'Pide que repitan las indicaciones.',
    suggestedAnswer: 'Sure, go straight and turn left at the bank.'
  }
};

const inferTagFromPhrase = (expected: string): string | null => {
  const text = expected.toLowerCase();
  if (text.includes('hello') || text.includes('nice to meet you')) return 'greeting';
  if (text.includes('drink') || text.includes('menu') || text.includes('restaurant')) return 'restaurant';
  if (text.includes('meeting') || text.includes('priority')) return 'meetings';
  if (text.includes('direction') || text.includes('turn left') || text.includes('turn right')) return 'directions';
  return null;
};

const buildPrompt = (expected: string): PromptPayload => {
  const tag = inferTagFromPhrase(expected);
  if (tag && PROMPT_BY_TAG[tag]) return PROMPT_BY_TAG[tag];

  return {
    promptQuestion: `Can you answer naturally in this situation: ${expected}?`,
    spanishHint: 'Responde en inglés con una frase corta y natural.',
    suggestedAnswer: "Sure, I'd be happy to help."
  };
};

export const RoleplayScreen: React.FC<Props> = ({ route }) => {
  const { accessToken } = useAuth();
  const expected = route.params?.expected ?? 'Hello!';
  const translation = route.params?.translation ?? '¡Hola!';
  const [rec, setRec] = useState<{ stop: () => Promise<string> } | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const prompt = useMemo(() => buildPrompt(expected), [expected]);

  const handleSpeakPrompt = async () => {
    try {
      Speech.stop();
      Speech.speak(prompt.promptQuestion, { language: 'en-US', rate: 0.9 });
    } catch {
      Alert.alert('Error', 'No se pudo reproducir la pregunta.');
    }
  };

  return <View style={{ flex: 1, padding: 16 }}>
    <Text style={{ fontSize: 22, fontWeight: '700' }}>Roleplay</Text>
    <Text style={{ marginTop: 8 }}>Frase: {expected}</Text>
    <Text style={{ color: '#4b5563' }}>Traducción: {translation}</Text>

    <Text style={{ marginTop: 14, fontWeight: '700', fontSize: 18 }}>{result?.promptQuestion ?? prompt.promptQuestion}</Text>
    <Text style={{ marginTop: 6, color: '#4b5563' }}>{result?.spanishHint ?? prompt.spanishHint}</Text>

    <PrimaryButton title="Escuchar pregunta" onPress={handleSpeakPrompt} />
    <PrimaryButton title={rec ? 'Detener y enviar' : 'Grabar respuesta'} onPress={async () => {
      setError('');
      if (!rec) {
        setRec(await recordAudio());
        return;
      }

      try {
        const uri = await rec.stop();
        setRec(null);
        const form = new FormData();
        form.append('audio', { uri, name: 'roleplay.m4a', type: 'audio/m4a' } as never);
        form.append('context', JSON.stringify({ expected, tags: [inferTagFromPhrase(expected)].filter(Boolean) }));
        const data = await apiRequest('/roleplay', { method: 'POST', body: form }, accessToken ?? undefined);
        setResult(data);
      } catch {
        setError(ROLEPLAY_ERROR);
      }
    }} />
    <SpanishError message={error} />
    {result ? <View>
      <Text>Transcripción: {result.transcript}</Text>
      <Text>Corrección: {result.corrected}</Text>
      <Text>Explicación: {result.spanishExplanation}</Text>
      <Text>Respuesta sugerida: {result.suggestedAnswer}</Text>
      <Text>Siguiente respuesta: {result.nextSuggestedResponse}</Text>
    </View> : null}
  </View>;
};
