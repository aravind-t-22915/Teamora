// src/features/gallery/components/MediaThumbnail.tsx
import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { GalleryMedia } from '../../../types';
import { colors } from '../../../config/theme';

interface MediaThumbnailProps {
  media:        GalleryMedia;
  size:         number;
  onPress?:     () => void;
  onLongPress?: () => void;
}

export const MediaThumbnail: React.FC<MediaThumbnailProps> = ({
  media, size, onPress, onLongPress,
}) => {
  const uri = media.thumbnailUrl || media.url;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
      style={[s.container, { width: size, height: size }]}
    >
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        resizeMode="cover"
      />

      {/* Video play overlay */}
      {media.type === 'video' && (
        <View style={s.playOverlay}>
          <Text style={s.playIcon}>▶</Text>
        </View>
      )}

      {/* Highlight star badge */}
      {media.isHighlight && (
        <View style={s.starBadge}>
          <Text style={s.starIcon}>⭐</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  container:   { overflow: 'hidden', backgroundColor: colors.background.tertiary },
  playOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  playIcon:    { fontSize: 24, color: '#fff' },
  starBadge:   {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12, paddingHorizontal: 4, paddingVertical: 2,
  },
  starIcon:    { fontSize: 11 },
});
