// src/features/events/components/CommentItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors, typography, spacing, radius } from '../../../config/theme';

interface CommentItemProps {
  comment: {
    commentId:   string;
    userId:      string;
    displayName: string;
    photoUrl:    string;
    text:        string;
    likes:       string[];
    likeCount:   number;
    isCoachNote: boolean;
    createdAt:   unknown;
  };
  currentUserId: string;
  onLike:        (commentId: string) => void;
  onDelete?:     (commentId: string) => void;
}

function formatTimestamp(val: unknown): string {
  try {
    if (!val) return '';
    let date: Date;
    if (typeof val === 'object' && val !== null) {
      if ('toDate' in val && typeof (val as { toDate: unknown }).toDate === 'function') {
        date = (val as { toDate: () => Date }).toDate();
      } else if ('seconds' in val && typeof (val as { seconds: unknown }).seconds === 'number') {
        date = new Date((val as { seconds: number }).seconds * 1000);
      } else {
        return '';
      }
    } else if (val instanceof Date) {
      date = val;
    } else {
      date = new Date(val as string);
    }
    if (isNaN(date.getTime())) return '';
    const diffSec = (Date.now() - date.getTime()) / 1000;
    if (diffSec < 60)    return 'just now';
    if (diffSec < 3600)  return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString();
  } catch {
    return '';
  }
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment, currentUserId, onLike, onDelete,
}) => {
  const isOwn   = comment.userId === currentUserId;
  const isLiked = (comment.likes ?? []).includes(currentUserId);
  const initials = comment.displayName
    .split(' ')
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase())
    .join('');

  const handleLongPress = () => {
    if (!isOwn || !onDelete) return;
    Alert.alert('Delete Comment', 'Remove this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete(comment.commentId),
      },
    ]);
  };

  return (
    <TouchableOpacity
      style={s.row}
      onLongPress={handleLongPress}
      activeOpacity={0.95}
    >
      {/* Avatar */}
      <View style={s.avatar}>
        <Text style={s.avatarText}>{initials}</Text>
      </View>

      <View style={s.content}>
        {/* Name row */}
        <View style={s.nameRow}>
          <Text style={s.name}>{comment.displayName}</Text>
          {comment.isCoachNote && (
            <View style={s.coachBadge}>
              <Text style={s.coachBadgeText}>🔒 Coach</Text>
            </View>
          )}
          <Text style={s.time}>{formatTimestamp(comment.createdAt)}</Text>
        </View>

        {/* Text */}
        <Text style={s.text}>{comment.text}</Text>

        {/* Like button */}
        <TouchableOpacity
          onPress={() => onLike(comment.commentId)}
          style={s.likeRow}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={s.likeIcon}>{isLiked ? '❤️' : '🤍'}</Text>
          {comment.likeCount > 0 && (
            <Text style={s.likeCount}>{comment.likeCount}</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  row:          { flexDirection: 'row', paddingHorizontal: spacing[4], paddingVertical: spacing[3], gap: spacing[3] },
  avatar:       {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.accent.dark,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText:   { color: '#fff', fontSize: typography.size.sm, fontWeight: '700' },
  content:      { flex: 1, gap: spacing[1] },
  nameRow:      { flexDirection: 'row', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap' },
  name:         { color: colors.text.primary, fontSize: typography.size.sm, fontWeight: '700' },
  coachBadge:   {
    backgroundColor: colors.accent.glow,
    borderRadius: radius.full,
    paddingHorizontal: spacing[2], paddingVertical: 2,
  },
  coachBadgeText:{ color: colors.accent.primary, fontSize: typography.size.xs, fontWeight: '600' },
  time:         { color: colors.text.muted, fontSize: typography.size.xs, marginLeft: 'auto' },
  text:         {
    color: colors.text.secondary,
    fontSize: typography.size.md,
    lineHeight: typography.size.md * 1.55,
  },
  likeRow:      { flexDirection: 'row', alignItems: 'center', gap: spacing[1], marginTop: spacing[1] },
  likeIcon:     { fontSize: 14 },
  likeCount:    { color: colors.text.muted, fontSize: typography.size.xs },
});
