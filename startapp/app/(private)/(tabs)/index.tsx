import { AppButton } from '@/components/AppButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSession } from '@/providers/SessionProvider';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function Home() {
  const { signOut, session } = useSession();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.title}>Olá, {session?.name}!</ThemedText>
      <AppButton title={"teste"} onPress={() => signOut()} style={{ margin: 20, backgroundColor: '#f0f0f0' }}/>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    textAlign: 'left',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  icon: {
    fontSize: 16,
  },
});