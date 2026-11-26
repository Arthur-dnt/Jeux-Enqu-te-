import { ScrollView, StyleSheet, View, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';

interface Props extends ScrollViewProps {
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Screen({ padded = true, style, contentContainerStyle, children, ...rest }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={[styles.root, style]}
      contentContainerStyle={[
        padded && { padding: spacing.l },
        { paddingBottom: insets.bottom + spacing.xxl, paddingTop: insets.top + spacing.m },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

export function FixedScreen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.root, { paddingTop: insets.top }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
});
