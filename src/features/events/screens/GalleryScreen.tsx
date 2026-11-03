// src/features/events/screens/GalleryScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ActivityIndicator, Alert, Modal, Image, Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { EventsStackParamList, GalleryMedia } from '../../../types';
import { colors, typography, spacing, radius } from '../../../config/theme';
import { useAuthStore } from '../../../stores/authStore';
import { useEventGallery, useUploadMedia } from '../../../hooks/useGallery';
import { useEvent } from '../../../hooks/useEvents';
import { GalleryGrid } from '../../gallery/components/GalleryGrid';

type Props = NativeStackScreenProps<EventsStackParamList, 'Gallery'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function GalleryScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const [selectedMedia, setSelectedMedia] = useState<GalleryMedia | null>(null);

  const { data: event }                               = useEvent(eventId);
  const { data: media = [], isLoading }               = useEventGallery(eventId);
  const { mutateAsync: uploadMedia, isPending: isUploading } = useUploadMedia();
  const can = useAuthStore(s => s.can);

  const canUpload = can('upload_gallery');

  const handleUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;

    try {
      await Promise.all(
        result.assets.map(asset =>
          uploadMedia({
            localUri: asset.uri,
            eventId,
            type:     'photo',
            caption:  '',
            width:    asset.width  ?? 0,
            height:   asset.height ?? 0,
            fileSize: asset.fileSize ?? 0,
          }),
        ),
      );
      Alert.alert('Uploaded', `${result.assets.length} photo${result.assets.length > 1 ? 's' : ''} added to the gallery.`);
    } catch {
      Alert.alert('Upload Failed', 'Could not upload photos. Please try again.');
    }
  };

  const eventTitle = event?.title ?? '';

  return (
    <SafeAreaView style={s.container}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <Text style={s.headerTitle} numberOfLines={1}>
            {eventTitle ? `Gallery — ${eventTitle}` : 'Gallery'}
          </Text>
        </View>

        {canUpload ? (
          <TouchableOpacity onPress={handleUpload} style={s.uploadBtn} disabled={isUploading}>
            {isUploading
              ? <ActivityIndicator color={colors.accent.primary} size="small" />
              : <Text style={s.uploadBtnText}>+ Upload</Text>
            }
          </TouchableOpacity>
        ) : (
          <View style={s.uploadBtnPlaceholder} />
        )}
      </View>

      {/* ── Content ── */}
      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.accent.primary} size="large" />
        </View>
      ) : media.length === 0 ? (
        <View style={s.center}>
          <Text style={s.emptyIcon}>📷</Text>
          <Text style={s.emptyTitle}>No photos yet</Text>
          {canUpload && (
            <Text style={s.emptySubtitle}>
              Tap "+ Upload" to add photos from this event.
            </Text>
          )}
        </View>
      ) : (
        <GalleryGrid
          media={media}
          onPressMedia={setSelectedMedia}
        />
      )}

      {/* ── Full-screen viewer Modal ── */}
      <Modal
        visible={!!selectedMedia}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMedia(null)}
        statusBarTranslucent
      >
        {selectedMedia && (
          <View style={s.viewerBg}>
            <SafeAreaView style={s.viewerHeaderSafe}>
              <View style={s.viewerHeader}>
                <TouchableOpacity
                  onPress={() => setSelectedMedia(null)}
                  style={s.viewerClose}
                >
                  <Text style={s.viewerCloseText}>✕</Text>
                </TouchableOpacity>
                {!!selectedMedia.caption && (
                  <Text style={s.viewerCaption} numberOfLines={2}>
                    {selectedMedia.caption}
                  </Text>
                )}
              </View>
            </SafeAreaView>

            <Image
              source={{ uri: selectedMedia.url }}
              style={s.viewerImage}
              resizeMode="contain"
            />

            <View style={s.viewerFooter}>
              <Text style={s.viewerUploaderText}>
                📸 {selectedMedia.uploaderName}
              </Text>
              {selectedMedia.likeCount > 0 && (
                <Text style={s.viewerLikes}>❤️ {selectedMedia.likeCount}</Text>
              )}
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:           { flex: 1, backgroundColor: colors.background.primary },
  header:              {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn:             { minWidth: 64 },
  backText:            { color: colors.accent.primary, fontSize: typography.size.md },
  headerCenter:        { flex: 1, alignItems: 'center' },
  headerTitle:         { color: colors.text.primary, fontSize: typography.size.md, fontWeight: '700' },
  uploadBtn:           { minWidth: 64, alignItems: 'flex-end' },
  uploadBtnText:       { color: colors.accent.primary, fontSize: typography.size.sm, fontWeight: '600' },
  uploadBtnPlaceholder:{ minWidth: 64 },

  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  emptyIcon:    { fontSize: 56 },
  emptyTitle:   { color: colors.text.primary, fontSize: typography.size.xl, fontWeight: '700' },
  emptySubtitle:{ color: colors.text.secondary, fontSize: typography.size.sm, textAlign: 'center', paddingHorizontal: spacing[8] },

  // Full-screen viewer
  viewerBg:         { flex: 1, backgroundColor: '#000' },
  viewerHeaderSafe: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  viewerHeader:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingTop: spacing[5], gap: spacing[3] },
  viewerClose:      { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center' },
  viewerCloseText:  { color: '#fff', fontSize: typography.size.md, fontWeight: '600' },
  viewerCaption:    { flex: 1, color: '#fff', fontSize: typography.size.sm },
  viewerImage:      { flex: 1, width: SCREEN_WIDTH },
  viewerFooter:     {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing[4], backgroundColor: 'rgba(0,0,0,0.6)',
  },
  viewerUploaderText:{ color: 'rgba(255,255,255,0.9)', fontSize: typography.size.sm },
  viewerLikes:       { color: 'rgba(255,255,255,0.9)', fontSize: typography.size.sm },
});
