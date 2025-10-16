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
          full_name: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          full_name?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          full_name?: string | null
          bio?: string | null
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
    }
  }
}

