import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { HomeHeader } from '@/components/ui/HomeHeader';
import { CaseCard } from '@/components/case/CaseCard';
import { colors, radius, spacing } from '@/theme';
import { useInvestigationStore } from '@/store/investigationStore';
import { useProfileStore } from '@/store/profileStore';
import { getRankProgress } from '@/features/progression/progressionService';
import { getAllCases, requireCase } from '@/features/cases/caseRegistry';
import { getCaseStatus } from '@/features/cases/caseStatus';
import { getDailyCase } from '@/features/cases/dailyService';
import { dayKey } from '@/utils/time';

export default function HomeScreen() {
  const activeSave = useInvestigationStore((s) => s.save);
  const caseId = useInvestigationStore((s) => s.caseId);
  const profile = useProfileStore((s) => s.profile);
  const { rank, next, ratio } = getRankProgress(profile?.xp ?? 0);

  const daily = getDailyCase();
  const dailyDone = useProfileStore((s) => s.scores.some((e) => e.kind === 'daily' && e.dayKey === dayKey()));
  const activeCase = caseId && activeSave ? requireCase(caseId) : null;

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 60 }}>
      <HomeHeader />
      <View style={styles.rankCard}>
        <View style={styles.rankRow}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankInitial}>{rank.name[0]}</Text>
          </View>
          <View style={styles.rankInfo}>
            <Text style={styles.rankName}>{rank.name}</Text>
            <Text style={styles.rankXp}>{profile?.xp ?? 0} XP{next ? ` · prochain rang : ${next.name}` : ' · rang maximum'}</Text>
          </View>
        </View>
        <ProgressBar ratio={ratio} />
      </View>

      {activeSave && activeCase && activeSave.status === 'active' ? (
        <Card title={`Reprendre — ${activeCase.title}`} subtitle={`${activeSave.discoveredEvidenceIds.length} indices découverts · ${activeSave.visitedScenes.length}/${activeCase.scenes.length} scènes visitées`}>
          <Button label="Reprendre mon enquête" onPress={() => router.push(`/investigation/${activeCase.id}`)} />
        </Card>
      ) : null}

      <SectionHeader title="Enquête du jour" />
      <CaseCard
        caseData={daily}
        status={dailyDone ? 'replayable' : getCaseStatus(daily)}
        dailyBadge
        onPress={() => router.push(`/cases/${daily.id}`)}
      />
      <Link href="/daily" style={styles.link}>
        <Text style={styles.linkText}>Classement du jour →</Text>
      </Link>

      <SectionHeader title="Toutes les enquêtes" />
      {getAllCases().map((c) => (
        <CaseCard key={c.id} caseData={c} status={getCaseStatus(c)} onPress={() => router.push(`/cases/${c.id}`)} />
      ))}

      <SectionHeader title="Bureau de l'enquêteur" />
      <View style={styles.navGrid}>
        <Link href="/cases" asChild>
          <NavTile icon="folder-open-outline" label="Bibliothèque" />
        </Link>
        <Link href="/leaderboard" asChild>
          <NavTile icon="podium-outline" label="Classements" />
        </Link>
        <Link href="/archives" asChild>
          <NavTile icon="archive-outline" label="Archives" />
        </Link>
        <Link href="/profile" asChild>
          <NavTile icon="person-outline" label="Profil" />
        </Link>
      </View>
    </ScrollView>
  );
}

function NavTile({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.tile}>
      <Ionicons name={icon} size={22} color={colors.gold} />
      <Text style={styles.tileText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink, padding: spacing.l },
  rankCard: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: radius.l, padding: spacing.l, marginBottom: spacing.m },
  rankRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.m },
  rankBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.goldSoft, borderWidth: 1.5, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  rankInitial: { color: colors.gold, fontSize: 20, fontWeight: '900' },
  rankInfo: { flex: 1, marginLeft: spacing.m },
  rankName: { color: colors.text, fontSize: 16, fontWeight: '800' },
  rankXp: { color: colors.secondary, fontSize: 12, marginTop: 2 },
  link: { alignSelf: 'flex-end', marginBottom: spacing.s },
  linkText: { color: colors.gold, fontSize: 13, fontWeight: '600' },
  navGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.m },
  tile: {
    flexGrow: 1,
    flexBasis: '46%',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.l,
    padding: spacing.l,
    alignItems: 'center',
  },
  tileText: { color: colors.text, fontSize: 13, fontWeight: '600', marginTop: spacing.s },
});
