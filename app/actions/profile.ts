'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { usernameSchema } from '@/lib/validations/profile'
import { z } from 'zod';
import { Database } from '@/lib/database.types';

import { profileSchema, bioSchema } from '@/lib/validations/profile';

type SetUsernameResult = 
  | { success: true; redirectUrl: string }
  | { success: false; error: { username?: string[]; general?: string[] } };

type UpdateProfileResult = 
  | { success: true }
  | { success: false; error: { [key: string]: string[] } };

type UpdateBioResult = 
  | { success: true }
  | { success: false; error: { bio?: string[]; general?: string[] } };

export async function setUsername(formData: FormData): Promise<SetUsernameResult> {
  const username = formData.get('username') as string

  // Validate with Zod
  const validatedFields = usernameSchema.safeParse({
    username,
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: { general: ['You must be logged in to set a username'] },
      }
    }

    // Check if username is already taken
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', validatedFields.data.username)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking username:', checkError)
      return {
        success: false,
        error: { general: ['Failed to check username availability'] },
      }
    }

    if (existingProfile) {
      return {
        success: false,
        error: { username: ['This username is already taken'] },
      }
    }

    // Create first profile for the user
    const profileData = {
      user_id: user.id,
      username: validatedFields.data.username,
      card_name: 'My Card',
      is_primary: true,
      is_public: true,
    }
    
    // Try to insert the profile
    const { error: insertError } = await supabase
      .from('profiles')
      // @ts-expect-error - Supabase type inference issue with insert
      .insert([profileData]);

    if (insertError) {
      console.error('Error inserting profile:', insertError);
      return {
        success: false,
        error: { general: ['Failed to set username. Please try again.'] },
      }
    }

    // Verify that the profile was created
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('user_id', user.id)
      .eq('username', validatedFields.data.username)
      .single();
    
    // @ts-expect-error - Supabase type inference issue
    if (fetchError || !profile || !profile.username) {
      console.error('Error fetching profile after setting username:', fetchError);
      return {
        success: false,
        error: { general: ['Failed to verify username setting. Please try again.'] },
      }
    }

    revalidatePath('/', 'layout')
    // Return success so the client can handle the redirect
    return {
      success: true,
      redirectUrl: '/home'
    }
  } catch (error) {
    console.error('Error setting username:', error)
    return {
      success: false,
      error: { general: ['An unexpected error occurred. Please try again.'] },
    }
  }
}

interface ProfileUpdateData {
  display_name?: string | null;
  job_title?: string | null;
  company?: string | null;
  location?: string | null;
  profile_image_url?: string | null;
  bio?: string | null;
}

export async function updateProfile(data: ProfileUpdateData): Promise<UpdateProfileResult> {
  const validatedFields = profileSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient();

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: { general: ['You must be logged in to update profile'] },
      }
    }

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      // @ts-expect-error - Supabase type inference issue with update
      .update({
        display_name: validatedFields.data.display_name,
        job_title: validatedFields.data.job_title,
        company: validatedFields.data.company,
        location: validatedFields.data.location,
        profile_image_url: validatedFields.data.profile_image_url,
        bio: validatedFields.data.bio,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return {
        success: false,
        error: { general: ['Failed to update profile. Please try again.'] },
      }
    }

    revalidatePath('/', 'layout');
    return {
      success: true,
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      error: { general: ['An unexpected error occurred. Please try again.'] },
    }
  }
}

export async function updateBio(bio: string): Promise<UpdateBioResult> {
  // Validate with Zod
  const validatedFields = bioSchema.safeParse({ bio });

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient();

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: { general: ['You must be logged in to update bio'] },
      }
    }

    // Update bio
    const { error: updateError } = await supabase
      .from('profiles')
      // @ts-expect-error - Supabase type inference issue with update
      .update({ bio: validatedFields.data.bio })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating bio:', updateError);
      return {
        success: false,
        error: { general: ['Failed to update bio. Please try again.'] },
      }
    }

    revalidatePath('/', 'layout');
    return {
      success: true,
    }
  } catch (error) {
    console.error('Error updating bio:', error);
    return {
      success: false,
      error: { general: ['An unexpected error occurred. Please try again.'] },
    }
  }
}

interface ContactUpdateData {
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
}

export async function updateContact(data: ContactUpdateData): Promise<UpdateProfileResult> {
  // Validate contact fields separately
  const contactSchema = z.object({
    phone: z.string().optional().or(z.literal('')),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
  });

  const validatedFields = contactSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient();

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: { general: ['You must be logged in to update contact'] },
      }
    }

    // Update profile with contact info
    const { error: updateError } = await supabase
      .from('profiles')
      // @ts-expect-error - Supabase type inference issue with update
      .update({
        phone: validatedFields.data.phone,
        email: validatedFields.data.email,
        website: validatedFields.data.website,
        address: validatedFields.data.address,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating contact:', updateError);
      return {
        success: false,
        error: { general: ['Failed to update contact information. Please try again.'] },
      }
    }

    revalidatePath('/', 'layout');
    return {
      success: true,
    }
  } catch (error) {
    console.error('Error updating contact:', error);
    return {
      success: false,
      error: { general: ['An unexpected error occurred. Please try again.'] },
    }
  }
}

interface LocationUpdateData {
  address?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export async function updateLocation(data: LocationUpdateData): Promise<UpdateProfileResult> {
  // For location, we'll just validate that coordinates are numbers if provided
  if ((data.latitude && isNaN(parseFloat(data.latitude as string))) || 
      (data.longitude && isNaN(parseFloat(data.longitude as string)))) {
    return {
      success: false,
      error: { 
        general: ['Latitude and longitude must be valid numbers'] 
      },
    };
  }

  const supabase = await createClient();

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: { general: ['You must be logged in to update location'] },
      }
    }

    // Update profile with location info
    const { error: updateError } = await supabase
      .from('profiles')
      // @ts-expect-error - Supabase type inference issue with update
      .update({
        address: data.address,
        latitude: data.latitude !== undefined && data.latitude !== null ? parseFloat(String(data.latitude)) : null,
        longitude: data.longitude !== undefined && data.longitude !== null ? parseFloat(String(data.longitude)) : null,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating location:', updateError);
      return {
        success: false,
        error: { general: ['Failed to update location. Please try again.'] },
      }
    }

    revalidatePath('/', 'layout');
    return {
      success: true,
    }
  } catch (error) {
    console.error('Error updating location:', error);
    return {
      success: false,
      error: { general: ['An unexpected error occurred. Please try again.'] },
    }
  }
}
