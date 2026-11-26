import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusChip } from '@/components/ui/StatusChip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, radius, spacing } from '@/theme';
import { requireCase } from '@/features/cases/caseRegistry';
import { getCaseStatus } from '@/features/cases/caseStatus';
import { useInvestigationStore } from '@/store/investigationStore';
import { useProfileStore } from '@/store/profileStore';
import { formatElapsed } from '@/utils/time';
import { DIFFICULTY_LABELS } from '@/types/case';

export default function CaseDetailScreen() {
  const { caseId } = useLocalSearchParams<{ caseId: string }>();
  const caseData = requireCase(caseId);
  const status = getCaseStatus(caseData);
  const save = useInvestigationStore((s) => (s.caseId === caseData.id ? s.save : null));
  const perf = useProfileStore((s) => s.bestPerformanceForCase(caseData.id));

  const startOrResume = () => {
    if (!save || save.status !== 'active' || useInvestigationStore.getState().caseId !== caseData.id) {
      useInvestigationStore.getState().startCase(caseData);
    }
    router.push(`/investigation/${caseData.id}`);
  };

  const replay = () => {
    useInvestigationStore.getState().startCase(caseData);
    router.push(`/investigation/${caseData.id}`);
  };

  return (
    <Screen>
      <Text style={styles.docNumber}>DOSSIER {caseData.number}</Text>
      <Text style={styles.title}>{caseData.title}</Text>
      <View style={styles.statusRow}>
        <StatusChip status={status} />
        <Text style={styles.meta}>{caseData.type} · Niveau {caseData.difficulty} · {DIFFICULTY_LABELS[caseData.difficulty]}</Text>
      </View>

      <Card title="Résumé administratif">
        <Text style={styles.text}>{caseData.summary}</Text>
      </Card>

      <Card title="Consigne d'enquête">
        <Text style={styles.text}>{caseData.briefing}</Text>
      </Card>

      <View style={styles.facts}>
        <Fact label="Lieu" value={caseData.locationName} />
        <Fact label="Date" value={caseData.caseDate} />
        <Fact label="Durée estimée" value={`~${caseData.estimatedMinutes} min`} />
        <Fact label="Scènes" value={String(caseData.scenes.length)} />
        <Fact label="Suspects" value={String(caseData.suspects.length)} />
        <Fact label="Indices à découvrir" value={String(caseData.evidence.length)} />
        <Fact label="Récompense" value={`${caseData.rewardXp} XP + score / 1000`} />
      </View>

      {perf.plays > 0 ? (
        <>
          <SectionHeader title="Vos performances" />
          <Card>
            <Text style={styles.text}>Meilleur score : {perf.bestScore} / 1000</Text>
            <Text style={styles.text}>Meilleur temps : {formatElapsed(perf.bestTimeSeconds)}</Text>
            <Text style={styles.text}>Parties jouées : {perf.plays}</Text>
          </Card>
        </>
      ) : null}

      <View style={styles.actions}>
        {status === 'in_progress' ? (
          <Button label="Reprendre l'enquête" onPress={startOrResume} />
        ) : status === 'not_started' ? (
          <Button label="Commencer l'enquête" onPress={startOrResume} />
        ) : (
          <Button label="Rejouer (sans effacer votre record)" onPress={replay} />
        )}
        <Button label="Retour" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  docNumber: { color: colors.secondary, letterSpacing: 2, fontSize: 12, fontWeight: '700' },
  title: { color: colors.text, fontSize: 26, fontWeight: '900', marginTop: 4, marginBottom: spacing.s },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.m, marginBottom: spacing.l },
  meta: { color: colors.secondary, fontSize: 12 },
  text: { color: colors.text, fontSize: 14, lineHeight: 20 },
  facts: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: radius.l, padding: spacing.l },
  fact: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.line },
  factLabel: { color: colors.secondary, fontSize: 13 },
  factValue: { color: colors.text, fontSize: 13, fontWeight: '600' },
  actions: { gap: spacing.s, marginTop: spacing.l },
});
