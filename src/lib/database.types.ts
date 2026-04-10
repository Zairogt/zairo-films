export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          is_admin: boolean
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          is_admin?: boolean
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          email?: string
          is_admin?: boolean
          avatar_url?: string | null
        }
        Relationships: []
      }
      movies: {
        Row: {
          id: string
          title: string
          sinopsis: string | null
          tagline: string | null
          year: number | null
          duration: string | null
          genre: string | null
          director: string | null
          poster_url: string | null
          backdrop: string | null
          trailer_url: string | null
          precio_ver: number
          precio_descargar: number
          featured: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          sinopsis?: string | null
          tagline?: string | null
          year?: number | null
          duration?: string | null
          genre?: string | null
          director?: string | null
          poster_url?: string | null
          backdrop?: string | null
          trailer_url?: string | null
          precio_ver?: number
          precio_descargar?: number
          featured?: boolean
          sort_order?: number
        }
        Update: {
          title?: string
          sinopsis?: string | null
          tagline?: string | null
          year?: number | null
          duration?: string | null
          genre?: string | null
          director?: string | null
          poster_url?: string | null
          backdrop?: string | null
          trailer_url?: string | null
          precio_ver?: number
          precio_descargar?: number
          featured?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      movie_secure: {
        Row: {
          movie_id: string
          video_url: string
        }
        Insert: {
          movie_id: string
          video_url: string
        }
        Update: {
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "movie_secure_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: true
            referencedRelation: "movies"
            referencedColumns: ["id"]
          }
        ]
      }
      purchases: {
        Row: {
          id: string
          user_id: string
          movie_id: string
          tier: 'watch' | 'download'
          amount: number
          stripe_payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          movie_id: string
          tier: 'watch' | 'download'
          amount: number
          stripe_payment_id?: string | null
          created_at?: string
        }
        Update: {
          tier?: 'watch' | 'download'
          amount?: number
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Movie = Database['public']['Tables']['movies']['Row']
export type MovieSecure = Database['public']['Tables']['movie_secure']['Row']
export type Purchase = Database['public']['Tables']['purchases']['Row']
