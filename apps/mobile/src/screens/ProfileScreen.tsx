import React from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';

export const ProfileScreen: React.FC = () => {
  const { logout } = useAuth();
  return <View style={{ flex: 1, padding: 16 }}>
    <Text style={{ fontSize: 22, fontWeight: '700' }}>Perfil</Text>
    <Text style={{ marginVertical: 12 }}>Nota: eliminación de cuenta disponible en próximas versiones.</Text>
    <PrimaryButton title="Cerrar sesión" onPress={logout} />
  </View>;
};
