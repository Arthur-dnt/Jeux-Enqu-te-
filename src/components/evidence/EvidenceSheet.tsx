import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CaseDef, EvidenceDef } from '@/types/case';
import { EVIDENCE_CATEGORY_LABELS } from '@/types/case';
import { colors, radius, spacing } from '@/theme';
import { Button } from '@/components/ui/Button';
import { useInvestigationStore } from '@/store/investigationStore';

interface Props {
  caseData: CaseDef;
  evidence: EvidenceDef;
  onClose: () => void;
}

export function EvidenceSheet({ caseData, evidence, onClose }: Props) {
  const addEvidenceNode = useInvestigationStore((s) => s.addEvidenceNode);
  const scene = caseData.scenes.find((s) => s.id === evidence.sceneId);
  const onBoard = useInvestigationStore(
    (s) => s.save?.nodes.some((n) => n.kind === 'evidence' && n.refId === evidence.id) ?? false
  );

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      <View style={styles.iconBox}>
        <Ionicons name={evidence.icon as keyof typeof Ionicons.glyphMap} size={42} color={colors.gold} />
      </View>
      <Text style={styles.name}>{evidence.name}</Text>
      <Text style={styles.category}>{EVIDENCE_CATEGORY_LABELS[evidence.category]}</Text>
      <Text style={styles.section}>Observation</Text>
      <Text style={styles.text}>{evidence.description}</Text>
      <Text style={styles.section}>Examen détaillé</Text>
      <Text style={styles.text}>{evidence.detail}</Text>
      {evidence.metadata ? (
        <>
          <Text style={styles.section}>Mentions</Text>
          {Object.entries(evidence.metadata).map(([k, v]) => (
            <Text key={k} style={styles.meta}>· {k} : {v}</Text>
          ))}
        </>
      ) : null}
      <Text style={styles.section}>Lieu de découverte</Text>
      <Text style={styles.text}>{scene?.name ?? '—'}</Text>
      <View style={styles.actions}>
        <Button label="Ajouter au tableau" onPress={() => addEvidenceNode(evidence.id, evidence.name, evidence.description)} style={styles.flex} />
        <Button label="Retour à la scène" variant="ghost" onPress={onClose} style={styles.flex} />
      </View>
      {onBoard ? <Text style={styles.boardNote}>Cet indice est déjà sur votre tableau de déduction.</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  iconBox: { alignItems: 'center', paddingVertical: spacing.l, backgroundColor: colors.surface, borderRadius: radius.l, marginBottom: spacing.m },
  name: { color: colors.text, fontSize: 18, fontWeight: '800' },
  category: { color: colors.gold, fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginTop: 2, marginBottom: spacing.s },
  section: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: spacing.m, marginBottom: 4 },
  text: { color: colors.text, fontSize: 14, lineHeight: 20 },
  meta: { color: colors.textDim, fontSize: 13 },
  actions: { flexDirection: 'row', gap: spacing.s, marginTop: spacing.xl },
  flex: { flex: 1 },
  boardNote: { color: colors.secondary, fontSize: 12, textAlign: 'center', marginTop: spacing.s },
});
