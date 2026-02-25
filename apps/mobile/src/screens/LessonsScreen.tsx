import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getLessons } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Lessons'>;

export const LessonsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { accessToken } = useAuth();
  const [lessons, setLessons] = useState<Array<{ id: number; title: string; level: string }>>([]);

  useEffect(() => {
    if (accessToken) getLessons(accessToken, route.params.categoryId).then(setLessons).catch(() => setLessons([]));
  }, [accessToken, route.params.categoryId]);

  return <View style={{ flex: 1, padding: 16 }}>
    <Text style={{ fontSize: 22, fontWeight: '700' }}>{route.params.title}</Text>
    <FlatList data={lessons} keyExtractor={(i) => i.id.toString()} renderItem={({ item }) => (
      <View style={{ marginVertical: 8 }}>
        <Text>{item.title} ({item.level})</Text>
        <PrimaryButton title="Abrir" onPress={() => navigation.navigate('LessonDetail', { lessonId: item.id })} />
      </View>
    )} />
  </View>;
};
