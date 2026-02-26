import React from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { apiRequest } from '../api/client';

export const ProfileScreen: React.FC = () => {
  const { logout, accessToken } = useAuth();
  return <View style={{ flex: 1, padding: 16 }}>
    <Text style={{ fontSize: 22, fontWeight: '700' }}>Perfil</Text>
    <Text style={{ marginVertical: 12 }}>Configuración</Text>
    <PrimaryButton title="Cerrar sesión" onPress={logout} />
    <View style={{ height: 12 }} />
    <PrimaryButton title="Eliminar cuenta" onPress={async () => {
      if (!accessToken) return;
      await apiRequest('/me', { method: 'DELETE' }, accessToken);
      logout();
    }} />
  </View>;
};
