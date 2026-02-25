import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { recordAudio } from '../utils/audio';
import { apiRequest } from '../api/client';

export const RoleplayScreen: React.FC = () => {
  const { accessToken } = useAuth();
  const [context, setContext] = useState('At a coffee shop');
  const [rec, setRec] = useState<{ stop: () => Promise<string> } | null>(null);
  const [result, setResult] = useState<any>(null);

  return <View style={{ flex: 1, padding: 16 }}>
    <Text style={{ fontSize: 22, fontWeight: '700' }}>Roleplay</Text>
    <TextInput value={context} onChangeText={setContext} style={{ borderWidth: 1, marginVertical: 12, padding: 8 }} />
    <PrimaryButton title={rec ? 'Detener y enviar' : 'Grabar respuesta'} onPress={async () => {
      if (!rec) setRec(await recordAudio());
      else {
        const uri = await rec.stop();
        setRec(null);
        const form = new FormData();
        form.append('audio', { uri, name: 'roleplay.m4a', type: 'audio/m4a' } as never);
        form.append('context', context);
        const data = await apiRequest('/roleplay', { method: 'POST', body: form }, accessToken ?? undefined);
        setResult(data);
      }
    }} />
    {result ? <View>
      <Text>Transcripción: {result.transcript}</Text>
      <Text>Corrección: {result.corrected}</Text>
      <Text>Explicación: {result.spanishExplanation}</Text>
      <Text>Siguiente respuesta: {result.nextSuggestedResponse}</Text>
    </View> : null}
  </View>;
};
