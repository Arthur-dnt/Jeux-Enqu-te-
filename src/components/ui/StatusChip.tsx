import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import type { CaseStatus } from '@/types/case';

const LABELS: Record<CaseStatus, string> = {
  not_started: 'Non commencée',
  in_progress: 'En cours',
  solved: 'Résolue',
  replayable: 'Rejouable',
};

const TINTS: Record<CaseStatus, { fg: string; bg: string }> = {
  not_started: { fg: colors.secondary, bg: colors.nightSoft },
  in_progress: { fg: colors.gold, bg: colors.goldSoft },
  solved: { fg: colors.success, bg: colors.successSoft },
  replayable: { fg: colors.success, bg: colors.successSoft },
};

export function StatusChip({ status }: { status: CaseStatus }) {
  const t = TINTS[status];
  return (
    <View style={[styles.chip, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.fg }]}>{LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { borderRadius: radius.s, paddingHorizontal: spacing.s, paddingVertical: 3, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
});
