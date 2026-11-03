// src/features/match/components/LineupPitch.tsx
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import { LineupPlayer } from '../../../types';
import { colors, typography, radius } from '../../../config/theme';

export interface LineupPitchProps {
  players: LineupPlayer[];
  formation: string;
  onPlayerPress?: (player: LineupPlayer) => void;
}

/** Parse "4-3-3" → [1, 4, 3, 3]  (GK row prepended) */
function parseFormation(formation: string): number[] {
  const parts = formation.split('-').map(Number).filter((n) => !isNaN(n) && n > 0);
  return [1, ...parts];
}

/** Map positionIndex → { rowIndex, colIndex } given the row sizes */
function getPosition(
  positionIndex: number,
  rows: number[],
): { row: number; col: number; rowSize: number } {
  let cursor = 0;
  for (let r = 0; r < rows.length; r++) {
    if (positionIndex < cursor + rows[r]) {
      return { row: r, col: positionIndex - cursor, rowSize: rows[r] };
    }
    cursor += rows[r];
  }
  // Fallback: place at last row
  const last = rows.length - 1;
  return { row: last, col: positionIndex - (cursor - rows[last]), rowSize: rows[last] };
}

export const LineupPitch: React.FC<LineupPitchProps> = ({
  players,
  formation,
  onPlayerPress,
}) => {
  const { width } = useWindowDimensions();
  const pitchWidth = width - 32;
  const pitchHeight = pitchWidth * 1.4;

  const rows = parseFormation(formation);
  const numRows = rows.length;

  // Sort by positionIndex
  const sorted = [...players].sort((a, b) => a.positionIndex - b.positionIndex);

  return (
    <View style={[styles.pitch, { width: pitchWidth, height: pitchHeight }]}>
      {/* Centre circle */}
      <View style={styles.centreCircle} />
      {/* Half-way line */}
      <View style={styles.halfwayLine} />
      {/* Goal area top */}
      <View style={[styles.goalArea, styles.goalAreaTop]} />
      {/* Goal area bottom */}
      <View style={[styles.goalArea, styles.goalAreaBottom]} />

      {sorted.map((player) => {
        const { row, col, rowSize } = getPosition(player.positionIndex, rows);

        // Vertical position: GK is at the bottom (row 0), FWD at top
        // We flip so row 0 (GK) is near the bottom
        const verticalFraction = 1 - (row + 0.6) / numRows;
        const horizontalFraction = (col + 0.5) / rowSize;

        const x = horizontalFraction * pitchWidth - 22; // 22 = half player width
        const y = verticalFraction * pitchHeight - 30;  // 30 = half player height

        return (
          <TouchableOpacity
            key={player.userId}
            style={[styles.playerDot, { left: x, top: y }]}
            onPress={() => onPlayerPress?.(player)}
            activeOpacity={onPlayerPress ? 0.7 : 1}
          >
            <View style={[
              styles.circle,
              player.isCaptain && styles.captainCircle,
            ]}>
              <Text style={styles.jerseyNumber}>{player.jerseyNumber}</Text>
            </View>
            <Text style={styles.playerName} numberOfLines={1}>
              {player.displayName.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const PITCH_GREEN = '#15803D';

const styles = StyleSheet.create({
  pitch: {
    backgroundColor: PITCH_GREEN,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
  },
  halfwayLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  centreCircle: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    marginLeft: -30,
    marginTop: -30,
  },
  goalArea: {
    position: 'absolute',
    left: '30%',
    right: '30%',
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  goalAreaTop: {
    top: 0,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  goalAreaBottom: {
    bottom: 0,
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  playerDot: {
    position: 'absolute',
    width: 44,
    alignItems: 'center',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.accent.primary,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captainCircle: {
    backgroundColor: colors.status.maybe,
  },
  jerseyNumber: {
    color: '#fff',
    fontSize: typography.size.xs,
    fontWeight: '800',
  },
  playerName: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
    maxWidth: 44,
  },
});
