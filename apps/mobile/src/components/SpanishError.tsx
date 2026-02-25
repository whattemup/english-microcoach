import React from 'react';
import { Text } from 'react-native';

export const SpanishError: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;
  return <Text style={{ color: '#dc2626', marginVertical: 8 }}>{message}</Text>;
};
