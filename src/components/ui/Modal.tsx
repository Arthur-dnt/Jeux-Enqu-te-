import { Modal as RNModal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/theme';

interface Props {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  full?: boolean;
  animationType?: 'slide' | 'fade' | 'none';
}

export function ModalSheet({ visible, title, onClose, children, full = false, animationType = 'slide' }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <RNModal visible={visible} animationType={animationType} transparent={!full} statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={full ? styles.fullBackdrop : styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            full && { flex: 1, borderRadius: 0, paddingTop: insets.top },
            { paddingBottom: insets.bottom + spacing.l },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
              <Text style={styles.closeText}>Fermer</Text>
            </Pressable>
          </View>
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(8,11,17,0.75)', justifyContent: 'flex-end' },
  fullBackdrop: { flex: 1, backgroundColor: colors.ink },
  sheet: {
    backgroundColor: colors.night,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderColor: colors.line,
    borderWidth: 1,
    maxHeight: '90%',
    paddingTop: spacing.l,
    paddingHorizontal: spacing.l,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.m },
  title: { color: colors.text, fontSize: 17, fontWeight: '700', flex: 1, marginRight: spacing.m },
  close: { paddingVertical: spacing.xs, paddingHorizontal: spacing.s },
  closeText: { color: colors.gold, fontSize: 13, fontWeight: '600' },
});
