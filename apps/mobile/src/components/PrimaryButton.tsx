import React from 'react';
import { Pressable, Text } from 'react-native';

export const PrimaryButton: React.FC<{ title: string; onPress: () => void }> = ({ title, onPress }) => (
  <Pressable onPress={onPress} style={{ backgroundColor: '#2563eb', padding: 12, borderRadius: 8, marginVertical: 6 }}>
    <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>{title}</Text>
  </Pressable>
);
