import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Svg, { Line as SvgLine } from 'react-native-svg';
import type { DeductionConnection, DeductionNode } from '@/types/save';
import { useInvestigationStore } from '@/store/investigationStore';
import { colors, radius, spacing } from '@/theme';
import { BOARD_NODE_HEIGHT, BOARD_NODE_WIDTH } from '@/constants';
import { Button } from '@/components/ui/Button';
import { ModalSheet } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { clamp } from '@/utils/geometry';

interface Props {
  nodes: DeductionNode[];
  connections: DeductionConnection[];
  linkMode: boolean;
  pendingFromId: string | null;
  onToggleLinkMode: () => void;
  onNodePress: (nodeId: string) => void;
  onAddNote: () => void;
  onEditConnection: (connection: DeductionConnection) => void;
}

const BOARD_SIZE = 1400;

const KIND_COLORS = {
  evidence: colors.gold,
  suspect: colors.alert,
  note: '#5C6E86',
} as const;

export function DeductionBoard({
  nodes,
  connections,
  linkMode,
  pendingFromId,
  onToggleLinkMode,
  onNodePress,
  onAddNote,
  onEditConnection,
}: Props) {
  const moveNode = useInvestigationStore((s) => s.moveNode);
  const boardView = useInvestigationStore((s) => s.save?.boardView) ?? { scale: 1, translateX: 0, translateY: 0 };
  const setBoardView = useInvestigationStore((s) => s.setBoardView);

  const scale = useSharedValue(boardView.scale);
  const translateX = useSharedValue(boardView.translateX);
  const translateY = useSharedValue(boardView.translateY);
  const savedScale = useSharedValue(boardView.scale);
  const savedTranslateX = useSharedValue(boardView.translateX);
  const savedTranslateY = useSharedValue(boardView.translateY);

  const boardGestures = useMemo(() => {
    const pinch = Gesture.Pinch()
      .onUpdate((e) => {
        scale.value = clamp(savedScale.value * e.scale, 0.5, 2);
      })
      .onEnd(() => {
        savedScale.value = scale.value;
        runOnJS(setBoardView)({ scale: scale.value, translateX: translateX.value, translateY: translateY.value });
      });
    const pan = Gesture.Pan()
      .minPointers(2)
      .minDistance(10)
      .onUpdate((e) => {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      })
      .onEnd(() => {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
        runOnJS(setBoardView)({ scale: scale.value, translateX: translateX.value, translateY: translateY.value });
      });
    return Gesture.Simultaneous(pinch, pan);
  }, [setBoardView]);

  const boardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    for (const n of nodes) map.set(n.id, { x: n.x + BOARD_NODE_WIDTH / 2, y: n.y + BOARD_NODE_HEIGHT / 2 });
    return map;
  }, [nodes]);

  return (
    <View style={styles.root}>
      <View style={styles.toolbar}>
        <Button
          label={linkMode ? 'Annuler le lien' : pendingFromId ? 'Choisir la 2ᵈ carte…' : 'Relier deux cartes'}
          onPress={onToggleLinkMode}
          variant={linkMode || pendingFromId ? 'primary' : 'ghost'}
          style={styles.toolbarBtn}
        />
        <Button label="+ Note" onPress={onAddNote} variant="ghost" style={styles.toolbarBtn} />
      </View>
      <View style={styles.boardWrap}>
        <GestureDetector gesture={boardGestures}>
          <Animated.View style={[styles.board, boardStyle]}>
            <Svg width={BOARD_SIZE} height={BOARD_SIZE} style={StyleSheet.absoluteFill} pointerEvents="box-none">
              {connections.map((c) => {
                const from = positions.get(c.fromNodeId);
                const to = positions.get(c.toNodeId);
                if (!from || !to) return null;
                return (
                  <SvgLine
                    key={c.id}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={colors.gold}
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                );
              })}
            </Svg>
            {nodes.map((n) => (
              <BoardNode
                key={n.id}
                node={n}
                selected={pendingFromId === n.id}
                pending={linkMode && !pendingFromId}
                onPress={() => onNodePress(n.id)}
                onCommit={(x, y) => moveNode(n.id, x, y)}
              />
            ))}
            {connections.map((c) => {
              const from = positions.get(c.fromNodeId);
              const to = positions.get(c.toNodeId);
              if (!from || !to) return null;
              return (
                <Pressable
                  key={`lbl-${c.id}`}
                  onPress={() => onEditConnection(c)}
                  style={[
                    styles.connLabel,
                    { left: (from.x + to.x) / 2 - 60, top: (from.y + to.y) / 2 - 14 },
                  ]}
                >
                  <Text style={styles.connText} numberOfLines={2}>
                    {c.comment || '• Lien — toucher pour annoter'}
                  </Text>
                </Pressable>
              );
            })}
          </Animated.View>
        </GestureDetector>
        {nodes.length === 0 ? (
          <View style={styles.empty} pointerEvents="none">
            <Text style={styles.emptyTitle}>Tableau vide</Text>
            <Text style={styles.emptyText}>
              Ajoutez des indices ou des suspects depuis leurs fiches, puis reliez-les pour construire votre raisonnement.
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function BoardNode({
  node,
  selected,
  pending,
  onPress,
  onCommit,
}: {
  node: DeductionNode;
  selected: boolean;
  pending: boolean;
  onPress: () => void;
  onCommit: (x: number, y: number) => void;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(4)
        .onUpdate((e) => {
          translateX.value = e.translationX;
          translateY.value = e.translationY;
        })
        .onEnd(() => {
          runOnJS(onCommit)(Math.max(0, node.x + translateX.value), Math.max(0, node.y + translateY.value));
          translateX.value = 0;
          translateY.value = 0;
        }),
    [node.x, node.y, onCommit]
  );
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));
  const tint = KIND_COLORS[node.kind];
  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.node, { left: node.x, top: node.y, borderColor: selected ? colors.gold : tint }, style]}>
        <Pressable
          onPress={onPress}
          style={styles.nodeBody}
        >
          <Text style={[styles.nodeKind, { color: tint }]}>
            {node.kind === 'evidence' ? 'INDICE' : node.kind === 'suspect' ? 'SUSPECT' : 'NOTE'}
          </Text>
          <Text style={styles.nodeLabel} numberOfLines={2}>{node.label}</Text>
          {node.detail ? <Text style={styles.nodeDetail} numberOfLines={2}>{node.detail}</Text> : null}
        </Pressable>
        {pending ? <View style={[styles.pendingRing, { borderColor: tint }]} /> : null}
      </Animated.View>
    </GestureDetector>
  );
}

