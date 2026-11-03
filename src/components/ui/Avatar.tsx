import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../../config/theme';

interface AvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: number;
  color?: string;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  photoUrl,
  size = 40,
  color = `${colors.accent.primary}30`,
}) => {
  const initials = getInitials(name);
  const fontSize = size * 0.38;

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
  };

  if (photoUrl) {
    return (
      <View style={containerStyle}>
        <Image
          source={{ uri: photoUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  initials: {
    color: colors.accent.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
