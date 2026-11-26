import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme';

export function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.m },
  title: { color: colors.text, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});
