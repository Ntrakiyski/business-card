import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const usernameSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores')
    .toLowerCase(),
});

// Profile schemas
export const profileSchema = z.object({
  display_name: z.string().min(1, 'Name is required').max(100),
  job_title: z.string().max(100).optional().nullable(),
  company: z.string().max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  email: z.string().email('Please enter a valid email').optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  website: z.string().url('Please enter a valid URL').optional().nullable().or(z.literal('')),
  address: z.string().max(200).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

// Links schema
export const customLinkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  url: z.string().url('Please enter a valid URL'),
  image_url: z.string().url().optional().nullable(),
  order: z.number().int().min(0).default(0),
  enabled: z.boolean().default(true),
});

// Social links schema
export const socialLinkSchema = z.object({
  platform: z.enum(['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'spotify', 'tiktok', 'github']),
  url: z.string().url('Please enter a valid URL'),
  enabled: z.boolean().default(true),
});

// Services schema
export const serviceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(200).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  order: z.number().int().min(0).default(0),
  enabled: z.boolean().default(true),
});

// Widget settings schema
export const widgetSettingsSchema = z.object({
  widget_type: z.enum(['profile', 'bio', 'links', 'social', 'services', 'contact', 'map']),
  enabled: z.boolean(),
  order: z.number().int().min(0),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type UsernameInput = z.infer<typeof usernameSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type CustomLinkInput = z.infer<typeof customLinkSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type WidgetSettingsInput = z.infer<typeof widgetSettingsSchema>;

