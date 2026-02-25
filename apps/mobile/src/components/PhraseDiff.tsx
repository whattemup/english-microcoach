import React from 'react';
import { Text, View } from 'react-native';

export const PhraseDiff: React.FC<{ highlights: Array<{ word: string; status: 'correct' | 'missing' | 'extra' | 'different' }> }> = ({ highlights }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
    {highlights.map((item, idx) => (
      <Text key={`${item.word}-${idx}`} style={{
        color: item.status === 'correct' ? '#166534' : item.status === 'missing' ? '#dc2626' : item.status === 'extra' ? '#b45309' : '#7c3aed'
      }}>
        {item.word}
      </Text>
    ))}
  </View>
);
