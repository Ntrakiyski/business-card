import { z } from 'zod'

export const usernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .toLowerCase(),
})

export const profileSchema = z.object({
  display_name: z.string().max(100, 'Display name must be at most 100 characters').optional().or(z.literal('')),
  job_title: z.string().max(100, 'Job title must be at most 100 characters').optional().or(z.literal('')),
  company: z.string().max(100, 'Company must be at most 100 characters').optional().or(z.literal('')),
  location: z.string().max(100, 'Location must be at most 100 characters').optional().or(z.literal('')),
  profile_image_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
})

export const bioSchema = z.object({
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional().or(z.literal('')),
})

export type UsernameInput = z.infer<typeof usernameSchema>

