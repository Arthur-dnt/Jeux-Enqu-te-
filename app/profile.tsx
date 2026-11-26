import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors, radius, spacing } from '@/theme';
import { useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';
import { getRankProgress } from '@/features/progression/progressionService';
import { isSupabaseConfigured } from '@/services/supabase/client';
import { signIn, signUp } from '@/services/sync/syncService';
import { formatElapsed } from '@/utils/time';
import type { SyncStatus } from '@/services/sync/syncService';

export default function ProfileScreen() {
  const profile = useProfileStore((s) => s.profile);
  const scores = useProfileStore((s) => s.scores);
  const setPseudo = useProfileStore((s) => s.setPseudo);
  const { reduceMotion, toggleReduceMotion } = useSettingsStore();
  const { rank, next, ratio } = getRankProgress(profile?.xp ?? 0);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authStatus, setAuthStatus] = useState<{ status: SyncStatus; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const runAuth = async (action: 'in' | 'up') => {
    setBusy(true);
    setAuthStatus(null);
    try {
      const result = action === 'in' ? await signIn(email, password) : await signUp(email, password);
      setAuthStatus({ status: result.status, message: result.message });
    } catch {
      setAuthStatus({ status: 'error', message: 'Connexion impossible pour le moment.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.title}>Profil</Text>

      <Card title="Identité de l'enquêteur">
        <Text style={styles.label}>Pseudonyme (utilisé dans les classements)</Text>
        <Field
          value={profile?.pseudo ?? ''}
          onChangeText={setPseudo}
          placeholder="Enquêteur anonyme"
          style={{ marginTop: spacing.s }}
        />
        <Text style={styles.sub}>Enregistré automatiquement après chaque modification.</Text>
      </Card>

      <Card title={`Rang : ${rank.name}`}>
        <Text style={styles.text}>
          {profile?.xp ?? 0} XP{next ? ` · ${next.name} à ${next.minXp} XP` : ' · rang maximum atteint'}
        </Text>
        <ProgressBar ratio={ratio} />
      </Card>

      <SectionHeader title="Réglages" />
      <Card>
        <SettingRow
          label="Réduire les animations"
          hint="Remplace les transitions glissantes par des transitions discrètes."
          value={reduceMotion}
          onToggle={toggleReduceMotion}
        />
      </Card>

      <SectionHeader title="Compte & synchronisation (Supabase)" />
      <Card>
        {isSupabaseConfigured ? (
          <>
            <Text style={styles.label}>E-mail</Text>
            <Field value={email} onChangeText={setEmail} placeholder="vous@exemple.fr" autoCapitalize="none" style={{ marginTop: spacing.s }} />
            <Text style={styles.label}>Mot de passe</Text>
            <Field value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry style={{ marginTop: spacing.s }} />
            <View style={styles.row}>
              <Button label="Se connecter" onPress={() => runAuth('in')} disabled={busy || !email || !password} style={{ flex: 1 }} />
              <Button label="Créer un compte" variant="ghost" onPress={() => runAuth('up')} disabled={busy || !email || !password} style={{ flex: 1 }} />
            </View>
            {authStatus ? (
              <Text style={[styles.sub, authStatus.status === 'error' && styles.errorText]}>{authStatus.message}</Text>
            ) : (
              <Text style={styles.sub}>Le jeu reste entièrement jouable hors connexion, avec ou sans compte.</Text>
            )}
          </>
        ) : (
          <Text style={styles.sub}>
            Supabase n'est pas configuré : le jeu fonctionne en mode 100 % local. Pour activer les comptes, la
            synchronisation et le classement en ligne, renseignez EXPO_PUBLIC_SUPABASE_URL et
            EXPO_PUBLIC_SUPABASE_ANON_KEY (voir README).
          </Text>
        )}
      </Card>

      <SectionHeader title="Historique des scores" />
      {scores.length === 0 ? (
        <Card>
          <Text style={styles.empty}>Aucun score enregistré. Résolvez une enquête pour alimenter votre historique.</Text>
        </Card>
      ) : (
        <View style={styles.history}>
          {scores.map((e) => (
            <View key={e.id} style={styles.historyRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyTitle} numberOfLines={1}>
                  {e.caseNumber} — {e.caseTitle}
                </Text>
                <Text style={styles.sub}>
                  {e.kind === 'daily' ? 'Enquête du jour' : 'Enquête'} · {formatElapsed(e.elapsedSeconds)} · {e.hintsUsed} aide(s)
                </Text>
              </View>
              <Text style={styles.historyScore}>{e.score} pts</Text>
            </View>
          ))}
        </View>
      )}

      <Button label="Retour à l'accueil" variant="ghost" onPress={() => router.push('/home')} style={{ marginTop: spacing.m }} />
    </ScrollView>
  );
}

function SettingRow({ label, hint, value, onToggle }: { label: string; hint: string; value: boolean; onToggle: () => void }) {
  return (
    <View style={styles.settingRow}>
      <View style={{ flex: 1, paddingRight: spacing.m }}>
        <Text style={styles.text}>{label}</Text>
        <Text style={styles.sub}>{hint}</Text>
      </View>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: colors.nightSoft, true: colors.goldSoft }} thumbColor={value ? colors.gold : colors.secondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink, padding: spacing.l },
  title: { color: colors.text, fontSize: 24, fontWeight: '900', marginBottom: spacing.m },
  label: { color: colors.secondary, fontSize: 12, fontWeight: '700', marginTop: spacing.s },
  text: { color: colors.text, fontSize: 14 },
  sub: { color: colors.secondary, fontSize: 11, marginTop: 4 },
  errorText: { color: colors.alert },
  row: { flexDirection: 'row', gap: spacing.s, marginTop: spacing.m },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.s },
  history: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: radius.l, padding: spacing.m },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line },
  historyTitle: { color: colors.text, fontSize: 13, fontWeight: '600' },
  historyScore: { color: colors.gold, fontSize: 14, fontWeight: '800', marginLeft: spacing.m },
  empty: { color: colors.textDim, fontSize: 13 },
});
