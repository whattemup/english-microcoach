import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { recordAudio } from '../utils/audio';
import { apiRequest } from '../api/client';
import { RootStackParamList } from '../types';
import { SpanishError } from '../components/SpanishError';

type Props = NativeStackScreenProps<RootStackParamList, 'Roleplay'>;

const ROLEPLAY_ERROR = 'No se pudo completar el roleplay';

const buildPrompt = (expected: string): string => {
  if (expected.toLowerCase().startsWith('hello')) return 'How are you?';
  return `Respond naturally to: ${expected}`;
};

export const RoleplayScreen: React.FC<Props> = ({ route }) => {
  const { accessToken } = useAuth();
  const expected = route.params?.expected ?? 'Hello!';
  const translation = route.params?.translation ?? '¡Hola!';
  const [rec, setRec] = useState<{ stop: () => Promise<string> } | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const prompt = useMemo(() => buildPrompt(expected), [expected]);

  return <View style={{ flex: 1, padding: 16 }}>
    <Text style={{ fontSize: 22, fontWeight: '700' }}>Roleplay</Text>
    <Text style={{ marginTop: 8 }}>Frase: {expected}</Text>
    <Text style={{ color: '#4b5563' }}>Traducción: {translation}</Text>
    <Text style={{ marginTop: 12, fontWeight: '600' }}>Situación</Text>
    <Text>{prompt}</Text>
    <PrimaryButton title={rec ? 'Detener y enviar' : 'Grabar respuesta'} onPress={async () => {
      setError('');
      if (!rec) setRec(await recordAudio());
      else {
        try {
          const uri = await rec.stop();
          setRec(null);
          const form = new FormData();
          form.append('audio', { uri, name: 'roleplay.m4a', type: 'audio/m4a' } as never);
          form.append('context', prompt);
          const data = await apiRequest('/roleplay', { method: 'POST', body: form }, accessToken ?? undefined);
          setResult(data);
        } catch {
          setError(ROLEPLAY_ERROR);
        }
      }
    }} />
    <SpanishError message={error} />
    {result ? <View>
      <Text>Transcripción: {result.transcript}</Text>
      <Text>Corrección: {result.corrected}</Text>
      <Text>Explicación: {result.spanishExplanation}</Text>
      <Text>Siguiente respuesta: {result.nextSuggestedResponse}</Text>
    </View> : null}
  </View>;
};
