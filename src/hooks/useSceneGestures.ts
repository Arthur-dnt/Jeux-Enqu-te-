import { useEffect, useRef, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { clamp } from '@/utils/geometry';
import { SCENE_MAX_SCALE, SCENE_MIN_SCALE } from '@/constants';

export interface SceneView {
  scale: number;
  translateX: number;
  translateY: number;
}

export function useSceneGestures(initial: SceneView, onViewChange?: (v: SceneView) => void) {
  const scale = useSharedValue(initial.scale);
  const translateX = useSharedValue(initial.translateX);
  const translateY = useSharedValue(initial.translateY);
  const savedScale = useSharedValue(initial.scale);
  const savedTranslateX = useSharedValue(initial.translateX);
  const savedTranslateY = useSharedValue(initial.translateY);
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const onChangeRef = useRef(onViewChange);
  onChangeRef.current = onViewChange;

  const maxOffset = () => ({
    x: (scale.value - 1) * (dims.width / 2),
    y: (scale.value - 1) * (dims.height / 2),
  });

  const commit = () => {
    onChangeRef.current?.({ scale: scale.value, translateX: translateX.value, translateY: translateY.value });
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = clamp(savedScale.value * e.scale, SCENE_MIN_SCALE, SCENE_MAX_SCALE);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      commit();
    });

  const pan = Gesture.Pan()
    .minDistance(6)
    .onUpdate((e) => {
      const m = maxOffset();
      translateX.value = clamp(savedTranslateX.value + e.translationX, -m.x, m.x);
      translateY.value = clamp(savedTranslateY.value + e.translationY, -m.y, m.y);
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      commit();
    });

  const gesture = Gesture.Simultaneous(pinch, pan);

  const reset = () => {
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    commit();
  };

  return { gesture, scale, translateX, translateY, setDims, reset };
}