export function ConnectionEditor({
  connection,
  visible,
  onClose,
}: {
  connection: DeductionConnection | null;
  visible: boolean;
  onClose: () => void;
}) {
  const updateConnection = useInvestigationStore((s) => s.updateConnection);
  const removeConnection = useInvestigationStore((s) => s.removeConnection);
  const [comment, setComment] = useState(connection?.comment ?? '');
  const key = connection?.id ?? 'none';
  return (
    <ModalSheet key={key} visible={visible} title="Annotation du lien" onClose={onClose}>
      <Text style={styles.modalHint}>Décrivez en vos propres mots le lien entre ces deux éléments.</Text>
      <Field value={comment} onChangeText={setComment} placeholder="Exemple : le témoignage est probablement faux" multiline />
      <View style={styles.modalActions}>
        <Button
          label="Enregistrer"
          onPress={() => {
            if (connection) updateConnection(connection.id, comment);
            onClose();
          }}
        />
        <Button
          label="Supprimer le lien"
          variant="danger"
          onPress={() => {
            if (connection) removeConnection(connection.id);
            onClose();
          }}
        />
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toolbar: { flexDirection: 'row', gap: spacing.s, marginBottom: spacing.s },
  toolbarBtn: { flex: 1, minHeight: 40, paddingVertical: spacing.s },
  boardWrap: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.l, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  board: { width: BOARD_SIZE, height: BOARD_SIZE },
  node: {
    position: 'absolute',
    width: BOARD_NODE_WIDTH,
    minHeight: BOARD_NODE_HEIGHT,
    backgroundColor: colors.night,
    borderWidth: 1.5,
    borderRadius: radius.m,
    overflow: 'hidden',
  },
  nodeBody: { padding: spacing.s, flex: 1 },
  nodeKind: { fontSize: 9, fontWeight: '800', letterSpacing: 1.2, marginBottom: 2 },
  nodeLabel: { color: colors.text, fontSize: 12, fontWeight: '700' },
  nodeDetail: { color: colors.textDim, fontSize: 10, marginTop: 2 },
  pendingRing: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderWidth: 2, borderRadius: radius.m, borderStyle: 'dashed' },
  connLabel: {
    position: 'absolute',
    width: 120,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.s,
    padding: 4,
  },
  connText: { color: colors.textDim, fontSize: 9 },
  empty: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.s },
  emptyText: { color: colors.secondary, fontSize: 13, textAlign: 'center' },
  modalHint: { color: colors.secondary, fontSize: 12, marginBottom: spacing.s },
  modalActions: { flexDirection: 'row', gap: spacing.s, marginTop: spacing.m },
});
