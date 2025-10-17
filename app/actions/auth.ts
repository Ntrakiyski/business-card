'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signInSchema, signUpSchema } from '@/lib/validations/auth'

type SignInResult = 
  | { success: true; redirectUrl: string }
  | { success: false; error: { email?: string[]; password?: string[]; general?: string[] } };

type SignUpResult = 
  | { success: true; redirectUrl: string }
  | { success: false; error: { email?: string[]; password?: string[]; confirmPassword?: string[]; general?: string[] } };

export async function signIn(formData: FormData): Promise<SignInResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validate with Zod
  const validatedFields = signInSchema.safeParse({
    email,
    password,
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: validatedFields.data.email,
      password: validatedFields.data.password,
    })

    if (error) {
      console.error('Error signing in:', error)
      return {
        success: false,
        error: { general: [error.message] },
      }
    }

    // Revalidate path to clear any cached data
    revalidatePath('/', 'layout')
    
    // Return success with redirect URL to let client handle navigation
    return {
      success: true,
      redirectUrl: '/my-card'
    }
  } catch (error) {
    console.error('Error during sign in:', error)
    return {
      success: false,
      error: { general: ['An unexpected error occurred. Please try again.'] },
    }
  }
}

export async function signUp(formData: FormData): Promise<SignUpResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validate with Zod
  const validatedFields = signUpSchema.safeParse({
    email,
    password,
    confirmPassword,
  })

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.signUp({
      email: validatedFields.data.email,
      password: validatedFields.data.password,
    })

    if (error) {
      console.error('Error signing up:', error)
      return {
        success: false,
        error: { general: [error.message] },
      }
    }

    // Revalidate path to clear any cached data
    revalidatePath('/', 'layout')
    
    // Return success with redirect URL to let client handle navigation
    return {
      success: true,
      redirectUrl: '/login?message=Check your email for a confirmation link'
    }
  } catch (error) {
    console.error('Error during sign up:', error)
    return {
      success: false,
      error: { general: ['An unexpected error occurred. Please try again.'] },
    }
  }
}

export async function logout(redirectPath: string = '/') {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error)
      throw error
    }
  } catch (error) {
    console.error('Error during logout:', error)
    throw error
  } finally {
    revalidatePath('/', 'layout')
    
    // Use the NEXT_PUBLIC_APP_URL environment variable if available, otherwise use the default path
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const finalRedirectPath = appUrl ? `${appUrl}${redirectPath}` : redirectPath;
    
    redirect(finalRedirectPath)
  }
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    console.error('OAuth error:', error)
    throw error
  }

  if (data.url) {
    redirect(data.url) // Outside try/catch
  }
}
