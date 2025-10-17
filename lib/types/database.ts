export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          display_name: string | null
          job_title: string | null
          company: string | null
          location: string | null
          bio: string | null
          profile_image_url: string | null
          email: string | null
          phone: string | null
          website: string | null
          address: string | null
          latitude: string | null  // DECIMAL is returned as string from PostgREST
          longitude: string | null // DECIMAL is returned as string from PostgREST
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          display_name?: string | null
          job_title?: string | null
          company?: string | null
          location?: string | null
          bio?: string | null
          profile_image_url?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          address?: string | null
          latitude?: string | null
          longitude?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          display_name?: string | null
          job_title?: string | null
          company?: string | null
          location?: string | null
          bio?: string | null
          profile_image_url?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          address?: string | null
          latitude?: string | null
          longitude?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      business_cards: {
        Row: {
          id: string
          user_id: string
          profile_id: string
          name: string
          title: string | null
          company: string | null
          email: string | null
          phone: string | null
          website: string | null
          address: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          profile_id: string
          name: string
          title?: string | null
          company?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          address?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          profile_id?: string
          name?: string
          title?: string | null
          company?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          address?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      custom_links: {
        Row: {
          id: string
          profile_id: string
          title: string
          url: string
          image_url: string | null
          order: number
          enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          title: string
          url: string
          image_url?: string | null
          order?: number
          enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          title?: string
          url?: string
          image_url?: string | null
          order?: number
          enabled?: boolean
          created_at?: string
        }
      }
      social_links: {
        Row: {
          id: string
          profile_id: string
          platform: string
          url: string
          enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          platform: string
          url: string
          enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          platform?: string
          url?: string
          enabled?: boolean
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          profile_id: string
          title: string
          description: string | null
          icon: string | null
          order: number
          enabled: boolean
          created_at: string
          bullets: Json | null  // Added bullets field
        }
        Insert: {
          id?: string
          profile_id: string
          title: string
          description?: string | null
          icon?: string | null
          order?: number
          enabled?: boolean
          created_at?: string
          bullets?: Json | null  // Added bullets field
        }
        Update: {
          id?: string
          profile_id?: string
          title?: string
          description?: string | null
          icon?: string | null
          order?: number
          enabled?: boolean
          created_at?: string
          bullets?: Json | null  // Added bullets field
        }
      }
      widget_settings: {
        Row: {
          id: string
          profile_id: string
          widget_type: string
          enabled: boolean
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          widget_type: string
          enabled?: boolean
          order?: number
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          widget_type?: string
          enabled?: boolean
          order?: number
          created_at?: string
        }
      }
    }
  }
}

