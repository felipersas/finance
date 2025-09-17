import { ExtractList } from '@/components/ExtractList';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function Home() {

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
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 12,
    gap: 16,
  },
});