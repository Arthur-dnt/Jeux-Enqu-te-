import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { FixedScreen } from '@/components/ui/Screen';
import { ModalSheet } from '@/components/ui/Modal';
import { EvidenceSheet } from '@/components/evidence/EvidenceSheet';
import { Notebook } from '@/components/notebook/Notebook';
import { colors, spacing } from '@/theme';
import { requireCase } from '@/features/cases/caseRegistry';
import { useInvestigationStore } from '@/store/investigationStore';

export default function NotebookScreen() {
  const { caseId } = useLocalSearchParams<{ caseId: string }>();
  const caseData = requireCase(caseId);
  const save = useInvestigationStore((s) => (s.caseId === caseData.id ? s.save : null));
  const activeEvidenceId = useInvestigationStore((s) => s.activeEvidenceId);
  const setActiveEvidence = useInvestigationStore((s) => s.setActiveEvidence);

  if (!save) {
    return (
      <FixedScreen>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Aucun carnet ouvert</Text>
          <Text style={styles.emptyText}>Le carnet est disponible pendant une enquête. Ouvrez ou reprenez un dossier d'abord.</Text>
          <Text style={styles.link} onPress={() => router.push('/home')}>
            Retour à l'accueil
          </Text>
        </View>
      </FixedScreen>
    );
  }

  const activeEvidence = activeEvidenceId ? caseData.evidence.find((e) => e.id === activeEvidenceId) : null;

  return (
    <FixedScreen style={{ paddingHorizontal: spacing.l }}>
      <View style={styles.header}>
        <Text style={styles.dossier}>DOSSIER {caseData.number}</Text>
        <Text style={styles.carnet}>Carnet d'enquête</Text>
        <Text style={styles.link} onPress={() => router.back()}>
          Fermer
        </Text>
      </View>
      <Notebook
        caseData={caseData}
        save={save}
        onOpenEvidence={(id) => setActiveEvidence(id)}
      />
      <ModalSheet
        visible={activeEvidence !== null}
        title="Fiche d'indice"
        onClose={() => setActiveEvidence(null)}
      >
        {activeEvidence ? <EvidenceSheet caseData={caseData} evidence={activeEvidence} onClose={() => setActiveEvidence(null)} /> : null}
      </ModalSheet>
    </FixedScreen>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: spacing.s },
  emptyText: { color: colors.secondary, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  header: { flexDirection: 'row', alignItems: 'baseline', paddingVertical: spacing.m },
  dossier: { color: colors.secondary, fontSize: 10, letterSpacing: 2, fontWeight: '700' },
  carnet: { color: colors.text, fontSize: 16, fontWeight: '800', marginLeft: spacing.s, flex: 1 },
  link: { color: colors.gold, fontSize: 13, fontWeight: '600' },
});
