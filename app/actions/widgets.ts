'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';

type SocialLinkInsert = Database['public']['Tables']['social_links']['Insert'];
type SocialLinkUpdate = Database['public']['Tables']['social_links']['Update'];
type CustomLinkInsert = Database['public']['Tables']['custom_links']['Insert'];
type CustomLinkUpdate = Database['public']['Tables']['custom_links']['Update'];
type ServiceInsert = Database['public']['Tables']['services']['Insert'];
type ServiceUpdate = Database['public']['Tables']['services']['Update'];

// ============================================
// SOCIAL LINKS ACTIONS
// ============================================

export async function createSocialLink(data: Omit<SocialLinkInsert, 'id' | 'created_at'>) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('social_links')
      // @ts-expect-error - Supabase types issue
      .insert(data);

    if (error) {
      console.error('Create social link error:', error);
      return { success: false, error: 'Failed to create social link' };
    }

    revalidatePath('/my-card');
    return { success: true };
  } catch (error) {
    console.error('Create social link error:', error);
    return { success: false, error: 'Failed to create social link' };
  }
}

export async function updateSocialLink(id: string, data: SocialLinkUpdate) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('social_links')
      // @ts-expect-error - Supabase types issue
      .update(data)
      .eq('id', id);

    if (error) {
      console.error('Update social link error:', error);
      return { success: false, error: 'Failed to update social link' };
    }

    revalidatePath('/my-card');
    return { success: true };
  } catch (error) {
    console.error('Update social link error:', error);
    return { success: false, error: 'Failed to update social link' };
  }
}

export async function deleteSocialLink(id: string) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('social_links')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete social link error:', error);
      return { success: false, error: 'Failed to delete social link' };
    }

    revalidatePath('/my-card');
    return { success: true };
  } catch (error) {
    console.error('Delete social link error:', error);
    return { success: false, error: 'Failed to delete social link' };
  }
}

// ============================================
// CUSTOM LINKS (FEATURED LINKS) ACTIONS
// ============================================

export async function createCustomLink(data: Omit<CustomLinkInsert, 'id' | 'created_at'>) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('custom_links')
      // @ts-expect-error - Supabase types issue
      .insert(data);

    if (error) {
      console.error('Create custom link error:', error);
      return { success: false, error: 'Failed to create custom link' };
    }

    revalidatePath('/my-card');
    return { success: true };
  } catch (error) {
    console.error('Create custom link error:', error);
    return { success: false, error: 'Failed to create custom link' };
  }
}

export async function updateCustomLink(id: string, data: CustomLinkUpdate) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('custom_links')
      // @ts-expect-error - Supabase types issue
      .update(data)
      .eq('id', id);

    if (error) {
      console.error('Update custom link error:', error);
      return { success: false, error: 'Failed to update custom link' };
    }

    revalidatePath('/my-card');
    return { success: true };
  } catch (error) {
    console.error('Update custom link error:', error);
    return { success: false, error: 'Failed to update custom link' };
  }
}

export async function deleteCustomLink(id: string) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('custom_links')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete custom link error:', error);
      return { success: false, error: 'Failed to delete custom link' };
    }

    revalidatePath('/my-card');
    return { success: true };
  } catch (error) {
    console.error('Delete custom link error:', error);
    return { success: false, error: 'Failed to delete custom link' };
  }
}

// ============================================
// SERVICES ACTIONS
// ============================================

export async function createService(data: Omit<ServiceInsert, 'id' | 'created_at'>) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('services')
      // @ts-expect-error - Supabase types issue
      .insert(data);

    if (error) {
      console.error('Create service error:', error);
      return { success: false, error: 'Failed to create service' };
    }

    revalidatePath('/my-card');
    return { success: true };
  } catch (error) {
    console.error('Create service error:', error);
    return { success: false, error: 'Failed to create service' };
  }
}

export async function updateService(id: string, data: ServiceUpdate) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('services')
      // @ts-expect-error - Supabase types issue
      .update(data)
      .eq('id', id);

    if (error) {
      console.error('Update service error:', error);
      return { success: false, error: 'Failed to update service' };
    }

    revalidatePath('/my-card');
    return { success: true };
  } catch (error) {
    console.error('Update service error:', error);
    return { success: false, error: 'Failed to update service' };
  }
}

export async function deleteService(id: string) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete service error:', error);
      return { success: false, error: 'Failed to delete service' };
    }

    revalidatePath('/my-card');
    return { success: true };
  } catch (error) {
    console.error('Delete service error:', error);
    return { success: false, error: 'Failed to delete service' };
  }
}

// ============================================
// WIDGET SETTINGS ACTIONS
// ============================================

export async function toggleWidgetVisibility(profileId: string, widgetType: string, enabled: boolean) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify user owns this profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id, username')
      .eq('id', profileId)
      .single() as { data: { user_id: string; username: string } | null };

    if (!profile || profile.user_id !== user.id) {
      return { success: false, error: 'Not authorized' };
    }

    const { error } = await supabase
      .from('widget_settings')
      // @ts-expect-error - Supabase type inference issue with update
      .update({ enabled })
      .eq('profile_id', profileId)
      .eq('widget_type', widgetType);

    if (error) {
      console.error('Toggle widget visibility error:', error);
      return { success: false, error: 'Failed to update widget visibility' };
    }

    // Revalidate the profile page
    if (profile.username) {
      revalidatePath(`/${profile.username}`, 'page');
    }
    revalidatePath('/home', 'page');
    
    return { success: true };
  } catch (error) {
    console.error('Toggle widget visibility error:', error);
    return { success: false, error: 'Failed to update widget visibility' };
  }
}

// ============================================
// PROFILE VISIBILITY ACTIONS
// ============================================

export async function toggleProfilePublic(profileId: string, isPublic: boolean) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify user owns this profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id, username')
      .eq('id', profileId)
      .single() as { data: { user_id: string; username: string } | null };

    if (!profile || profile.user_id !== user.id) {
      return { success: false, error: 'Not authorized' };
    }

    const { error } = await supabase
      .from('profiles')
      // @ts-expect-error - Supabase type inference issue with update
      .update({ is_public: isPublic })
      .eq('id', profileId);

    if (error) {
      console.error('Toggle profile public error:', error);
      return { success: false, error: 'Failed to update profile visibility' };
    }

    // Revalidate the profile page
    if (profile.username) {
      revalidatePath(`/${profile.username}`, 'page');
    }
    revalidatePath('/home', 'page');
    
    return { success: true };
  } catch (error) {
    console.error('Toggle profile public error:', error);
    return { success: false, error: 'Failed to update profile visibility' };
  }
}
