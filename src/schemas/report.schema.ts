// src/schemas/report.schema.ts
import { z } from 'zod';

export const reportSchema = z.object({
  summary:    z.string().min(10, 'Summary must be at least 10 characters'),
  strengths:  z.string().min(5, 'Strengths must be at least 5 characters'),
  weaknesses: z.string().min(5, 'Weaknesses must be at least 5 characters'),
  nextFocus:  z.string().min(5, 'Next focus must be at least 5 characters'),
});

export type ReportFormValues = z.infer<typeof reportSchema>;
