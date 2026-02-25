import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { login } from '../api/endpoints';
import { PrimaryButton } from '../components/PrimaryButton';
import { SpanishError } from '../components/SpanishError';
import { useAuth } from '../context/AuthContext';
import { humanizeError } from '../utils/spanish';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { setTokens } = useAuth();
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');

  return <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
    <Text style={{ fontSize: 24, fontWeight: '700' }}>Iniciar sesión</Text>
    <TextInput placeholder="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" style={{ borderWidth: 1, marginTop: 12, padding: 10 }} />
    <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, marginTop: 12, padding: 10 }} />
    <SpanishError message={error} />
    <PrimaryButton title="Entrar" onPress={async () => {
      try {
        const tokens = await login(email, password);
        setTokens(tokens.accessToken, tokens.refreshToken);
        navigation.replace('Home');
      } catch (e) {
        setError(humanizeError(e));
      }
    }} />
    <PrimaryButton title="Crear cuenta" onPress={() => navigation.navigate('Register')} />
  </View>;
};
