import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CaseCard } from '@/components/case/CaseCard';
import { colors, radius, spacing } from '@/theme';
import { getDailyCase } from '@/features/cases/dailyService';
import { getCaseStatus } from '@/features/cases/caseStatus';
import { buildLocalLeaderboard } from '@/features/leaderboard/leaderboardService';
import { useProfileStore } from '@/store/profileStore';
import { useInvestigationStore } from '@/store/investigationStore';
import { dayKey, formatElapsed } from '@/utils/time';

export default function DailyScreen() {
  const daily = getDailyCase();
  const today = dayKey();
  const status = getCaseStatus(daily);
  const profile = useProfileStore((s) => s.profile);
  const scores = useProfileStore((s) => s.scores);
  const save = useInvestigationStore((s) => s.save);

  const dailyRows = buildLocalLeaderboard(
    'daily',
    { pseudo: profile?.pseudo ?? 'Enquêteur', xp: profile?.xp ?? 0, entries: scores.filter((e) => e.kind === 'daily') },
    (e) => e.kind === 'daily' && e.dayKey === today
  );

  const myResult = scores.find((e) => e.kind === 'daily' && e.dayKey === today);
  const active = Boolean(save && save.caseId === daily.id && save.status === 'active');

  const start = () => {
    if (!active) {
      useInvestigationStore.getState().startCase(daily, 'daily');
    }
    router.push(`/investigation/${daily.id}`);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.title}>Enquête du jour</Text>
      <Text style={styles.date}>Journée du {today}</Text>
      <Text style={styles.note}>
        Tous les joueurs reçoivent la même affaire aujourd'hui. Le classement du jour compare les scores obtenus sur ce
        dossier ; à égalité de score, c'est le temps le plus court qui départage.
      </Text>

      <CaseCard caseData={daily} status={status} dailyBadge onPress={() => router.push(`/cases/${daily.id}`)} />

      {myResult ? (
        <Card title="Votre résultat du jour">
          <Text style={styles.text}>
            {myResult.score} / 1000 points en {formatElapsed(myResult.elapsedSeconds)} · XP déjà crédité.
          </Text>
          <Text style={styles.sub}>Vous pouvez rejouer le dossier : seul votre meilleur score du jour est conservé au classement.</Text>
          <Button label="Rejouer" variant="ghost" onPress={start} style={{ marginTop: spacing.m }} />
        </Card>
      ) : (
        <Button label={active ? "Reprendre l'enquête du jour" : "Lancer l'enquête du jour"} onPress={start} />
      )}

      <SectionHeader title="Classement du jour (mode local)" />
      <Text style={styles.demo}>
        Mode local : les lignes « démo » sont des scores factices d'illustration. Configurez Supabase pour un classement en
        ligne réel, identique pour tous les joueurs.
      </Text>
      <View style={styles.board}>
        {dailyRows.rows.map((r) => (
          <View key={`${r.pseudo}-${r.position}`} style={[styles.row, r.isLocalPlayer && styles.rowMe]}>
            <Text style={styles.pos}>#{r.position}</Text>
            <Text style={styles.avatar}>{r.avatar}</Text>
            <Text style={[styles.pseudo, r.isLocalPlayer && styles.pseudoMe]} numberOfLines={1}>
              {r.pseudo}
              {r.isLocalPlayer ? ' (vous)' : ''}
            </Text>
            <Text style={styles.score}>{r.score} pts</Text>
          </View>
        ))}
      </View>

      <Button label="Retour à l'accueil" variant="ghost" onPress={() => router.push('/home')} style={{ marginTop: spacing.m }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink, padding: spacing.l },
  title: { color: colors.text, fontSize: 24, fontWeight: '900' },
  date: { color: colors.gold, fontSize: 13, fontWeight: '700', marginTop: 2 },
  note: { color: colors.secondary, fontSize: 12, lineHeight: 18, marginVertical: spacing.m },
  text: { color: colors.text, fontSize: 14, lineHeight: 20 },
  sub: { color: colors.secondary, fontSize: 12, marginTop: 4 },
  demo: { color: colors.secondary, fontSize: 11, marginBottom: spacing.m },
  board: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: radius.l, padding: spacing.m },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line },
  rowMe: { backgroundColor: colors.goldSoft },
  pos: { color: colors.secondary, width: 38, fontSize: 13, fontWeight: '700' },
  avatar: { fontSize: 16, width: 26 },
  pseudo: { color: colors.text, fontSize: 13, flex: 1, fontWeight: '600' },
  pseudoMe: { color: colors.gold },
  score: { color: colors.text, fontSize: 13, fontWeight: '800' },
});
