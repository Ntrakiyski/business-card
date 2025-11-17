'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signUpSchema, signInSchema } from '@/lib/validations/auth'

export async function signUp(formData: FormData) {
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
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error('Signup error:', error)
      return {
        success: false,
        error: { general: [error.message] },
      }
    }

    revalidatePath('/', 'layout')
    return {
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
    }
  } catch (error) {
    console.error('Signup error:', error)
    return {
      success: false,
      error: { general: ['An unexpected error occurred. Please try again.'] },
    }
  }
}

export async function signIn(formData: FormData) {
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
      console.error('Login error:', error)
      return {
        success: false,
        error: { general: [error.message] },
      }
    }

    revalidatePath('/', 'layout')
    redirect('/onboarding')
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: { general: ['An unexpected error occurred. Please try again.'] },
    }
  }
}

export async function signOut() {
  const supabase = await createClient()

  try {
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/')
  } catch (error) {
    console.error('Signout error:', error)
    return {
      success: false,
      error: 'Failed to sign out. Please try again.',
    }
  }
}
