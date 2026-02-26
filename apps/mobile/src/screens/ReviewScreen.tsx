import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getReviewToday } from '../api/endpoints';
import { PrimaryButton } from '../components/PrimaryButton';
import { apiRequest } from '../api/client';

export const ReviewScreen: React.FC = () => {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<
    Array<{ id: number; phrase: { expected: string; translation: string; lesson: { title: string } } }>
  >([]);

  const load = async (): Promise<void> => {
    if (accessToken) setItems(await getReviewToday(accessToken));
  };

  useEffect(() => {
    load();
  }, [accessToken]);

  return <View style={{ flex: 1, padding: 16 }}>
    <Text style={{ fontSize: 22, fontWeight: '700' }}>Repaso de hoy</Text>
    <FlatList data={items} keyExtractor={(i) => i.id.toString()} renderItem={({ item }) => (
      <View style={{ marginVertical: 8 }}>
        <Text style={{ fontWeight: '700' }}>{item.phrase.lesson.title}</Text>
        <Text>{item.phrase.expected}</Text>
        <Text style={{ color: '#4b5563' }}>{item.phrase.translation}</Text>
        <PrimaryButton title="Marcar correcto" onPress={async () => {
          await apiRequest('/review/submit', { method: 'POST', body: JSON.stringify({ reviewItemId: item.id, quality: 4 }) }, accessToken ?? undefined);
          await load();
        }} />
      </View>
    )} />
  </View>;
};
