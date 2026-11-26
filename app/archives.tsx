import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, radius, spacing } from '@/theme';
import { getAllCases, requireCase } from '@/features/cases/caseRegistry';
import { useProfileStore } from '@/store/profileStore';
import { useInvestigationStore } from '@/store/investigationStore';
import { formatElapsed } from '@/utils/time';
import type { CaseDef } from '@/types/case';

export default function ArchivesScreen() {
  const scores = useProfileStore((s) => s.scores);

  const solvedCaseIds = [...new Set(scores.map((s) => s.caseId))];
  const solvedCases = getAllCases().filter((c) => solvedCaseIds.includes(c.id));

  const replay = (caseId: string) => {
    const caseData = requireCase(caseId);
    useInvestigationStore.getState().startCase(caseData);
    router.push(`/investigation/${caseId}`);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.title}>Archives</Text>
      <Text style={styles.note}>
        Toutes vos affaires terminées, avec vos meilleures performances. Rejouer une affaire n'efface jamais votre record.
      </Text>

      {solvedCases.length === 0 ? (
        <Card>
          <Text style={styles.empty}>
            Aucune affaire résolue pour le moment. Résolvez votre première enquête pour l'archiver ici.
          </Text>
          <Button label="Voir les enquêtes" onPress={() => router.push('/cases')} style={{ marginTop: spacing.m }} />
        </Card>
      ) : (
        solvedCases.map((c) => (
          <ArchiveEntry
            key={c.id}
            caseData={c}
            entries={scores.filter((s) => s.caseId === c.id)}
            onReplay={() => replay(c.id)}
          />
        ))
      )}

      <Button label="Retour à l'accueil" variant="ghost" onPress={() => router.push('/home')} style={{ marginTop: spacing.m }} />
    </ScrollView>
  );
}

interface ArchiveEntryData {
  score: number;
  elapsedSeconds: number;
  hintsUsed: number;
  breakdown: { evidence: number };
}

function ArchiveEntry({
  caseData,
  entries,
  onReplay,
}: {
  caseData: CaseDef;
  entries: ArchiveEntryData[];
  onReplay: () => void;
}) {
  const best = entries.reduce((a, e) => (e.score > a.score ? e : a), entries[0]);
  const bestTime = entries
    .filter((e) => e.score === best.score)
    .reduce((a, e) => (a === 0 ? e.elapsedSeconds : Math.min(a, e.elapsedSeconds)), 0);

  return (
    <Card title={`DOSSIER ${caseData.number} — ${caseData.title}`} subtitle={`${entries.length} résolution(s) enregistrée(s)`}>
      <ArchiveLine icon="star-outline" text={`Meilleur score : ${best.score} / 1000`} />
      <ArchiveLine icon="time-outline" text={`Meilleur temps : ${formatElapsed(bestTime)}`} />
      <ArchiveLine icon="bulb-outline" text={`Aides utilisées (dernière partie) : ${best.hintsUsed}`} />
      <ArchiveLine
        icon="finger-print-outline"
        text={`Preuves décisives : ${best.breakdown.evidence >= 150 ? 'toutes identifiées' : 'partiellement identifiées'}`}
      />
      <View style={styles.actions}>
        <Button label="Voir le débriefing" variant="ghost" onPress={() => router.push(`/results/${caseData.id}`)} style={{ flex: 1 }} />
        <Button label="Rejouer" onPress={onReplay} style={{ flex: 1 }} />
      </View>
    </Card>
  );
}

function ArchiveLine({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.line}>
      <Ionicons name={icon} size={14} color={colors.gold} />
      <Text style={styles.lineText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink, padding: spacing.l },
  title: { color: colors.text, fontSize: 24, fontWeight: '900', marginBottom: spacing.s },
  note: { color: colors.secondary, fontSize: 12, lineHeight: 18, marginBottom: spacing.m },
  empty: { color: colors.textDim, fontSize: 13, lineHeight: 19 },
  line: { flexDirection: 'row', alignItems: 'center', gap: spacing.s, paddingVertical: 3 },
  lineText: { color: colors.text, fontSize: 13, flex: 1 },
  actions: { flexDirection: 'row', gap: spacing.s, marginTop: spacing.m },
});
