import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { colors, glassCardStyle, radius, spacing, typography } from '../../config/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export const AppModal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {(title || showCloseButton) ? (
                <View style={styles.header}>
                  {title ? <Text style={styles.title}>{title}</Text> : <View />}
                  {showCloseButton ? (
                    <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
                      <Text style={styles.closeIcon}>✕</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  card: {
    ...(glassCardStyle as object),
    width: '100%',
    padding: spacing[5],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing[2],
  },
  closeIcon: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: '600',
  },
});
