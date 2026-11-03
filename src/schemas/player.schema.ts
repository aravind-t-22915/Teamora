// src/schemas/player.schema.ts
import { z } from 'zod';

export const playerSchema = z.object({
  firstName:             z.string().min(1, 'First name is required'),
  lastName:              z.string().min(1, 'Last name is required'),
  position:              z.enum(['goalkeeper', 'defender', 'midfielder', 'forward', 'unassigned']),
  preferredFoot:         z.enum(['left', 'right', 'both']),
  jerseyNumber:          z.number().int().min(1).max(99).optional(),
  height:                z.number().min(100, 'Min 100 cm').max(250, 'Max 250 cm').optional(),
  weight:                z.number().min(30, 'Min 30 kg').max(200, 'Max 200 kg').optional(),
  phone:                 z.string().optional(),
  emergencyContactName:  z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

export type PlayerFormValues = z.infer<typeof playerSchema>;
