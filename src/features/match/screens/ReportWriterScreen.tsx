// src/features/match/screens/ReportWriterScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { EventsStackParamList, LineupPlayer } from '../../../types';
import { colors, typography, spacing, radius, glassCardStyle } from '../../../config/theme';
import { useMatchData } from '../../../hooks/useMatch';
import { useAuthStore } from '../../../stores/authStore';
import { reportService, PlayerFeedback } from '../../../services/report.service';
import { Avatar } from '../../../components/ui/Avatar';

type Props = {
  navigation: NativeStackNavigationProp<EventsStackParamList>;
  route: RouteProp<{ ReportWriter: { eventId: string } }, 'ReportWriter'>;
};

interface FormState {
  summary: string;
  strengths: string;
  weaknesses: string;
  nextFocus: string;
  playerFeedback: Record<string, { note: string; rating: number }>;
}

const EMPTY_FORM: FormState = {
  summary: '',
  strengths: '',
  weaknesses: '',
  nextFocus: '',
  playerFeedback: {},
};

/** Star row for 1–5 rating */
const StarRating: React.FC<{
  rating: number;
  onRate: (r: number) => void;
  disabled?: boolean;
}> = ({ rating, onRate, disabled }) => (
  <View style={starStyles.row}>
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity
        key={star}
        onPress={() => !disabled && onRate(star)}
        activeOpacity={disabled ? 1 : 0.7}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        <Text style={[starStyles.star, star <= rating && starStyles.starFilled]}>★</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const starStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  star: { fontSize: 18, color: colors.border },
  starFilled: { color: colors.status.maybe },
});

