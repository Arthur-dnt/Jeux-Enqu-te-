import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger' | 'success';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', disabled, style }: Props) {
  const palette = variants[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: disabled ? colors.nightSoft : pressed ? palette.pressed : palette.bg, borderColor: palette.border },
        style,
      ]}
    >
      <Text style={[styles.label, { color: disabled ? colors.secondary : palette.fg }]}>{label}</Text>
    </Pressable>
  );
}

const variants = {
  primary: { bg: colors.gold, pressed: '#B0955C', fg: '#191407', border: colors.gold },
  ghost: { bg: colors.surfaceRaised, pressed: colors.night, fg: colors.text, border: colors.line },
  danger: { bg: colors.alert, pressed: '#933D3D', fg: '#F5E9E9', border: colors.alert },
  success: { bg: colors.success, pressed: '#587A64', fg: '#0F1712', border: colors.success },
};

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.m,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  label: { ...typography.h3, fontSize: 14, letterSpacing: 0.4 },
});
