import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '@/theme';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
  tint?: string;
}

export function Chip({ label, active, onPress, tint }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.chip,
        active ? { backgroundColor: colors.goldSoft, borderColor: tint ?? colors.gold } : { borderColor: colors.line },
      ]}
    >
      <Text style={[styles.text, active ? { color: tint ?? colors.gold } : { color: colors.textDim }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.m,
    paddingVertical: 6,
    marginRight: spacing.s,
    marginBottom: spacing.s,
    backgroundColor: colors.surface,
  },
  text: { fontSize: 12, fontWeight: '600' },
});
