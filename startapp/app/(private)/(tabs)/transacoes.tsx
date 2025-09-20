import { ExtractList } from '@/components/ExtractList';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function Transacoes() {
  return (
    <ThemedView style={styles.container}>
      <ExtractList />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});