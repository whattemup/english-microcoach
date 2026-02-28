import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getLessons, getProgress } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Lessons'>;

const LEVEL_ORDER = ['A1', 'A2', 'B1'] as const;

export const LessonsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { accessToken } = useAuth();
  const [lessons, setLessons] = useState<Array<{ id: number; title: string; level: string }>>([]);
  const [unlockedLevels, setUnlockedLevels] = useState<string[]>(['A1']);

  useEffect(() => {
    if (!accessToken) return;

    getLessons(accessToken, route.params.categoryId).then(setLessons).catch(() => setLessons([]));
    getProgress(accessToken)
      .then((progress) => setUnlockedLevels(progress.unlockedLevels))
      .catch(() => setUnlockedLevels(['A1']));
  }, [accessToken, route.params.categoryId]);

  const highestUnlockedIndex = useMemo(() => {
    const indexes = unlockedLevels
      .map((level) => LEVEL_ORDER.indexOf(level as (typeof LEVEL_ORDER)[number]))
      .filter((index) => index >= 0);
    return indexes.length > 0 ? Math.max(...indexes) : 0;
  }, [unlockedLevels]);

  return <View style={{ flex: 1, padding: 16 }}>
    <Text style={{ fontSize: 22, fontWeight: '700' }}>{route.params.title}</Text>
    <FlatList data={lessons} keyExtractor={(i) => i.id.toString()} renderItem={({ item }) => {
      const lessonIndex = LEVEL_ORDER.indexOf(item.level as (typeof LEVEL_ORDER)[number]);
      const isLocked = lessonIndex > highestUnlockedIndex;

      return (
        <View style={{ marginVertical: 8 }}>
          <Text>{item.title} ({item.level}) {isLocked ? '🔒 Bloqueado' : ''}</Text>
          {isLocked ? <Text style={{ color: '#6b7280', marginBottom: 6 }}>Completa más prácticas para desbloquear.</Text> : null}
          <PrimaryButton
            title="Abrir"
            disabled={isLocked}
            onPress={() => navigation.navigate('LessonDetail', { lessonId: item.id })}
          />
        </View>
      );
    }} />
  </View>;
};
