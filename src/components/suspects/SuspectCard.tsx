import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CaseDef, SuspectDef } from '@/types/case';
import type { InvestigationSave } from '@/types/save';
import { colors, radius, spacing } from '@/theme';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

interface Props {
  caseData: CaseDef;
  suspect: SuspectDef;
  save: InvestigationSave;
  onOpenEvidence?: (evidenceId: string) => void;
  onAddToBoard?: (suspect: SuspectDef) => void;
  onHypothesisChange: (suspectId: string, text: string) => void;
}

const AVATAR_TINTS = ['#C4A66A', '#648B72', '#5C6E86', '#A94747'];

export function SuspectCard({ caseData, suspect, save, onOpenEvidence, onAddToBoard, onHypothesisChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [hypothesis, setHypothesis] = useState(save.suspectHypotheses[suspect.id] ?? '');
  const tint = AVATAR_TINTS[caseData.suspects.findIndex((s) => s.id === suspect.id) % AVATAR_TINTS.length];
  const initials = suspect.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <View style={styles.card}>
      <Pressable onPress={() => setExpanded((v) => !v)} style={styles.head}>
        <View style={[styles.avatar, { borderColor: tint }]}>
          <Text style={[styles.avatarText, { color: tint }]}>{initials}</Text>
        </View>
        <View style={styles.headBody}>
          <Text style={styles.name}>{suspect.name}</Text>
          <Text style={styles.occ}>{suspect.occupation} · {suspect.age} ans</Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
      </Pressable>
      {expanded ? (
        <View style={styles.body}>
          <Text style={styles.section}>Relation avec l'affaire</Text>
          <Text style={styles.text}>{suspect.relation}</Text>
          <Text style={styles.section}>Déclaration officielle</Text>
          <Text style={styles.quote}>{suspect.statement}</Text>
          <Text style={styles.section}>Chronologie connue</Text>
          {suspect.timeline.map((t, i) => (
            <Text key={i} style={styles.bullet}>· {t}</Text>
          ))}
          {suspect.relatedEvidenceIds.length > 0 ? (
            <>
              <Text style={styles.section}>Indices associés (découverts)</Text>
              <View style={styles.evidenceChips}>
                {suspect.relatedEvidenceIds.map((id) => {
                  const ev = caseData.evidence.find((e) => e.id === id);
                  const known = save.discoveredEvidenceIds.includes(id);
                  if (!ev || !known) return null;
                  return (
                    <Pressable key={id} onPress={() => onOpenEvidence?.(id)} style={styles.evChip}>
                      <Text style={styles.evChipText}>{ev.name}</Text>
                    </Pressable>
                  );
                })}
                {suspect.relatedEvidenceIds.every((id) => !save.discoveredEvidenceIds.includes(id)) ? (
                  <Text style={styles.textDim}>Aucun indice associé découvert pour l'instant.</Text>
                ) : null}
              </View>
            </>
          ) : null}
          <Text style={styles.section}>Mon hypothèse</Text>
          <Field
            value={hypothesis}
            onChangeText={(t) => {
              setHypothesis(t);
              onHypothesisChange(suspect.id, t);
            }}
            placeholder="Écrivez votre hypothèse sur ce suspect… (sauvegarde automatique)"
            multiline
          />
          {onAddToBoard ? (
            <View style={styles.actions}>
              <Button label="Ajouter au tableau de déduction" onPress={() => onAddToBoard(suspect)} style={styles.flex} />
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: radius.l, marginBottom: spacing.m, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', padding: spacing.m },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.nightSoft },
  avatarText: { fontSize: 15, fontWeight: '800' },
  headBody: { flex: 1, marginLeft: spacing.m },
  name: { color: colors.text, fontSize: 15, fontWeight: '700' },
  occ: { color: colors.secondary, fontSize: 12, marginTop: 2 },
  chevron: { color: colors.gold, fontSize: 14 },
  body: { paddingHorizontal: spacing.m, paddingBottom: spacing.m },
  section: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: spacing.m, marginBottom: 4 },
  text: { color: colors.text, fontSize: 13 },
  textDim: { color: colors.secondary, fontSize: 12 },
  quote: { color: colors.text, fontSize: 13, fontStyle: 'italic' },
  bullet: { color: colors.textDim, fontSize: 12, marginTop: 3 },
  evidenceChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s },
  evChip: { backgroundColor: colors.goldSoft, borderColor: colors.gold, borderWidth: 1, borderRadius: radius.s, paddingHorizontal: spacing.s, paddingVertical: 4 },
  evChipText: { color: colors.gold, fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: spacing.s, marginTop: spacing.m },
  flex: { flex: 1 },
});
