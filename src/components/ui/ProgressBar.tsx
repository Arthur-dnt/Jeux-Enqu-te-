import { StyleSheet, View } from 'react-native';
import { colors, radius } from '@/theme';

export function ProgressBar({ ratio, tint = colors.gold }: { ratio: number; tint?: string }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.round(Math.max(0, Math.min(1, ratio)) * 100)}%`, backgroundColor: tint }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: radius.s, backgroundColor: colors.nightSoft, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.s },
});
