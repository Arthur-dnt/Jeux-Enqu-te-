import { StyleSheet, TextInput } from 'react-native';
import { colors, radius, spacing } from '@/theme';

interface Props {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: object;
}

export function Field({ value, onChangeText, placeholder, multiline, secureTextEntry, autoCapitalize, style }: Props) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.secondary}
      multiline={multiline}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      style={[styles.input, multiline && styles.multiline, style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.m,
    color: colors.text,
    fontSize: 14,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
});
