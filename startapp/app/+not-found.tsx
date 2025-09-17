import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { strings } from '@/constants/Strings';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';

export default function NotFoundScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  return (
    <>
      <Stack.Screen options={{ title: strings.notFound.title }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">{strings.notFound.message}</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">{strings.notFound.goHome}</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const createStyles = (theme: 'light' | 'dark') =>
   StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors[theme].background,

  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
