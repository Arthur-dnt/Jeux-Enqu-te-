import { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Circle, Polygon, Rect } from 'react-native-svg';
import type { Hotspot, SceneDef } from '@/types/case';
import type { SceneViewState } from '@/types/save';
import { getSceneArt } from './art/artRegistry';
import { useSceneGestures } from '@/hooks/useSceneGestures';
import { colors, radius } from '@/theme';
import { SCENE_BASE_HEIGHT, SCENE_BASE_WIDTH } from '@/constants';
import * as Haptics from 'expo-haptics';

interface Props {
  scene: SceneDef;
  initialView: SceneViewState;
  hintMode: boolean;
  undiscoveredHotspotIds: string[];
  onHotspotPress: (hotspot: Hotspot) => void;
  onViewChange: (view: SceneViewState) => void;
}

function HotspotShape({
  h,
  hint,
  onPress,
}: {
  h: Hotspot;
  hint: boolean;
  onPress: () => void;
}) {
  const common = {
    onPress,
    hitSlop: 6,
    fill: 'transparent',
    stroke: hint ? colors.gold : 'transparent',
    strokeWidth: hint ? 2 : 0,
    strokeDasharray: hint ? '6 4' : undefined,
  };
  if (h.type === 'circle') {
    return <Circle key={h.id} cx={h.x * SCENE_BASE_WIDTH} cy={h.y * SCENE_BASE_HEIGHT} r={h.r * SCENE_BASE_WIDTH} {...common} />;
  }
  if (h.type === 'rect') {
    return (
      <Rect
        key={h.id}
        x={h.x * SCENE_BASE_WIDTH}
        y={h.y * SCENE_BASE_HEIGHT}
        width={h.width * SCENE_BASE_WIDTH}
        height={h.height * SCENE_BASE_HEIGHT}
        {...common}
      />
    );
  }
  const points = h.points.map(([px, py]) => `${px * SCENE_BASE_WIDTH},${py * SCENE_BASE_HEIGHT}`).join(' ');
  return <Polygon key={h.id} points={points} {...common} />;
}

export const SceneViewer = memo(function SceneViewer({
  scene,
  initialView,
  hintMode,
  undiscoveredHotspotIds,
  onHotspotPress,
  onViewChange,
}: Props) {
  const { gesture, scale, translateX, translateY, setDims, reset } = useSceneGestures(initialView, onViewChange);
  const Art = useMemo(() => getSceneArt(scene.artKey), [scene.artKey]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
  }));

  const handlePress = useCallback(
    (h: Hotspot) => {
      void Haptics.selectionAsync().catch(() => undefined);
      onHotspotPress(h);
    },
    [onHotspotPress]
  );

  return (
    <View style={styles.root}>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[styles.canvas, animatedStyle]}
          onLayout={(e) => setDims({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
        >
          <Art />
          <Svg
            viewBox={`0 0 ${SCENE_BASE_WIDTH} ${SCENE_BASE_HEIGHT}`}
            style={StyleSheet.absoluteFill}
            pointerEvents="box-none"
          >
            {scene.hotspots.map((h) => (
              <HotspotShape
                key={h.id}
                h={h}
                hint={hintMode && undiscoveredHotspotIds.includes(h.id)}
                onPress={() => handlePress(h)}
              />
            ))}
          </Svg>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
    overflow: 'hidden',
    borderRadius: radius.m,
  },
  canvas: {
    flex: 1,
    aspectRatio: SCENE_BASE_WIDTH / SCENE_BASE_HEIGHT,
    width: '100%',
  },
});
