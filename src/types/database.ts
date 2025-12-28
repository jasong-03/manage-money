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
      companies: {
        Row: {
          id: string
          name: string
          payment_type: 'weekly' | 'monthly'
          payment_day: number | null
          expected_amount: number
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          payment_type: 'weekly' | 'monthly'
          payment_day?: number | null
          expected_amount?: number
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          payment_type?: 'weekly' | 'monthly'
          payment_day?: number | null
          expected_amount?: number
          color?: string
          created_at?: string
        }
      }
      incomes: {
        Row: {
          id: string
          company_id: string
          period: string
          payment_date: string | null
          amount: number
          status: 'pending' | 'received'
          received_date: string | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          period: string
          payment_date?: string | null
          amount: number
          status?: 'pending' | 'received'
          received_date?: string | null
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          period?: string
          payment_date?: string | null
          amount?: number
          status?: 'pending' | 'received'
          received_date?: string | null
          note?: string | null
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          category: string
          amount: number
          description: string
          raw_input: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          amount: number
          description: string
          raw_input: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          amount?: number
          description?: string
          raw_input?: string
          date?: string
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          name: string
          amount: number
          billing_day: number
          category: string
          is_active: boolean
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          amount: number
          billing_day: number
          category: string
          is_active?: boolean
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          amount?: number
          billing_day?: number
          category?: string
          is_active?: boolean
          color?: string
          created_at?: string
        }
      }
    }
  }
}
