import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme';
import { APP_NAME, APP_SLOGAN } from '@/constants';

export function HomeHeader() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.brand}>{APP_NAME}</Text>
      <Text style={styles.slogan}>{APP_SLOGAN}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xl },
  brand: { color: colors.text, fontSize: 34, fontWeight: '900', letterSpacing: 6 },
  slogan: { color: colors.gold, fontSize: 12, letterSpacing: 2, marginTop: spacing.xs, textTransform: 'uppercase' },
});
