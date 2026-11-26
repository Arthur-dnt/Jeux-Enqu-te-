import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FixedScreen } from '@/components/ui/Screen';
import { ModalSheet } from '@/components/ui/Modal';
import { SceneViewer } from '@/components/scene/SceneViewer';
import { EvidenceSheet } from '@/components/evidence/EvidenceSheet';
import { MapModal } from '@/components/case/MapModal';
import { Notebook } from '@/components/notebook/Notebook';
import { colors, radius, spacing } from '@/theme';
import { requireCase } from '@/features/cases/caseRegistry';
import { useInvestigationStore } from '@/store/investigationStore';
import { useSettingsStore } from '@/store/settingsStore';
import { undiscoveredHotspotsInScene } from '@/features/investigation/discoveryService';
import { formatElapsed } from '@/utils/time';
import type { Hotspot } from '@/types/case';
import type { SceneViewState } from '@/types/save';

export default function InvestigationScreen() {
  const { caseId } = useLocalSearchParams<{ caseId: string }>();
  const caseData = requireCase(caseId);
  const save = useInvestigationStore((s) => s.save);
  const activeEvidenceId = useInvestigationStore((s) => s.activeEvidenceId);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  const [showMap, setShowMap] = useState(false);
  const [showNotebook, setShowNotebook] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [hintMode, setHintMode] = useState(false);

  useEffect(() => {
    if (!save || save.caseId !== caseData.id) {
      useInvestigationStore.getState().startCase(caseData);
    }
  }, [caseData, save]);

  useEffect(() => {
    if (!save || save.caseId !== caseData.id) return;
    const timer = setInterval(() => {
      useInvestigationStore.getState().addElapsed(5);
    }, 5000);
    return () => clearInterval(timer);
  }, [caseData, save?.caseId]);

  if (!save || save.caseId !== caseData.id) {
    return <View style={styles.loading}><Text style={styles.loadingText}>Ouverture du dossier…</Text></View>;
  }

  const scene = caseData.scenes.find((s) => s.id === save.currentSceneId) ?? caseData.scenes[0];
  const undiscovered = undiscoveredHotspotsInScene(caseData, save, scene.id);
  const activeEvidence = activeEvidenceId ? caseData.evidence.find((e) => e.id === activeEvidenceId) : null;

  const handleHotspotPress = (hotspot: Hotspot) => {
    const evidence = hotspot.evidenceId ? caseData.evidence.find((e) => e.id === hotspot.evidenceId) : undefined;
    useInvestigationStore.getState().examineHotspot(hotspot.id, evidence?.id);
    if (evidence) {
      useInvestigationStore.getState().setActiveEvidence(evidence.id);
      setShowEvidence(true);
    }
  };

  const handleViewChange = (view: SceneViewState) => {
    useInvestigationStore.getState().setSceneView(scene.id, view);
  };

  return (
    <FixedScreen style={{ paddingHorizontal: spacing.s }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} accessibilityLabel="Retour">
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.dossier}>DOSSIER {caseData.number}</Text>
          <Text style={styles.sceneName} numberOfLines={1}>{scene.name}</Text>
        </View>
        <Text style={styles.timer}>{formatElapsed(save.elapsedSeconds)}</Text>
      </View>

      <View style={styles.stage}>
        <SceneViewer
          key={scene.id}
          scene={scene}
          initialView={save.sceneViews[scene.id] ?? { scale: 1, translateX: 0, translateY: 0 }}
          hintMode={hintMode}
          undiscoveredHotspotIds={undiscovered.map((h) => h.id)}
          onHotspotPress={handleHotspotPress}
          onViewChange={handleViewChange}
        />
      </View>

      <View style={styles.toolbar}>
        <ToolButton icon="map-outline" label="Lieux" onPress={() => setShowMap(true)} />
        <ToolButton icon="book-outline" label="Carnet" onPress={() => setShowNotebook(true)} badge={`${save.discoveredEvidenceIds.length}/${caseData.evidence.length}`} />
        <ToolButton
          icon="bulb-outline"
          label="Aide"
          onPress={() => {
            useInvestigationStore.getState().useHint();
            setHintMode(true);
          }}
          active={hintMode}
        />
        <ToolButton icon="people-outline" label="Suspects" onPress={() => setShowNotebook(true)} />
        <ToolButton
          icon="finger-print-outline"
          label="Accuser"
          onPress={() => router.push(`/accusation/${caseData.id}`)}
          accent
        />
      </View>

      <ModalSheet visible={showMap} title="Carte des lieux" onClose={() => setShowMap(false)} animationType={reduceMotion ? 'fade' : 'slide'}>
        <MapModal
          caseData={caseData}
          save={save}
          onSelectScene={(sceneId) => {
            useInvestigationStore.getState().enterScene(sceneId);
            setHintMode(false);
            setShowMap(false);
          }}
        />
      </ModalSheet>

      <ModalSheet visible={showNotebook} title="Carnet d'enquête" onClose={() => setShowNotebook(false)} full animationType={reduceMotion ? 'fade' : 'slide'}>
        <Notebook
          caseData={caseData}
          save={save}
          onOpenEvidence={(id) => {
            useInvestigationStore.getState().setActiveEvidence(id);
            setShowNotebook(false);
            setShowEvidence(true);
          }}
        />
      </ModalSheet>

      <ModalSheet visible={showEvidence && activeEvidence !== null} title="Fiche d'indice" onClose={() => setShowEvidence(false)} animationType={reduceMotion ? 'fade' : 'slide'}>
        {activeEvidence ? <EvidenceSheet caseData={caseData} evidence={activeEvidence} onClose={() => setShowEvidence(false)} /> : null}
      </ModalSheet>

      {hintMode && undiscovered.length === 0 ? (
        <Text style={styles.hintDone}>Tout a été examiné dans cette scène.</Text>
      ) : null}
      {hintMode ? (
        <Pressable style={styles.hintOff} onPress={() => setHintMode(false)}>
          <Text style={styles.hintOffText}>Désactiver le mode aide</Text>
        </Pressable>
      ) : null}
      {save.status === 'solved' && save.lastResult ? (
        <Pressable style={styles.solvedBar} onPress={() => router.replace(`/results/${caseData.id}`)}>
          <Text style={styles.solvedText}>Affaire résolue — voir le résultat ({save.lastResult.breakdown.total} pts)</Text>
        </Pressable>
      ) : null}
    </FixedScreen>
  );
}

