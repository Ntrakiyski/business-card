'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Validation schema for creating a new card
const createCardSchema = z.object({
  card_name: z.string().min(1, 'Card name is required').max(100),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50).regex(/^[a-z0-9-]+$/, 'Username can only contain lowercase letters, numbers, and hyphens'),
  is_public: z.boolean().default(true),
  is_primary: z.boolean().default(false),
  display_name: z.string().optional(),
  job_title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  profile_image_url: z.string().optional(),
  // Widget settings
  enabledWidgets: z.object({
    profile: z.boolean().default(true),
    bio: z.boolean().default(true),
    links: z.boolean().default(true),
    social: z.boolean().default(true),
    services: z.boolean().default(true),
    contact: z.boolean().default(true),
    map: z.boolean().default(true),
  }).default({
    profile: true,
    bio: true,
    links: true,
    social: true,
    services: true,
    contact: true,
    map: true,
  }),
});

export async function createCard(formData: FormData) {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    // Parse and validate form data
    const rawData = {
      card_name: formData.get('card_name') as string,
      username: formData.get('username') as string,
      is_public: formData.get('is_public') === 'true',
      is_primary: formData.get('is_primary') === 'true',
      display_name: formData.get('display_name') as string,
      job_title: formData.get('job_title') as string,
      company: formData.get('company') as string,
      location: formData.get('location') as string,
      bio: formData.get('bio') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      website: formData.get('website') as string,
      address: formData.get('address') as string,
      latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null,
      longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null,
      profile_image_url: formData.get('profile_image_url') as string,
      enabledWidgets: JSON.parse(formData.get('enabledWidgets') as string || '{}'),
    };

    const result = createCardSchema.safeParse(rawData);
    
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return { success: false, errors, error: 'Validation failed' };
    }
    
    const validatedData = result.data;

    // Check if username is already taken
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', validatedData.username)
      .maybeSingle();

    if (existingProfile) {
      return { success: false, error: 'Username already taken' };
    }

    // If this is set as primary, unset other primary cards
    if (validatedData.is_primary) {
      await supabase
        .from('profiles')
        // @ts-expect-error - Database types not yet updated
        .update({ is_primary: false })
        .eq('user_id', user.id);
    }

    // Create the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      // @ts-expect-error - Database types not yet updated
      .insert({
        user_id: user.id,
        card_name: validatedData.card_name,
        username: validatedData.username,
        is_public: validatedData.is_public,
        is_primary: validatedData.is_primary,
        display_name: validatedData.display_name || null,
        job_title: validatedData.job_title || null,
        company: validatedData.company || null,
        location: validatedData.location || null,
        bio: validatedData.bio || null,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        website: validatedData.website || null,
        address: validatedData.address || null,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        profile_image_url: validatedData.profile_image_url || null,
      })
      .select()
      .single();

    if (profileError || !profile) {
      console.error('Profile creation error:', profileError);
      return { success: false, error: 'Failed to create card' };
    }

    // Widget settings are automatically created by the database trigger
    // But we need to update them based on user preferences
    const widgetUpdates = Object.entries(validatedData.enabledWidgets).map(([widget_type, enabled]) => ({
      // @ts-expect-error - Profile type inference issue
      profile_id: profile.id,
      widget_type,
      enabled: enabled as boolean,
    }));

    // Update widget settings
    for (const widget of widgetUpdates) {
      await supabase
        .from('widget_settings')
        // @ts-expect-error - Database types not yet updated
        .update({ enabled: widget.enabled })
        .eq('profile_id', widget.profile_id)
        .eq('widget_type', widget.widget_type);
    }

    // Revalidate paths
    revalidatePath('/home');
    revalidatePath(`/${validatedData.username}`);

    return { 
      success: true, 
      data: { 
        // @ts-expect-error - Profile type inference issue
        id: profile.id, 
        username: validatedData.username 
      } 
    };
  } catch (error) {
    console.error('Create card error:', error);
    return { success: false, error: 'Failed to create card' };
  }
}

export async function updateCardVisibility(cardId: string, isPublic: boolean) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const { error } = await supabase
      .from('profiles')
      // @ts-expect-error - Database types not yet updated
      .update({ is_public: isPublic })
      .eq('id', cardId)
      .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath('/home');
    return { success: true };
  } catch (error) {
    console.error('Update visibility error:', error);
    return { success: false, error: 'Failed to update visibility' };
  }
}

export async function deleteCard(cardId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', cardId)
      .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath('/home');
    return { success: true };
  } catch (error) {
    console.error('Delete card error:', error);
    return { success: false, error: 'Failed to delete card' };
  }
}

export async function setCardAsPrimary(cardId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    // Unset all primary cards
    await supabase
      .from('profiles')
      // @ts-expect-error - Database types not yet updated
      .update({ is_primary: false })
      .eq('user_id', user.id);

    // Set this card as primary
    const { error } = await supabase
      .from('profiles')
      // @ts-expect-error - Database types not yet updated
      .update({ is_primary: true })
      .eq('id', cardId)
      .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath('/home');
    return { success: true };
  } catch (error) {
    console.error('Set primary error:', error);
    return { success: false, error: 'Failed to set as primary' };
  }
}

