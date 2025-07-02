import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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