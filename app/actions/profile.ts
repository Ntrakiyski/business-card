'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { usernameSchema } from '@/lib/validations/profile'
import { Database } from '@/lib/database.types'

// Helper to verify user owns the profile
async function verifyProfileOwnership(profileId: string) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user || user.id !== profileId) {
    throw new Error('Unauthorized')
  }
  
  return { supabase, user }
}

export async function setUsername(formData: FormData) {
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

    // Insert or update profile
    const profileData = {
      user_id: user.id,
      username: validatedFields.data.username,
    }
    
    const { error: upsertError } = await supabase
      .from('profiles')
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Supabase type inference issue
      .upsert(profileData, {
        onConflict: 'user_id'
      })

    if (upsertError) {
      console.error('Error setting username:', upsertError)
      return {
        success: false,
        error: { general: ['Failed to set username. Please try again.'] },
      }
    }

    revalidatePath('/', 'layout')
    redirect('/my-card')
  } catch (error) {
    console.error('Error setting username:', error)
    return {
      success: false,
      error: { general: ['An unexpected error occurred. Please try again.'] },
    }
  }
}

// Update profile information (name, title, company, location)
export async function updateProfile(profileId: string, data: {
  display_name?: string
  job_title?: string
  company?: string
  location?: string
  bio?: string
  email?: string
  phone?: string
  website?: string
  address?: string
  latitude?: number
  longitude?: number
}) {
  try {
    const { supabase, user } = await verifyProfileOwnership(profileId)

    // Build update object with only provided fields
    const updateData: Record<string, string | number | null | undefined> = {
      updated_at: new Date().toISOString()
    }
    
    // Add only the fields that were provided
    if (data.display_name !== undefined) updateData.display_name = data.display_name
    if (data.job_title !== undefined) updateData.job_title = data.job_title
    if (data.company !== undefined) updateData.company = data.company
    if (data.location !== undefined) updateData.location = data.location
    if (data.bio !== undefined) updateData.bio = data.bio
    if (data.email !== undefined) updateData.email = data.email
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.website !== undefined) updateData.website = data.website
    if (data.address !== undefined) updateData.address = data.address
    if (data.latitude !== undefined) updateData.latitude = data.latitude
    if (data.longitude !== undefined) updateData.longitude = data.longitude

    // Type assertion needed due to Supabase client schema mismatch
    const { error } = await supabase
      .from('profiles')
      .update(updateData as Database['public']['Tables']['profiles']['Update'])
      .eq('id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: 'Failed to update profile' }
    }

    revalidatePath(`/[username]`, 'page')
    return { success: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: 'Unauthorized or failed to update' }
  }
}

// Update or create custom links
export async function updateCustomLinks(profileId: string, links: Array<{
  id?: string
  title: string
  url: string
  image_url?: string
  order: number
}>) {
  try {
    const { supabase, user } = await verifyProfileOwnership(profileId)

    // Delete existing links that aren't in the new list
    const existingLinkIds = links.filter(l => l.id).map(l => l.id)
    if (existingLinkIds.length > 0) {
      await supabase
        .from('custom_links')
        .delete()
        .eq('profile_id', user.id)
        .not('id', 'in', `(${existingLinkIds.join(',')})`)
    } else {
      // Delete all if no IDs provided
      await supabase
        .from('custom_links')
        .delete()
        .eq('profile_id', user.id)
    }

    // Upsert all links
    const linksToUpsert = links.map(link => ({
      id: link.id || undefined,
      profile_id: user.id,
      title: link.title,
      url: link.url,
      image_url: link.image_url,
      order: link.order,
      enabled: true
    }))

    const { error } = await supabase
      .from('custom_links')
      .upsert(linksToUpsert)

    if (error) {
      console.error('Error updating links:', error)
      return { success: false, error: 'Failed to update links' }
    }

    revalidatePath(`/[username]`, 'page')
    return { success: true }
  } catch (error) {
    console.error('Error updating links:', error)
    return { success: false, error: 'Unauthorized or failed to update' }
  }
}

// Update or create social links
export async function updateSocialLinks(profileId: string, links: Array<{
  id?: string
  platform: string
  url: string
}>) {
  try {
    const { supabase, user } = await verifyProfileOwnership(profileId)

    // Delete existing links that aren't in the new list
    const existingLinkIds = links.filter(l => l.id).map(l => l.id)
    if (existingLinkIds.length > 0) {
      await supabase
        .from('social_links')
        .delete()
        .eq('profile_id', user.id)
        .not('id', 'in', `(${existingLinkIds.join(',')})`)
    } else {
      // Delete all if no IDs provided
      await supabase
        .from('social_links')
        .delete()
        .eq('profile_id', user.id)
    }

    // Upsert all links
    const linksToUpsert = links.map(link => ({
      id: link.id || undefined,
      profile_id: user.id,
      platform: link.platform,
      url: link.url,
      enabled: true
    }))

    const { error } = await supabase
      .from('social_links')
      .upsert(linksToUpsert)

    if (error) {
      console.error('Error updating social links:', error)
      return { success: false, error: 'Failed to update social links' }
    }

    revalidatePath(`/[username]`, 'page')
    return { success: true }
  } catch (error) {
    console.error('Error updating social links:', error)
    return { success: false, error: 'Unauthorized or failed to update' }
  }
}

// Update or create services
export async function updateServices(profileId: string, services: Array<{
  id?: string
  title: string
  description?: string
  icon?: string
  order: number
}>) {
  try {
    const { supabase, user } = await verifyProfileOwnership(profileId)

    // Delete existing services that aren't in the new list
    const existingServiceIds = services.filter(s => s.id).map(s => s.id)
    if (existingServiceIds.length > 0) {
      await supabase
        .from('services')
        .delete()
        .eq('profile_id', user.id)
        .not('id', 'in', `(${existingServiceIds.join(',')})`)
    } else {
      // Delete all if no IDs provided
      await supabase
        .from('services')
        .delete()
        .eq('profile_id', user.id)
    }

    // Upsert all services
    const servicesToUpsert = services.map(service => ({
      id: service.id || undefined,
      profile_id: user.id,
      title: service.title,
      description: service.description,
      icon: service.icon,
      order: service.order,
      enabled: true
    }))

    const { error } = await supabase
      .from('services')
      .upsert(servicesToUpsert)

    if (error) {
      console.error('Error updating services:', error)
      return { success: false, error: 'Failed to update services' }
    }

    revalidatePath(`/[username]`, 'page')
    return { success: true }
  } catch (error) {
    console.error('Error updating services:', error)
    return { success: false, error: 'Unauthorized or failed to update' }
  }
}
