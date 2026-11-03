// src/features/gallery/components/GalleryGrid.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { GalleryMedia } from '../../../types';
import { colors, spacing } from '../../../config/theme';
import { MediaThumbnail } from './MediaThumbnail';

interface GalleryGridProps {
  media:          GalleryMedia[];
  onPressMedia?:  (media: GalleryMedia) => void;
  onDelete?:      (mediaId: string) => void;
  columns?:       number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const GAP = 2;

export const GalleryGrid: React.FC<GalleryGridProps> = ({
  media, onPressMedia, onDelete, columns = 3,
}) => {
  const itemSize = (SCREEN_WIDTH - GAP * (columns - 1)) / columns;

  if (media.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyText}>No photos yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={media}
      keyExtractor={item => item.mediaId}
      numColumns={columns}
      columnWrapperStyle={columns > 1 ? { gap: GAP } : undefined}
      renderItem={({ item }) => (
        <View style={{ marginBottom: GAP }}>
          <MediaThumbnail
            media={item}
            size={itemSize}
            onPress={() => onPressMedia?.(item)}
            onLongPress={() => onDelete?.(item.mediaId)}
          />
        </View>
      )}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.grid}
    />
  );
};

const s = StyleSheet.create({
  grid:      { paddingBottom: spacing[8] },
  empty:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[8] },
  emptyText: { color: colors.text.muted, fontSize: 16 },
});
