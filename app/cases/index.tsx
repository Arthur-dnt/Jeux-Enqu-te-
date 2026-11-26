import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Chip } from '@/components/ui/Chip';
import { CaseCard } from '@/components/case/CaseCard';
import { colors, spacing } from '@/theme';
import { getAllCases } from '@/features/cases/caseRegistry';
import { getCaseStatus } from '@/features/cases/caseStatus';

type StatusFilter = 'all' | 'not_started' | 'in_progress' | 'done';
type LevelFilter = 'all' | 1 | 2 | 3 | 4 | 5;

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Toutes' },
  { id: 'not_started', label: 'Non commencées' },
  { id: 'in_progress', label: 'En cours' },
  { id: 'done', label: 'Terminées' },
];

const LEVEL_FILTERS: { id: LevelFilter; label: string }[] = [
  { id: 'all', label: 'Tous niveaux' },
  { id: 1, label: 'Débutantes' },
  { id: 2, label: 'Intermédiaires' },
  { id: 3, label: 'Connexions' },
  { id: 4, label: 'Complexes' },
  { id: 5, label: 'Expertes' },
];

export default function CasesLibraryScreen() {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [level, setLevel] = useState<LevelFilter>('all');

  const cases = getAllCases().filter((c) => {
    const s = getCaseStatus(c);
    const statusOk =
      status === 'all' ||
      (status === 'done' ? s === 'solved' || s === 'replayable' : s === status);
    const levelOk = level === 'all' || c.difficulty === level;
    return statusOk && levelOk;
  });

  return (
    <Screen>
      <Text style={styles.title}>Bibliothèque des enquêtes</Text>
      <View style={styles.filters}>
        {STATUS_FILTERS.map((f) => (
          <Chip key={f.id} label={f.label} active={status === f.id} onPress={() => setStatus(f.id)} />
        ))}
      </View>
      <View style={styles.filters}>
        {LEVEL_FILTERS.map((f) => (
          <Chip key={String(f.id)} label={f.label} active={level === f.id} onPress={() => setLevel(f.id)} />
        ))}
      </View>
      {cases.length === 0 ? (
        <Text style={styles.empty}>Aucune affaire ne correspond à ces filtres.</Text>
      ) : (
        cases.map((c) => (
          <CaseCard key={c.id} caseData={c} status={getCaseStatus(c)} onPress={() => router.push(`/cases/${c.id}`)} />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: spacing.m },
  filters: { flexDirection: 'row', flexWrap: 'wrap' },
  empty: { color: colors.secondary, fontSize: 14, textAlign: 'center', marginTop: 40 },
});
