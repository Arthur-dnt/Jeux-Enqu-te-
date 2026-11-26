import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
import { finalizeAccusation } from '@/features/investigation/accusationService';
import { visibleEvidence } from '@/features/investigation/discoveryService';

export default function AccusationScreen() {
  const { caseId } = useLocalSearchParams<{ caseId: string }>();
  const caseData = requireCase(caseId);
  const save = useInvestigationStore((s) => s.save);

  const [culpritId, setCulpritId] = useState<string | null>(null);
  const [motiveId, setMotiveId] = useState<string | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [evidenceIds, setEvidenceIds] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);

  const discovered = useMemo(() => (save ? visibleEvidence(caseData, save) : []), [caseData, save]);

  if (!save || save.caseId !== caseData.id) {
    return (
      <Screen>
        <Text style={styles.title}>Aucune enquête active</Text>
        <Button label="Retour" onPress={() => router.back()} />
      </Screen>
    );
  }

  const toggle = (list: string[], id: string, set: (v: string[]) => void) => {
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const canSubmit = culpritId !== null && motiveId !== null && steps.length > 0 && evidenceIds.length > 0;

  const submit = () => {
    if (!canSubmit || !culpritId || !motiveId) return;
    const { result, entry, xpGain } = finalizeAccusation(caseData, save, {
      culpritId,
      motiveId,
      methodStepIds: steps,
      evidenceIds,
      hintsUsed: save.hintsUsed,
    });
    useInvestigationStore.getState().markSolved({
      culpritId,
      motiveId,
      methodStepIds: steps,
      evidenceIds,
      breakdown: result.breakdown,
      correct: result.correctCulprit && result.correctMotive,
      difficulty: caseData.difficulty,
    });
    useInvestigationStore.getState().setActiveEvidence(null);
    try {
      useProfileStore.getState().recordScore(entry, xpGain);
    } catch (e) {
      console.warn('[score] enregistrement impossible:', e);
    }
    router.replace(`/results/${caseData.id}`);
  };

  if (confirming) {
    return (
      <Screen>
        <Text style={styles.title}>Récapitulatif de l'accusation</Text>
        <Card title="Coupable">
          <Text style={styles.text}>{caseData.suspects.find((s) => s.id === culpritId)?.name}</Text>
        </Card>
        <Card title="Mobile">
          <Text style={styles.text}>{caseData.motives.find((m) => m.id === motiveId)?.label}</Text>
        </Card>
        <Card title="Méthode reconstituée">
          {steps.map((id) => (
            <Text key={id} style={styles.bullet}>· {caseData.methodSteps.find((m) => m.id === id)?.label}</Text>
          ))}
        </Card>
        <Card title={`Preuves retenues (${evidenceIds.length})`}>
          {evidenceIds.map((id) => (
            <Text key={id} style={styles.bullet}>· {caseData.evidence.find((e) => e.id === id)?.name}</Text>
          ))}
        </Card>
        <Text style={styles.warn}>Une fois confirmée, l'accusation est définitive et le score sera calculé.</Text>
        <View style={styles.actions}>
          <Button label="Confirmer mon accusation" variant="danger" onPress={submit} />
          <Button label="Modifier" variant="ghost" onPress={() => setConfirming(false)} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Accusation — Dossier {caseData.number}</Text>
      <Text style={styles.subtitle}>Désignez le coupable, son mobile, sa méthode et les preuves décisives.</Text>

      <SectionHeader title="Le coupable" />
      {caseData.suspects.map((s) => (
        <Selectable key={s.id} label={s.name} sub={s.occupation} selected={culpritId === s.id} onPress={() => setCulpritId(s.id)} />
      ))}

      <SectionHeader title="Le mobile" />
      {caseData.motives.map((m) => (
        <Selectable key={m.id} label={m.label} selected={motiveId === m.id} onPress={() => setMotiveId(m.id)} />
      ))}

      <SectionHeader title="La méthode (sélectionnez toutes les étapes réellement suivies)" />
      {caseData.methodSteps.map((m) => (
        <Selectable
          key={m.id}
          label={m.label}
          selected={steps.includes(m.id)}
          onPress={() => toggle(steps, m.id, setSteps)}
        />
      ))}

      <SectionHeader title={`Les preuves (${evidenceIds.length} retenues sur ${discovered.length} découvertes)`} />
      {discovered.length === 0 ? (
        <Text style={styles.warn}>Vous n'avez découvert aucun indice. Retournez examiner les scènes.</Text>
      ) : (
        discovered.map((e) => (
          <Selectable
            key={e.id}
            label={e.name}
            sub={e.description}
            selected={evidenceIds.includes(e.id)}
            onPress={() => toggle(evidenceIds, e.id, setEvidenceIds)}
          />
        ))
      )}

      <View style={styles.actions}>
        <Button label="Passer au récapitulatif" onPress={() => setConfirming(true)} disabled={!canSubmit} />
        <Button label="Continuer l'enquête" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

function Selectable({
  label,
  sub,
  selected,
  onPress,
}: {
  label: string;
  sub?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.selectable, selected && styles.selectableActive]} onPress={onPress}>
      <View style={styles.selectRow}>
        <Ionicons name={selected ? 'checkbox' : 'square-outline'} size={18} color={selected ? colors.gold : colors.secondary} />
        <View style={styles.selectBody}>
          <Text style={styles.selectLabel}>{label}</Text>
          {sub ? <Text style={styles.selectSub} numberOfLines={2}>{sub}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: '900', marginBottom: spacing.s },
  subtitle: { color: colors.secondary, fontSize: 13, marginBottom: spacing.m },
  text: { color: colors.text, fontSize: 14 },
  bullet: { color: colors.text, fontSize: 13, marginTop: 3 },
  selectable: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: radius.m, padding: spacing.m, marginBottom: spacing.s },
  selectableActive: { borderColor: colors.gold, backgroundColor: colors.goldSoft },
  selectRow: { flexDirection: 'row', alignItems: 'flex-start' },
  selectBody: { flex: 1, marginLeft: spacing.m },
  selectLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
  selectSub: { color: colors.secondary, fontSize: 12, marginTop: 2 },
  warn: { color: colors.alert, fontSize: 12, marginVertical: spacing.s },
  actions: { gap: spacing.s, marginVertical: spacing.xl },
});
