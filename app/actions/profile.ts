'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { usernameSchema } from '@/lib/validations/profile'

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
