import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { colors, radius, spacing } from '@/theme';
import { buildLocalLeaderboard, type LeaderboardRow } from '@/features/leaderboard/leaderboardService';
import { fetchOnlineLeaderboard } from '@/features/leaderboard/supabaseLeaderboard';
import { useProfileStore } from '@/store/profileStore';
import { dayKey, weekKey, formatElapsed } from '@/utils/time';
import type { ScoreHistoryEntry } from '@/types/player';

const TABS = [
  { id: 'daily', label: 'Jour' },
  { id: 'weekly', label: 'Semaine' },
  { id: 'global', label: 'Général' },
] as const;

type Scope = (typeof TABS)[number]['id'];

interface OnlineResult {
  available: boolean;
  message: string;
  rows: LeaderboardRow[];
}

export default function LeaderboardScreen() {
  const [scope, setScope] = useState<Scope>('daily');
  const profile = useProfileStore((s) => s.profile);
  const scores = useProfileStore((s) => s.scores);
  const [online, setOnline] = useState<OnlineResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const periodKey = scope === 'daily' ? dayKey() : scope === 'weekly' ? weekKey() : null;
    fetchOnlineLeaderboard(scope, periodKey)
      .then((res) => {
        if (!cancelled) setOnline(res);
      })
      .catch(() => {
        if (!cancelled) setOnline({ available: false, message: 'Classement en ligne temporairement indisponible.', rows: [] });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [scope]);

  const weekStartIso = new Date(Date.now() - 7 * 86400000).toISOString();
  const filter =
    scope === 'daily'
      ? (e: ScoreHistoryEntry) => e.kind === 'daily' && e.dayKey === dayKey()
      : scope === 'weekly'
        ? (e: ScoreHistoryEntry) => e.createdAt >= weekStartIso
        : () => true;

  const local = buildLocalLeaderboard(
    scope,
    { pseudo: profile?.pseudo ?? 'Enquêteur', xp: profile?.xp ?? 0, entries: scores },
    filter
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.title}>Classements</Text>

      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Button
            key={t.id}
            label={t.label}
            variant={scope === t.id ? 'primary' : 'ghost'}
            onPress={() => setScope(t.id)}
            style={{ flex: 1, minHeight: 40, paddingVertical: 8 }}
          />
        ))}
      </View>

      {loading && !online ? <Text style={styles.info}>Consultation du classement en ligne…</Text> : null}
      {online && !online.available ? <Text style={styles.info}>{online.message}</Text> : null}
      {online && online.available ? <OnlineBoard online={online} scope={scope} /> : null}

      <Text style={styles.demo}>Classement local de démonstration — scores factices clairement identifiés.</Text>
      <View style={styles.board}>
        {local.rows.map((r) => (
          <View key={`${r.pseudo}-${r.position}-${r.score}`} style={[styles.row, r.isLocalPlayer && styles.rowMe]}>
            <Text style={styles.pos}>#{r.position}</Text>
            <Text style={styles.avatar}>{r.avatar}</Text>
            <View style={styles.center}>
              <Text style={[styles.pseudo, r.isLocalPlayer && styles.pseudoMe]} numberOfLines={1}>
                {r.pseudo}
                {r.isLocalPlayer ? ' (vous)' : ''}
              </Text>
              <Text style={styles.sub}>Niveau {r.level}</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.score}>{r.score} pts</Text>
              <Text style={styles.sub}>{formatElapsed(r.elapsedSeconds ?? 0)}</Text>
            </View>
          </View>
        ))}
        {local.rows.length === 0 ? <Text style={styles.empty}>Aucun score enregistré pour cette période.</Text> : null}
      </View>

      <Button label="Retour à l'accueil" variant="ghost" onPress={() => router.push('/home')} style={{ marginTop: spacing.m }} />
    </ScrollView>
  );
}

function OnlineBoard({ online, scope }: { online: OnlineResult; scope: Scope }) {
  return (
    <View style={styles.board}>
      <Text style={styles.onlineTitle}>Classement en ligne ({scope})</Text>
      {online.rows.map((r) => (
        <View key={`${r.pseudo}-${r.position}`} style={styles.row}>
          <Text style={styles.pos}>#{r.position}</Text>
          <Text style={styles.avatar}>{r.avatar}</Text>
          <View style={styles.center}>
            <Text style={styles.pseudo} numberOfLines={1}>
              {r.pseudo}
            </Text>
            <Text style={styles.sub}>Niveau {r.level}</Text>
          </View>
          <Text style={styles.score}>{r.score} pts</Text>
        </View>
      ))}
      {online.rows.length === 0 ? <Text style={styles.empty}>Aucune entrée en ligne pour cette période.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink, padding: spacing.l },
  title: { color: colors.text, fontSize: 24, fontWeight: '900', marginBottom: spacing.m },
  tabs: { flexDirection: 'row', gap: spacing.s, marginBottom: spacing.m },
  info: { color: colors.secondary, fontSize: 12, marginBottom: spacing.m },
  demo: { color: colors.secondary, fontSize: 11, marginBottom: spacing.s },
  onlineTitle: { color: colors.success, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: spacing.s },
  board: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.l,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line },
  rowMe: { backgroundColor: colors.goldSoft },
  pos: { color: colors.secondary, width: 38, fontSize: 13, fontWeight: '700' },
  avatar: { fontSize: 16, width: 26 },
  center: { flex: 1 },
  right: { alignItems: 'flex-end' },
  pseudo: { color: colors.text, fontSize: 13, fontWeight: '600' },
  pseudoMe: { color: colors.gold },
  sub: { color: colors.secondary, fontSize: 11 },
  score: { color: colors.text, fontSize: 13, fontWeight: '800' },
  empty: { color: colors.secondary, fontSize: 12, textAlign: 'center', paddingVertical: spacing.m },
});
