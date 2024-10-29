import { z } from 'zod';

export const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  full_name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  favorite_color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
