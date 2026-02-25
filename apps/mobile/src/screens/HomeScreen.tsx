import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getCategories } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { accessToken } = useAuth();
  const [categories, setCategories] = useState<Array<{ id: number; name: string; description: string }>>([]);

  useEffect(() => {
    if (accessToken) getCategories(accessToken).then(setCategories).catch(() => setCategories([]));
  }, [accessToken]);

  return <View style={{ flex: 1, padding: 16 }}>
    <Text style={{ fontSize: 22, fontWeight: '700' }}>Categorías</Text>
    <FlatList
      data={categories}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={{ paddingVertical: 10 }}>
          <Text style={{ fontWeight: '700' }}>{item.name}</Text>
          <Text>{item.description}</Text>
          <PrimaryButton title="Ver lecciones" onPress={() => navigation.navigate('Lessons', { categoryId: item.id, title: item.name })} />
        </View>
      )}
    />
    <PrimaryButton title="Roleplay" onPress={() => navigation.navigate('Roleplay')} />
    <PrimaryButton title="Review" onPress={() => navigation.navigate('Review')} />
    <PrimaryButton title="Perfil" onPress={() => navigation.navigate('Profile')} />
  </View>;
};
