import { z } from 'zod';

export const cardFormSchema = z.object({
  card_name: z.string().min(1, 'Card name is required').max(100, 'Card name must be less than 100 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Username can only contain lowercase letters, numbers, and hyphens'),
  is_public: z.boolean().default(true),
  is_primary: z.boolean().default(false),
  display_name: z.string().optional(),
  job_title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  address: z.string().optional(),
  profile_image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
});

export type CardFormData = z.infer<typeof cardFormSchema>;

