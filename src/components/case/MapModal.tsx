import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CaseDef } from '@/types/case';
import type { InvestigationSave } from '@/types/save';
import { colors, radius, spacing } from '@/theme';
import { evidenceCountForScene } from '@/features/investigation/discoveryService';

interface Props {
  caseData: CaseDef;
  save: InvestigationSave;
  onSelectScene: (sceneId: string) => void;
}

export function MapModal({ caseData, save, onSelectScene }: Props) {
  return (
    <View>
      <Text style={styles.plan}>{caseData.locationName}</Text>
      {caseData.scenes.map((scene) => {
        const visited = save.visitedScenes.includes(scene.id);
        const current = save.currentSceneId === scene.id;
        const found = evidenceCountForScene(caseData, save, scene.id);
        const totalSceneEvidence = caseData.evidence.filter((e) => e.sceneId === scene.id).length;
        return (
          <Pressable
            key={scene.id}
            style={[styles.room, current && styles.roomCurrent, !visited && styles.roomUnvisited]}
            onPress={() => onSelectScene(scene.id)}
          >
            <View style={styles.roomHead}>
              <Text style={styles.roomName}>{scene.name}</Text>
              {current ? <Text style={styles.badgeCurrent}>Ici</Text> : null}
            </View>
            <Text style={styles.roomDesc}>{scene.description}</Text>
            <Text style={styles.roomMeta}>
              {visited ? 'Visité' : 'Non visité'} · {found}/{totalSceneEvidence} indices découverts
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  plan: { color: colors.gold, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: spacing.m },
  room: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: radius.m, padding: spacing.m, marginBottom: spacing.s },
  roomCurrent: { borderColor: colors.gold, backgroundColor: colors.goldSoft },
  roomUnvisited: { opacity: 0.75 },
  roomHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  badgeCurrent: { color: colors.gold, fontSize: 11, fontWeight: '800' },
  roomDesc: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  roomMeta: { color: colors.secondary, fontSize: 11, marginTop: 4 },
});
