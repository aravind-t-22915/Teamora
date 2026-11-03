// src/schemas/auth.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  firstName:   z.string().min(1, 'First name is required').max(50),
  lastName:    z.string().min(1, 'Last name is required').max(50),
  email:       z.string().email('Invalid email address'),
  clubName:    z.string().min(2, 'Club name is required').max(60),
  password:    z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
});

export const joinClubSchema = z.object({
  inviteCode: z
    .string()
    .length(6, 'Invite code must be 6 characters')
    .toUpperCase(),
});

export const profileSetupSchema = z.object({
  position:      z.enum(['goalkeeper', 'defender', 'midfielder', 'forward', 'unassigned']),
  preferredFoot: z.enum(['left', 'right', 'both']),
  jerseyNumber:  z.coerce.number().min(1).max(99).nullable().optional(),
  height:        z.coerce.number().min(100).max(220).nullable().optional(),
  weight:        z.coerce.number().min(30).max(150).nullable().optional(),
  phone:         z.string().optional(),
});

export type LoginFormValues        = z.infer<typeof loginSchema>;
export type RegisterFormValues     = z.infer<typeof registerSchema>;
export type JoinClubFormValues     = z.infer<typeof joinClubSchema>;
export type ProfileSetupFormValues = z.infer<typeof profileSetupSchema>;
