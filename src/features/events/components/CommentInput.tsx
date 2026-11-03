// src/features/events/components/CommentInput.tsx
import React, { useState } from 'react';
import {
  View, TextInput, StyleSheet, TouchableOpacity, Text, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { commentService } from '../../../services/comment.service';
import { useAuthStore } from '../../../stores/authStore';
import { colors, typography, spacing, radius } from '../../../config/theme';

interface CommentInputProps {
  eventId: string;
  onSent?: () => void;
}

export const CommentInput: React.FC<CommentInputProps> = ({ eventId, onSent }) => {
  const [text,      setText]      = useState('');
  const [isSending, setIsSending] = useState(false);

  const { user, club } = useAuthStore();
  const qc             = useQueryClient();

  const handleSend = async () => {
    if (!text.trim() || !user || !club || isSending) return;
    const payload = text.trim();
    setIsSending(true);
    try {
      await commentService.addComment(
        eventId,
        club.clubId,
        user.userId,
        user.displayName,
        user.photoUrl,
        payload,
      );
      await qc.invalidateQueries({ queryKey: ['comments', eventId] });
      setText('');
      onSent?.();
    } finally {
      setIsSending(false);
    }
  };

  const canSend = !!text.trim() && !isSending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <View style={s.container}>
        <TextInput
          style={s.input}
          value={text}
          onChangeText={setText}
          placeholder="Add a comment…"
          placeholderTextColor={colors.text.muted}
          multiline
          maxLength={500}
          returnKeyType="default"
        />
        <TouchableOpacity
          onPress={handleSend}
          style={[s.sendBtn, !canSend && s.sendBtnDisabled]}
          disabled={!canSend}
        >
          {isSending
            ? <ActivityIndicator color={colors.text.inverse} size="small" />
            : <Text style={s.sendBtnText}>↑</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.background.secondary,
    gap: spacing[2],
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.size.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.xl,
    paddingHorizontal: spacing[4], paddingVertical: spacing[2],
    maxHeight: 120,
    borderWidth: 1, borderColor: colors.border,
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.accent.primary,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText:     { color: colors.text.inverse, fontSize: typography.size.md, fontWeight: '700' },
});
