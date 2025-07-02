import { createClient } from '@supabase/supabase-js'

// Lazy initialization to prevent build errors when env vars are not available
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not configured')
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  
  return supabaseClient
}

// Legacy export for backward compatibility
export const supabase = {
  get from() {
    return getSupabaseClient().from.bind(getSupabaseClient())
  }
}

export interface Comment {
  id: string
  post_slug: string
  author_name: string
  author_email: string
  content: string
  created_at: string
  updated_at: string
}

export type CommentInsert = Omit<Comment, 'id' | 'created_at' | 'updated_at'>
export type CommentUpdate = Partial<Pick<Comment, 'content' | 'author_name' | 'author_email'>>