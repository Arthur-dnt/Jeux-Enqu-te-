import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { CaseDef, CaseStatus } from '@/types/case';
import { DIFFICULTY_LABELS } from '@/types/case';
import { colors, radius, spacing } from '@/theme';
import { StatusChip } from '@/components/ui/StatusChip';

interface Props {
  caseData: CaseDef;
  status: CaseStatus;
  onPress: () => void;
  dailyBadge?: boolean;
}

export function CaseCard({ caseData, status, onPress, dailyBadge }: Props) {
  return (
    <LinearGradient colors={[colors.surfaceRaised, colors.surface]} style={styles.card}>
      <CaseArtBadge number={caseData.number} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.number}>DOSSIER {caseData.number}</Text>
          {dailyBadge ? <Text style={styles.daily}>ENQUÊTE DU JOUR</Text> : null}
        </View>
        <Text style={styles.title}>{caseData.title}</Text>
        <Text style={styles.summary} numberOfLines={2}>{caseData.summary}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>Niveau {caseData.difficulty} · {DIFFICULTY_LABELS[caseData.difficulty]}</Text>
          <Text style={styles.meta}>~{caseData.estimatedMinutes} min</Text>
          <Text style={styles.meta}>{caseData.scenes.length} scènes</Text>
          <Text style={styles.meta}>{caseData.suspects.length} suspects</Text>
        </View>
        <View style={styles.bottomRow}>
          <StatusChip status={status} />
          <View style={styles.openHint}>
            <Text style={styles.openText}>{status === 'not_started' ? 'Commencer' : status === 'in_progress' ? 'Reprendre' : 'Ouvrir'}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.gold} />
          </View>
        </View>
      </View>
      <View style={StyleSheet.absoluteFill} pointerEvents="none" />
      <PressableHit onPress={onPress} />
    </LinearGradient>
  );
}

function PressableHit({ onPress }: { onPress: () => void }) {
  return <Pressable style={StyleSheet.absoluteFill} onPress={onPress} accessibilityRole="button" />;
}

function CaseArtBadge({ number }: { number: string }) {
  return (
    <View style={styles.artBadge}>
      <Text style={styles.artNumber}>{number}</Text>
      <Text style={styles.artLabel}>CLASSIFIÉ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderRadius: radius.l, borderWidth: 1, borderColor: colors.line, marginBottom: spacing.m, overflow: 'hidden' },
  artBadge: { width: 84, backgroundColor: colors.night, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: colors.line },
  artNumber: { color: colors.gold, fontSize: 24, fontWeight: '800' },
  artLabel: { color: colors.secondary, fontSize: 8, letterSpacing: 2, marginTop: 4 },
  body: { flex: 1, padding: spacing.m },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  number: { color: colors.secondary, fontSize: 10, letterSpacing: 1.5, fontWeight: '700' },
  daily: { color: colors.gold, fontSize: 10, letterSpacing: 1, fontWeight: '800' },
  title: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 2 },
  summary: { color: colors.textDim, fontSize: 12, marginTop: 4, lineHeight: 17 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s, marginTop: spacing.s },
  meta: { color: colors.secondary, fontSize: 11 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.m },
  openHint: { flexDirection: 'row', alignItems: 'center' },
  openText: { color: colors.gold, fontSize: 13, fontWeight: '700', marginRight: 2 },
});
