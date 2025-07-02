// This file contains TypeScript types for your Supabase database
// Generate this file using: npx supabase gen types typescript --project-id your-project-id > src/lib/supabase/database.types.ts

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
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          plan: 'STARTER' | 'FAMILY' | 'PREMIUM'
          stripe_customer_id: string | null
          billing_email: string | null
          trial_ends_at: string | null
          subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          plan?: 'STARTER' | 'FAMILY' | 'PREMIUM'
          stripe_customer_id?: string | null
          billing_email?: string | null
          trial_ends_at?: string | null
          subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          plan?: 'STARTER' | 'FAMILY' | 'PREMIUM'
          stripe_customer_id?: string | null
          billing_email?: string | null
          trial_ends_at?: string | null
          subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
          avatar: string | null
          country: string
          preferred_currency: string
          language: string
          timezone: string
          organization_id: string
          family_id: string | null
          email_verified: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
          avatar?: string | null
          country?: string
          preferred_currency?: string
          language?: string
          timezone?: string
          organization_id: string
          family_id?: string | null
          email_verified?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
          avatar?: string | null
          country?: string
          preferred_currency?: string
          language?: string
          timezone?: string
          organization_id?: string
          family_id?: string | null
          email_verified?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          name: string
          type: 'BANK_ACCOUNT' | 'INVESTMENT' | 'PROPERTY' | 'CRYPTO' | 'LOAN' | 'CASH' | 'OTHER'
          institution: string | null
          account_number: string | null
          balance: number
          currency: string
          user_id: string
          organization_id: string
          plaid_account_id: string | null
          basiq_account_id: string | null
          is_active: boolean
          last_synced: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'BANK_ACCOUNT' | 'INVESTMENT' | 'PROPERTY' | 'CRYPTO' | 'LOAN' | 'CASH' | 'OTHER'
          institution?: string | null
          account_number?: string | null
          balance?: number
          currency?: string
          user_id: string
          organization_id: string
          plaid_account_id?: string | null
          basiq_account_id?: string | null
          is_active?: boolean
          last_synced?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'BANK_ACCOUNT' | 'INVESTMENT' | 'PROPERTY' | 'CRYPTO' | 'LOAN' | 'CASH' | 'OTHER'
          institution?: string | null
          account_number?: string | null
          balance?: number
          currency?: string
          user_id?: string
          organization_id?: string
          plaid_account_id?: string | null
          basiq_account_id?: string | null
          is_active?: boolean
          last_synced?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          description: string
          amount: number
          currency: string
          type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
          category: string | null
          date: string
          asset_id: string
          user_id: string
          organization_id: string
          is_recurring: boolean
          tags: string[] | null
          notes: string | null
          plaid_transaction_id: string | null
          basiq_transaction_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          description: string
          amount: number
          currency?: string
          type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
          category?: string | null
          date: string
          asset_id: string
          user_id: string
          organization_id: string
          is_recurring?: boolean
          tags?: string[] | null
          notes?: string | null
          plaid_transaction_id?: string | null
          basiq_transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          description?: string
          amount?: number
          currency?: string
          type?: 'INCOME' | 'EXPENSE' | 'TRANSFER'
          category?: string | null
          date?: string
          asset_id?: string
          user_id?: string
          organization_id?: string
          is_recurring?: boolean
          tags?: string[] | null
          notes?: string | null
          plaid_transaction_id?: string | null
          basiq_transaction_id?: string | null
          created_at?: string
          updated_at?: string
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