export function ReportWriterScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const can = useAuthStore((s) => s.can);
  const user = useAuthStore((s) => s.user);
  const club = useAuthStore((s) => s.club);

  const { data: matchData } = useMatchData(eventId);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isLoadingReport, setIsLoadingReport] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const players: LineupPlayer[] = matchData?.startingLineup ?? [];

  // Load existing report
  useEffect(() => {
    let mounted = true;
    setIsLoadingReport(true);
    reportService.getReport(eventId).then((report) => {
      if (!mounted) return;
      if (report) {
        const feedback: Record<string, { note: string; rating: number }> = {};
        for (const pf of report.playerFeedback) {
          feedback[pf.userId] = { note: pf.note, rating: pf.rating };
        }
        setForm({
          summary: report.summary,
          strengths: report.strengths,
          weaknesses: report.weaknesses,
          nextFocus: report.nextFocus,
          playerFeedback: feedback,
        });
      }
      setIsLoadingReport(false);
    }).catch(() => {
      if (mounted) setIsLoadingReport(false);
    });
    return () => { mounted = false; };
  }, [eventId]);

  const buildPayload = useCallback(() => {
    const playerFeedback: PlayerFeedback[] = players.map((p) => ({
      userId: p.userId,
      displayName: p.displayName,
      note: form.playerFeedback[p.userId]?.note ?? '',
      rating: form.playerFeedback[p.userId]?.rating ?? 0,
    }));

    return {
      eventId,
      clubId: club?.clubId ?? '',
      summary: form.summary,
      strengths: form.strengths,
      weaknesses: form.weaknesses,
      nextFocus: form.nextFocus,
      playerFeedback,
      isPublished: false,
      authorId: user?.userId ?? '',
    };
  }, [form, players, eventId, club, user]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await reportService.saveDraft(eventId, buildPayload());
      Alert.alert('Draft Saved', 'Your report draft has been saved.');
    } catch {
      Alert.alert('Error', 'Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = () => {
    if (form.summary.trim().length < 20) {
      Alert.alert('Summary Required', 'Please write a summary before publishing.');
      return;
    }
    Alert.alert(
      'Publish Report',
      'Publish this match report to the team? This will be visible to all members.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          onPress: async () => {
            setIsPublishing(true);
            try {
              await reportService.publishReport(eventId, { ...buildPayload(), isPublished: true });
              Alert.alert('Published', 'Match report published successfully.');
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Failed to publish. Please try again.');
            } finally {
              setIsPublishing(false);
            }
          },
        },
      ],
    );
  };

  if (!can('write_report')) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Match Report</Text>
          <View style={{ width: 80 }} />
        </View>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>🔒</Text>
          <Text style={styles.permissionTitle}>Access Restricted</Text>
          <Text style={styles.permissionText}>You don't have permission to write match reports.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isPending = isSaving || isPublishing;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Match Report</Text>
        <TouchableOpacity
          onPress={handlePublish}
          disabled={isPending}
          style={[styles.publishBtn, isPending && { opacity: 0.5 }]}
        >
          <Text style={styles.publishBtnText}>Publish</Text>
        </TouchableOpacity>
      </View>

      {isLoadingReport ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {/* Summary */}
            <SectionInput
              title="Match Summary"
              icon="📝"
              value={form.summary}
              onChangeText={(v) => setForm((f) => ({ ...f, summary: v }))}
              placeholder="Write a summary of the match... (min. 200 characters recommended)"
              minHeight={120}
              disabled={isPending}
            />

            {/* Strengths */}
            <SectionInput
              title="Strengths"
              icon="💪"
              value={form.strengths}
              onChangeText={(v) => setForm((f) => ({ ...f, strengths: v }))}
              placeholder="What did the team do well?"
              minHeight={80}
              disabled={isPending}
            />

            {/* Weaknesses */}
            <SectionInput
              title="Areas to Improve"
              icon="🎯"
              value={form.weaknesses}
              onChangeText={(v) => setForm((f) => ({ ...f, weaknesses: v }))}
              placeholder="What needs improvement?"
              minHeight={80}
              disabled={isPending}
            />

            {/* Next Focus */}
            <SectionInput
              title="Next Session Focus"
              icon="📋"
              value={form.nextFocus}
              onChangeText={(v) => setForm((f) => ({ ...f, nextFocus: v }))}
              placeholder="What to work on in training?"
              minHeight={80}
              disabled={isPending}
            />

            {/* Player Feedback */}
            {players.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionIcon}>👥</Text>
                  <Text style={styles.sectionTitle}>Player Feedback</Text>
                </View>

                {players.map((player) => {
                  const fb = form.playerFeedback[player.userId] ?? { note: '', rating: 0 };
                  return (
                    <View key={player.userId} style={styles.playerFeedbackCard}>
                      <View style={styles.playerFeedbackHeader}>
                        <Avatar name={player.displayName} size={36} />
                        <View style={styles.playerFeedbackInfo}>
                          <Text style={styles.playerFeedbackName}>{player.displayName}</Text>
                          <Text style={styles.playerFeedbackPosition}>{player.position}</Text>
                        </View>
                        <StarRating
                          rating={fb.rating}
                          onRate={(r) => setForm((f) => ({
                            ...f,
                            playerFeedback: {
                              ...f.playerFeedback,
                              [player.userId]: { ...fb, rating: r },
                            },
                          }))}
                          disabled={isPending}
                        />
                      </View>
                      <TextInput
                        style={styles.playerNoteInput}
                        value={fb.note}
                        onChangeText={(v) => setForm((f) => ({
                          ...f,
                          playerFeedback: {
                            ...f.playerFeedback,
                            [player.userId]: { ...fb, note: v },
                          },
                        }))}
                        placeholder="Individual feedback…"
                        placeholderTextColor={colors.text.muted}
                        multiline
                        editable={!isPending}
                      />
                    </View>
                  );
                })}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={handleSaveDraft}
                disabled={isPending}
                style={[styles.draftBtn, isPending && { opacity: 0.5 }]}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.text.primary} />
                ) : (
                  <Text style={styles.draftBtnText}>Save Draft</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePublish}
                disabled={isPending}
                style={[styles.publishLargeBtn, isPending && { opacity: 0.5 }]}
                activeOpacity={0.8}
              >
                {isPublishing ? (
                  <ActivityIndicator size="small" color={colors.text.inverse} />
                ) : (
                  <Text style={styles.publishLargeBtnText}>Publish Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

interface SectionInputProps {
  title: string;
  icon: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  minHeight?: number;
  disabled?: boolean;
}

const SectionInput: React.FC<SectionInputProps> = ({
  title, icon, value, onChangeText, placeholder, minHeight = 80, disabled,
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <TextInput
      style={[styles.sectionInput, { minHeight }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.text.muted}
      multiline
      textAlignVertical="top"
      editable={!disabled}
    />
  </View>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backText: {
    color: colors.text.primary,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
    width: 40,
  },
  headerTitle: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.size.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  publishBtn: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    minWidth: 80,
    alignItems: 'center',
  },
  publishBtnText: {
    color: colors.text.inverse,
    fontSize: typography.size.sm,
    fontWeight: '700',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: spacing[12],
  },
  section: {
    marginHorizontal: spacing[4],
    marginTop: spacing[5],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    fontWeight: '700',
  },
  sectionInput: {
    ...glassCardStyle,
    padding: spacing[4],
    color: colors.text.primary,
    fontSize: typography.size.md,
    lineHeight: 22,
  },
  playerFeedbackCard: {
    ...glassCardStyle,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  playerFeedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
    gap: spacing[3],
  },
  playerFeedbackInfo: {
    flex: 1,
  },
  playerFeedbackName: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    fontWeight: '600',
  },
  playerFeedbackPosition: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  playerNoteInput: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    padding: spacing[3],
    color: colors.text.primary,
    fontSize: typography.size.sm,
    minHeight: 56,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginHorizontal: spacing[4],
    marginTop: spacing[6],
  },
  draftBtn: {
    flex: 1,
    paddingVertical: spacing[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  draftBtnText: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    fontWeight: '600',
  },
  publishLargeBtn: {
    flex: 2,
    paddingVertical: spacing[4],
    borderRadius: radius.lg,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
  },
  publishLargeBtnText: {
    color: colors.text.inverse,
    fontSize: typography.size.md,
    fontWeight: '700',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
  },
  permissionIcon: {
    fontSize: 48,
    marginBottom: spacing[4],
  },
  permissionTitle: {
    color: colors.text.primary,
    fontSize: typography.size.xl,
    fontWeight: '700',
    marginBottom: spacing[2],
  },
  permissionText: {
    color: colors.text.secondary,
    fontSize: typography.size.md,
    textAlign: 'center',
    lineHeight: 22,
  },
});
