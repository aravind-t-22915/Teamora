// src/features/gallery/screens/MediaViewerScreen.tsx
import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image,
  Dimensions, StatusBar, ActivityIndicator,
} from 'react-native';
import { useEventGallery, useToggleMediaLike } from '../../../hooks/useGallery';
import { useAuthStore } from '../../../stores/authStore';
import { colors, typography, spacing } from '../../../config/theme';

interface Props {
  route: {
    params: {
      mediaId: string;
      eventId: string;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function MediaViewerScreen({ route, navigation }: Props) {
  const { mediaId, eventId } = route.params;

  const { data: allMedia = [], isLoading } = useEventGallery(eventId);
  const media = allMedia.find(m => m.mediaId === mediaId);

  const { mutateAsync: toggleLike, isPending: isLiking } = useToggleMediaLike();
  const userId = useAuthStore(s => s.user?.userId ?? '');

  const isLiked = media ? (media.likes ?? []).includes(userId) : false;

  const handleLike = async () => {
    if (!media || isLiking) return;
    await toggleLike({ mediaId: media.mediaId, userId });
  };

  if (isLoading) {
    return (
      <View style={s.container}>
        <SafeAreaView>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.closeBtn}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </SafeAreaView>
        <View style={s.center}>
          <ActivityIndicator color={colors.accent.primary} size="large" />
        </View>
      </View>
    );
  }

  if (!media) {
    return (
      <View style={s.container}>
        <SafeAreaView>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.closeBtn}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </SafeAreaView>
        <View style={s.center}>
          <Text style={s.notFoundText}>Media not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header overlay */}
      <SafeAreaView style={s.headerSafe}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.closeBtn}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={handleLike}
            style={s.likeBtn}
            disabled={isLiking}
          >
            <Text style={s.likeIcon}>{isLiked ? '❤️' : '🤍'}</Text>
            {media.likeCount > 0 && (
              <Text style={s.likeCount}>{media.likeCount}</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Image */}
      <Image
        source={{ uri: media.url }}
        style={s.image}
        resizeMode="contain"
      />

      {/* Footer overlay */}
      <View style={s.footer}>
        {!!media.caption && (
          <Text style={s.caption}>{media.caption}</Text>
        )}
        <Text style={s.uploader}>📸 {media.uploaderName}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#000' },
  headerSafe:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  header:       {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing[4], paddingTop: spacing[5],
  },
  closeBtn:     {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: typography.size.md, fontWeight: '600' },
  likeBtn:      {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1],
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 20, paddingHorizontal: spacing[3], paddingVertical: spacing[1],
  },
  likeIcon:     { fontSize: 20 },
  likeCount:    { color: '#fff', fontSize: typography.size.sm, fontWeight: '600' },
  image:        { flex: 1, width: SCREEN_WIDTH },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: colors.text.secondary, fontSize: typography.size.md },
  footer:       {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: spacing[4], gap: spacing[1],
  },
  caption:      { color: '#fff', fontSize: typography.size.md },
  uploader:     { color: 'rgba(255,255,255,0.75)', fontSize: typography.size.sm },
});
