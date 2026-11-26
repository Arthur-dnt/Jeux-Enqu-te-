import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/theme';
import { openDb, runMigrations } from '@/database/db';
import { initPersistence, bootstrapPersistence } from '@/features/persistence/autosave';
import { sqliteSaveRepository } from '@/database/repositories';
import { seedCaseContent } from '@/database/repositories/contentRepository';
import { getAllCases } from '@/features/cases/caseRegistry';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        openDb();
        await runMigrations();
        initPersistence(sqliteSaveRepository);
        for (const c of getAllCases()) {
          await seedCaseContent(c);
        }
        await bootstrapPersistence();
        setReady(true);
      } catch (e) {
        console.warn('[init] erreur:', e);
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <StatusBar style="light" />
        {error ? <View /> : null}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={colors.ink} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.ink },
            animation: 'fade',
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.ink },
  splash: { flex: 1, backgroundColor: colors.ink },
});
