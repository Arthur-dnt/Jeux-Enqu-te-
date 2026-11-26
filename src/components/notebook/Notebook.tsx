import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { CaseDef } from '@/types/case';
import type { InvestigationSave } from '@/types/save';
import { colors, radius, spacing } from '@/theme';
import { EvidenceTab } from './EvidenceTab';
import { NotesTab } from './NotesTab';
import { SuspectCard } from '@/components/suspects/SuspectCard';
import { DeductionBoard, ConnectionEditor } from '@/components/deduction-board/DeductionBoard';
import { useInvestigationStore } from '@/store/investigationStore';
import type { DeductionConnection } from '@/types/save';

const TABS = [
  { id: 'evidence', label: 'Indices' },
  { id: 'notes', label: 'Notes' },
  { id: 'suspects', label: 'Suspects' },
  { id: 'board', label: 'Tableau' },
] as const;

type TabId = (typeof TABS)[number]['id'];

interface Props {
  caseData: CaseDef;
  save: InvestigationSave;
  onOpenEvidence: (evidenceId: string) => void;
}

export function Notebook({ caseData, save, onOpenEvidence }: Props) {
  const [tab, setTab] = useState<TabId>('evidence');
  const [linkMode, setLinkMode] = useState(false);
  const [pendingFromId, setPendingFromId] = useState<string | null>(null);
  const [editingConnection, setEditingConnection] = useState<DeductionConnection | null>(null);
  const addSuspectNode = useInvestigationStore((s) => s.addSuspectNode);
  const addNoteNode = useInvestigationStore((s) => s.addNoteNode);
  const setHypothesis = useInvestigationStore((s) => s.setHypothesis);

  const handleNodePress = (nodeId: string) => {
    if (!linkMode && !pendingFromId) return;
    if (pendingFromId === null) {
      setPendingFromId(nodeId);
      return;
    }
    if (pendingFromId === nodeId) {
      setPendingFromId(null);
      setLinkMode(false);
      return;
    }
    useInvestigationStore.getState().addConnection(pendingFromId, nodeId, '');
    setPendingFromId(null);
    setLinkMode(false);
  };

  return (
    <View style={styles.root}>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => setTab(t.id)}
            style={[styles.tab, tab === t.id && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.content}>
        {tab === 'evidence' ? <EvidenceTab caseData={caseData} save={save} onOpenEvidence={onOpenEvidence} /> : null}
        {tab === 'notes' ? <NotesTab /> : null}
        {tab === 'suspects' ? (
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {caseData.suspects.map((s) => (
              <SuspectCard
                key={s.id}
                caseData={caseData}
                suspect={s}
                save={save}
                onOpenEvidence={onOpenEvidence}
                onHypothesisChange={setHypothesis}
                onAddToBoard={(suspect) => addSuspectNode(suspect.id, suspect.name, suspect.occupation)}
              />
            ))}
          </ScrollView>
        ) : null}
        {tab === 'board' ? (
          <DeductionBoard
            nodes={save.nodes}
            connections={save.connections}
            linkMode={linkMode}
            pendingFromId={pendingFromId}
            onToggleLinkMode={() => {
              setLinkMode((v) => !v);
              setPendingFromId(null);
            }}
            onNodePress={handleNodePress}
            onAddNote={() => addNoteNode('Nouvelle note', '')}
            onEditConnection={setEditingConnection}
          />
        ) : null}
      </View>
      <ConnectionEditor
        key={editingConnection?.id ?? 'none'}
        connection={editingConnection}
        visible={editingConnection !== null}
        onClose={() => setEditingConnection(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.m, borderWidth: 1, borderColor: colors.line, padding: 3, marginBottom: spacing.m },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.s },
  tabActive: { backgroundColor: colors.nightSoft },
  tabText: { color: colors.textDim, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: colors.gold },
  content: { flex: 1 },
  scrollArea: { flex: 1 },
});
