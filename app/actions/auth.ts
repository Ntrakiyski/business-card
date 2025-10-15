'use server';

import { createClient } from '@/lib/supabase/server';
import { loginSchema, signupSchema, usernameSchema } from '@/lib/validation-schemas';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // Validate input
  const validatedFields = signupSchema.safeParse({
    email,
    password,
    confirmPassword,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.signUp({
      email: validatedFields.data.email,
      password: validatedFields.data.password,
    });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: 'Failed to create account',
      };
    }

    // Redirect to onboarding to set username
    return {
      success: true,
      message: 'Account created successfully! Please choose a username.',
      userId: data.user.id,
    };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validate input
  const validatedFields = loginSchema.safeParse({
    email,
    password,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    
    const { error } = await supabase.auth.signInWithPassword({
      email: validatedFields.data.email,
      password: validatedFields.data.password,
    });

    if (error) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    // Check if user has completed onboarding (has a profile with username)
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .single();

    if (!profile || !profile.username) {
      // Redirect to onboarding if profile not set up
      return {
        success: true,
        redirectTo: '/onboarding',
      };
    }

    // Redirect to their profile
    return {
      success: true,
      redirectTo: `/my-card`,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}

export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Signout error:', error);
    return {
      success: false,
      message: 'Failed to sign out',
    };
  }
  
  redirect('/login');
}

export async function completeOnboarding(formData: FormData) {
  const username = formData.get('username') as string;
  const display_name = formData.get('display_name') as string;

  // Validate username
  const validatedUsername = usernameSchema.safeParse({ username });

  if (!validatedUsername.success) {
    return {
      success: false,
      errors: validatedUsername.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: 'Not authenticated',
      };
    }

    // Check if username is available
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', validatedUsername.data.username)
      .single();

    if (existingProfile) {
      return {
        success: false,
        message: 'Username is already taken',
      };
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        username: validatedUsername.data.username,
        display_name: display_name || validatedUsername.data.username,
        email: user.email,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return {
        success: false,
        message: 'Failed to create profile. Please try again.',
      };
    }

    return {
      success: true,
      message: 'Profile created successfully!',
      username: validatedUsername.data.username,
    };
  } catch (error) {
    console.error('Onboarding error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}

export async function checkUsernameAvailability(username: string) {
  const validatedUsername = usernameSchema.safeParse({ username });

  if (!validatedUsername.success) {
    return {
      available: false,
      message: validatedUsername.error.errors[0].message,
    };
  }

  try {
    const supabase = await createClient();
    
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', validatedUsername.data.username)
      .single();

    return {
      available: !data,
      message: data ? 'Username is already taken' : 'Username is available',
    };
  } catch (error) {
    console.error('Username check error:', error);
    return {
      available: false,
      message: 'Could not check availability',
    };
  }
}