// Validation schema for updating a card
const updateCardSchema = z.object({
  profile_id: z.string().min(1, 'Profile ID is required'),
  card_name: z.string().min(1, 'Card name is required').max(100),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50).regex(/^[a-z0-9-]+$/, 'Username can only contain lowercase letters, numbers, and hyphens'),
  is_public: z.boolean().default(true),
  is_primary: z.boolean().default(false),
  display_name: z.string().optional(),
  job_title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  address: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  profile_image_url: z.string().optional(),
  // Widget settings
  enabledWidgets: z.object({
    profile: z.boolean().default(true),
    bio: z.boolean().default(true),
    links: z.boolean().default(true),
    social: z.boolean().default(true),
    services: z.boolean().default(true),
    contact: z.boolean().default(true),
    map: z.boolean().default(true),
  }).default({
    profile: true,
    bio: true,
    links: true,
    social: true,
    services: true,
    contact: true,
    map: true,
  }),
});

export async function updateCard(formData: FormData) {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated', fieldErrors: {} };
  }

  try {
    // Parse and validate form data
    const rawData = {
      profile_id: formData.get('profile_id') as string,
      card_name: formData.get('card_name') as string,
      username: formData.get('username') as string,
      is_public: formData.get('is_public') === 'true',
      is_primary: formData.get('is_primary') === 'true',
      display_name: formData.get('display_name') as string,
      job_title: formData.get('job_title') as string,
      company: formData.get('company') as string,
      location: formData.get('location') as string,
      bio: formData.get('bio') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      website: formData.get('website') as string,
      address: formData.get('address') as string,
      latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null,
      longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null,
      profile_image_url: formData.get('profile_image_url') as string,
      enabledWidgets: JSON.parse(formData.get('enabledWidgets') as string || '{}'),
    };

    const validationResult = updateCardSchema.safeParse(rawData);
    
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        const field = err.path.join('.');
        fieldErrors[field] = err.message;
      });
      return { success: false, error: 'Validation failed', fieldErrors };
    }

    const validatedData = validationResult.data;

    // Verify ownership
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id, username')
      .eq('id', validatedData.profile_id)
      .maybeSingle();

    if (!existingProfile) {
      return { success: false, error: 'Card not found', fieldErrors: {} };
    }

    // @ts-expect-error - Database types not yet updated
    if (existingProfile.user_id !== user.id) {
      return { success: false, error: 'Not authorized to edit this card', fieldErrors: {} };
    }

    // Check if username is already taken by another profile
    // @ts-expect-error - Database types not yet updated
    if (existingProfile.username !== validatedData.username) {
      const { data: usernameCheck } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', validatedData.username)
        .maybeSingle();

      if (usernameCheck) {
        return { 
          success: false, 
          error: 'Username already taken', 
          fieldErrors: { username: 'This username is already taken' } 
        };
      }
    }

    // If this is set as primary, unset other primary cards
    if (validatedData.is_primary) {
      await supabase
        .from('profiles')
        // @ts-expect-error - Database types not yet updated
        .update({ is_primary: false })
        .eq('user_id', user.id)
        .neq('id', validatedData.profile_id);
    }

    // Update the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      // @ts-expect-error - Database types not yet updated
      .update({
        card_name: validatedData.card_name,
        username: validatedData.username,
        is_public: validatedData.is_public,
        is_primary: validatedData.is_primary,
        display_name: validatedData.display_name || null,
        job_title: validatedData.job_title || null,
        company: validatedData.company || null,
        location: validatedData.location || null,
        bio: validatedData.bio || null,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        website: validatedData.website || null,
        address: validatedData.address || null,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        profile_image_url: validatedData.profile_image_url || null,
      })
      .eq('id', validatedData.profile_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (profileError || !profile) {
      console.error('Profile update error:', profileError);
      return { success: false, error: 'Failed to update card', fieldErrors: {} };
    }

    // Update widget settings
    const widgetUpdates = Object.entries(validatedData.enabledWidgets).map(([widget_type, enabled]) => ({
      // @ts-expect-error - Profile type inference issue
      profile_id: profile.id,
      widget_type,
      enabled: enabled as boolean,
    }));

    for (const widget of widgetUpdates) {
      await supabase
        .from('widget_settings')
        // @ts-expect-error - Database types not yet updated
        .update({ enabled: widget.enabled })
        .eq('profile_id', widget.profile_id)
        .eq('widget_type', widget.widget_type);
    }

    // Revalidate paths
    revalidatePath('/home');
    // @ts-expect-error - Database types not yet updated
    revalidatePath(`/${existingProfile.username}`);
    revalidatePath(`/${validatedData.username}`);

    return { 
      success: true, 
      data: { 
        // @ts-expect-error - Profile type inference issue
        id: profile.id, 
        username: validatedData.username 
      },
      fieldErrors: {} 
    };
  } catch (error) {
    console.error('Update card error:', error);
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const field = err.path.join('.');
        fieldErrors[field] = err.message;
      });
      return { success: false, error: 'Validation failed', fieldErrors };
    }
    return { success: false, error: 'Failed to update card', fieldErrors: {} };
  }
}
