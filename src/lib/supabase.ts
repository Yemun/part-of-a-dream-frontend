import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Database types
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
      comments: {
        Row: {
          id: string
          post_slug: string
          author_name: string
          author_email: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          post_slug: string
          author_name: string
          author_email: string
          content: string
        }
        Update: {
          post_slug?: string
          author_name?: string
          author_email?: string
          content?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Simple lazy initialization
let supabaseClient: SupabaseClient | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // 서버 사이드에서는 세션 유지 불필요
      },
    })
  }
  return supabaseClient
}

export type Comment = Database['public']['Tables']['comments']['Row']
export type CommentInsert = Database['public']['Tables']['comments']['Insert']
export type CommentUpdate = Database['public']['Tables']['comments']['Update']