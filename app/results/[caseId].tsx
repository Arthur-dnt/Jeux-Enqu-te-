import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, radius, spacing } from '@/theme';
import { requireCase } from '@/features/cases/caseRegistry';
import { useInvestigationStore } from '@/store/investigationStore';
import { useProfileStore } from '@/store/profileStore';
import { scoreAccusation, type ScoreResult } from '@/features/scoring/scoringService';
import { xpForScore } from '@/features/progression/progressionService';
import { formatElapsed } from '@/utils/time';

export default function ResultsScreen() {
  const { caseId } = useLocalSearchParams<{ caseId: string }>();
  const caseData = requireCase(caseId);
  const save = useInvestigationStore((s) => (s.caseId === caseData.id ? s.save : null));
  const best = useProfileStore((s) => s.bestPerformanceForCase(caseData.id));

  if (!save || !save.lastResult) {
    return (
      <Screen>
        <Text style={styles.title}>Aucun résultat disponible</Text>
        <Text style={styles.text}>Terminez d'abord l'enquête pour consulter son débriefing.</Text>
        <Button label="Retour à l'accueil" onPress={() => router.replace('/home')} style={{ marginTop: spacing.l }} />
      </Screen>
    );
  }

  const last = save.lastResult;
  const result: ScoreResult = scoreAccusation(caseData, {
    culpritId: last.culpritId,
    motiveId: last.motiveId,
    methodStepIds: last.methodStepIds,
    evidenceIds: last.evidenceIds,
    hintsUsed: save.hintsUsed,
  });
  const b = result.breakdown;
  const xpGain = xpForScore(b.total, caseData.difficulty);
  const culprit = caseData.suspects.find((s) => s.id === caseData.solution.culpritId);
  const motive = caseData.motives.find((m) => m.id === caseData.solution.motiveId);
  const won = b.total >= 700;

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={[styles.verdict, won ? styles.verdictWon : styles.verdictLost]}>
        <Ionicons name={won ? 'shield-checkmark' : 'shield-outline'} size={30} color={won ? colors.success : colors.alert} />
        <Text style={styles.verdictTitle}>{won ? 'Affaire résolue' : 'Dossier classé — culpabilité non démontrée'}</Text>
        <Text style={styles.verdictScore}>{b.total} / 1000 points</Text>
        <Text style={styles.verdictMeta}>
          Temps : {formatElapsed(save.elapsedSeconds)} · Aides utilisées : {save.hintsUsed} · +{xpGain} XP
        </Text>
      </View>

      <SectionHeader title="Détail du score" />
      <Card>
        <ScoreRow label="Coupable identifié" points={b.culprit} max={400} />
        <ScoreRow label="Mobile identifié" points={b.motive} max={200} />
        <ScoreRow label="Méthode reconstituée" points={b.method} max={200} />
        <ScoreRow label="Preuves décisives" points={b.evidence} max={150} />
        <ScoreRow label="Bonus sans aide" points={b.noHintBonus} max={50} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{b.total} / 1000</Text>
        </View>
      </Card>

      <SectionHeader title="Vérité officielle du dossier" />
      <Card title="Coupable">
        <Text style={styles.text}>
          {culprit ? `${culprit.name} — ${culprit.occupation}` : '—'}
        </Text>
      </Card>
      <Card title="Mobile">
        <Text style={styles.text}>{motive?.label ?? '—'}</Text>
      </Card>
      <Card title="Méthode reconstituée">
        {caseData.solution.methodStepIds.map((id) => {
          const step = caseData.methodSteps.find((m) => m.id === id);
          const hit = result.correctMethodStepIds.includes(id);
          return (
            <View key={id} style={styles.lineRow}>
              <Ionicons name={hit ? 'checkmark-circle' : 'ellipse-outline'} size={15} color={hit ? colors.success : colors.secondary} />
              <Text style={styles.lineText}>{step?.label ?? id}</Text>
            </View>
          );
        })}
      </Card>

      <Card title="Raisonnement complet">
        <Text style={styles.text}>{caseData.solution.explanation}</Text>
      </Card>

      <SectionHeader title="Preuves décisives" />
      {caseData.solution.decisiveEvidenceIds.map((id) => {
        const ev = caseData.evidence.find((e) => e.id === id);
        const hit = result.correctEvidenceIds.includes(id);
        return (
          <Card key={id}>
            <View style={styles.lineRow}>
              <Ionicons name={hit ? 'checkmark-circle' : 'help-circle-outline'} size={15} color={hit ? colors.success : colors.alert} />
              <Text style={styles.lineText}>{ev?.name ?? id}</Text>
            </View>
            {ev ? <Text style={styles.sub}>{ev.description}</Text> : null}
          </Card>
        );
      })}

      {result.wrongEvidenceIds.length > 0 ? (
        <>
          <SectionHeader title="Mauvaises déductions" />
          <Card>
            {result.wrongEvidenceIds.map((id) => (
              <Text key={id} style={styles.wrong}>
                · {caseData.evidence.find((e) => e.id === id)?.name ?? id} — ne démontre pas la culpabilité à elle seule.
              </Text>
            ))}
          </Card>
        </>
      ) : null}

      <SectionHeader title="Élément post-résolution" />
      <Card title={caseData.solution.postResolutionReveal.evidenceName}>
        <Text style={styles.text}>{caseData.solution.postResolutionReveal.text}</Text>
      </Card>

      {best.plays > 1 ? (
        <Text style={styles.best}>Votre meilleur score sur ce dossier : {best.bestScore} / 1000</Text>
      ) : null}

      <View style={styles.actions}>
        <Button label="Retour à l'accueil" onPress={() => router.replace('/home')} />
        <Button label="Consulter les archives" variant="ghost" onPress={() => router.replace('/archives')} />
      </View>
    </ScrollView>
  );
}

function ScoreRow({ label, points, max }: { label: string; points: number; max: number }) {
  return (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={[styles.scorePoints, points === 0 && styles.scoreZero]}>
        {points} / {max}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink, padding: spacing.l },
  title: { color: colors.text, fontSize: 20, fontWeight: '900', marginBottom: spacing.s },
  text: { color: colors.text, fontSize: 14, lineHeight: 20 },
  sub: { color: colors.secondary, fontSize: 12, marginTop: 4, marginLeft: 21 },
  verdict: {
    borderRadius: radius.l,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  verdictWon: { backgroundColor: colors.successSoft, borderColor: colors.success },
  verdictLost: { backgroundColor: colors.alertSoft, borderColor: colors.alert },
  verdictTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: spacing.s, textAlign: 'center' },
  verdictScore: { color: colors.gold, fontSize: 26, fontWeight: '900', marginTop: spacing.s },
  verdictMeta: { color: colors.secondary, fontSize: 12, marginTop: spacing.xs },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: colors.line },
  scoreLabel: { color: colors.textDim, fontSize: 13 },
  scorePoints: { color: colors.text, fontSize: 13, fontWeight: '700' },
  scoreZero: { color: colors.alert },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.m },
  totalLabel: { color: colors.text, fontSize: 14, fontWeight: '800' },
  totalValue: { color: colors.gold, fontSize: 14, fontWeight: '900' },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s, marginTop: 5 },
  lineText: { color: colors.text, fontSize: 13, flex: 1 },
  wrong: { color: colors.alert, fontSize: 13, marginTop: 4 },
  best: { color: colors.secondary, fontSize: 12, textAlign: 'center', marginVertical: spacing.m },
  actions: { gap: spacing.s, marginTop: spacing.l },
});
