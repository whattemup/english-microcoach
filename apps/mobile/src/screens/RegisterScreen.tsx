import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { register } from '../api/endpoints';
import { PrimaryButton } from '../components/PrimaryButton';
import { SpanishError } from '../components/SpanishError';
import { useAuth } from '../context/AuthContext';
import { humanizeError } from '../utils/spanish';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { setTokens } = useAuth();
  const [name, setName] = useState('Demo User');
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');

  return <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
    <Text style={{ fontSize: 24, fontWeight: '700' }}>Registro</Text>
    <TextInput placeholder="Nombre" value={name} onChangeText={setName} style={{ borderWidth: 1, marginTop: 12, padding: 10 }} />
    <TextInput placeholder="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" style={{ borderWidth: 1, marginTop: 12, padding: 10 }} />
    <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, marginTop: 12, padding: 10 }} />
    <SpanishError message={error} />
    <PrimaryButton title="Crear" onPress={async () => {
      try {
        const tokens = await register(name, email, password);
        setTokens(tokens.accessToken, tokens.refreshToken);
        navigation.replace('Home');
      } catch (e) {
        setError(humanizeError(e));
      }
    }} />
  </View>;
};