function ToolButton({
  icon,
  label,
  onPress,
  badge,
  accent,
  active,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  badge?: string;
  accent?: boolean;
  active?: boolean;
}) {
  return (
    <Pressable style={[styles.tool, accent && styles.toolAccent, active && styles.toolActive]} onPress={onPress}>
      <Ionicons name={icon} size={19} color={accent ? colors.text : colors.gold} />
      <Text style={[styles.toolLabel, accent && styles.toolLabelAccent]}>{label}</Text>
      {badge ? <Text style={styles.toolBadge}>{badge}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.secondary },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.s },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, marginLeft: spacing.m },
  dossier: { color: colors.secondary, fontSize: 10, letterSpacing: 2, fontWeight: '700' },
  sceneName: { color: colors.text, fontSize: 16, fontWeight: '800' },
  timer: { color: colors.gold, fontSize: 13, fontWeight: '700', marginLeft: spacing.s },
  stage: { flex: 1 },
  toolbar: { flexDirection: 'row', gap: spacing.xs, paddingVertical: spacing.s },
  tool: { flex: 1, backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: radius.m, alignItems: 'center', paddingVertical: spacing.s },
  toolAccent: { backgroundColor: colors.alert, borderColor: colors.alert },
  toolActive: { backgroundColor: colors.goldSoft, borderColor: colors.gold },
  toolLabel: { color: colors.textDim, fontSize: 10, fontWeight: '700', marginTop: 2 },
  toolLabelAccent: { color: colors.text },
  toolBadge: { color: colors.gold, fontSize: 9, fontWeight: '800', marginTop: 1 },
  hintDone: { color: colors.success, fontSize: 12, textAlign: 'center', paddingBottom: spacing.s },
  hintOff: { alignItems: 'center', paddingVertical: spacing.s },
  hintOffText: { color: colors.secondary, fontSize: 12 },
  solvedBar: { backgroundColor: colors.successSoft, borderColor: colors.success, borderWidth: 1, borderRadius: radius.m, alignItems: 'center', padding: spacing.m, marginTop: spacing.s },
  solvedText: { color: colors.success, fontWeight: '700', fontSize: 13 },
});
