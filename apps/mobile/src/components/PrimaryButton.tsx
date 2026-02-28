import React from 'react';
import { Pressable, Text } from 'react-native';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ title, onPress, disabled = false }) => (
  <Pressable
    disabled={disabled}
    onPress={onPress}
    style={{
      backgroundColor: disabled ? '#93c5fd' : '#2563eb',
      padding: 12,
      borderRadius: 8,
      marginVertical: 6
    }}
  >
    <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>{title}</Text>
  </Pressable>
);
