// src/features/events/components/CommentsList.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService, Comment } from '../../../services/comment.service';
import { useAuthStore } from '../../../stores/authStore';
import { colors, typography, spacing } from '../../../config/theme';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';

interface CommentsListProps {
  eventId: string;
}

export const CommentsList: React.FC<CommentsListProps> = ({ eventId }) => {
  const qc     = useQueryClient();
  const userId = useAuthStore(s => s.user?.userId ?? '');
  const can    = useAuthStore(s => s.can);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', eventId],
    queryFn:  () => commentService.getComments(eventId),
    staleTime: 30_000,
  });

  const likeMutation = useMutation({
    mutationFn: (commentId: string) => commentService.toggleLike(commentId, userId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['comments', eventId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => commentService.deleteComment(commentId, eventId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['comments', eventId] }),
  });

  if (isLoading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.accent.primary} />
      </View>
    );
  }

  return (
    <View style={s.container}>
      {comments.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>No comments yet. Be the first! 💬</Text>
        </View>
      ) : (
        comments.map((c: Comment, idx: number) => (
          <React.Fragment key={c.commentId}>
            {idx > 0 && <View style={s.divider} />}
            <CommentItem
              comment={{ ...c, isCoachNote: false }}
              currentUserId={userId}
              onLike={(id) => likeMutation.mutate(id)}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          </React.Fragment>
        ))
      )}

      {can('comment') && (
        <CommentInput eventId={eventId} />
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  center:    { padding: spacing[8], alignItems: 'center' },
  empty:     { padding: spacing[6], alignItems: 'center' },
  emptyText: { color: colors.text.muted, fontSize: typography.size.md, textAlign: 'center' },
  divider:   { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing[4] },
});
