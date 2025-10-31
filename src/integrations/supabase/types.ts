export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      compound_schedule: {
        Row: {
          created_at: string | null
          frequency: string
          id: string
          last_compound_at: string | null
          next_compound_at: string
          stake_id: string
          status: string | null
          total_compounds: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          frequency: string
          id?: string
          last_compound_at?: string | null
          next_compound_at: string
          stake_id: string
          status?: string | null
          total_compounds?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          frequency?: string
          id?: string
          last_compound_at?: string | null
          next_compound_at?: string
          stake_id?: string
          status?: string | null
          total_compounds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compound_schedule_stake_id_fkey"
            columns: ["stake_id"]
            isOneToOne: false
            referencedRelation: "user_stakes"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_burn_log: {
        Row: {
          auto_staked: boolean | null
          created_at: string | null
          dcoin_burned: number
          gift_id: string | null
          id: string
          stake_id: string | null
          stdcoin_minted: number
          user_id: string
        }
        Insert: {
          auto_staked?: boolean | null
          created_at?: string | null
          dcoin_burned: number
          gift_id?: string | null
          id?: string
          stake_id?: string | null
          stdcoin_minted: number
          user_id: string
        }
        Update: {
          auto_staked?: boolean | null
          created_at?: string | null
          dcoin_burned?: number
          gift_id?: string | null
          id?: string
          stake_id?: string | null
          stdcoin_minted?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_burn_log_stake_id_fkey"
            columns: ["stake_id"]
            isOneToOne: false
            referencedRelation: "user_stakes"
            referencedColumns: ["id"]
          },
        ]
      }
      livestream_gifts: {
        Row: {
          amount: number
          created_at: string
          from_user_id: string
          gift_type: string
          id: string
          livestream_id: string
          round_id: string
          to_creator_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          from_user_id: string
          gift_type: string
          id?: string
          livestream_id: string
          round_id: string
          to_creator_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          from_user_id?: string
          gift_type?: string
          id?: string
          livestream_id?: string
          round_id?: string
          to_creator_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "livestream_gifts_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "livestream_gifts_livestream_id_fkey"
            columns: ["livestream_id"]
            isOneToOne: false
            referencedRelation: "livestreams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "livestream_gifts_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "livestream_rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "livestream_gifts_to_creator_id_fkey"
            columns: ["to_creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      livestream_rounds: {
        Row: {
          collaborator_score: number
          creator_score: number
          ended_at: string | null
          id: string
          livestream_id: string
          milestone: number
          round_number: number
          started_at: string
          status: string
          winner_id: string | null
        }
        Insert: {
          collaborator_score?: number
          creator_score?: number
          ended_at?: string | null
          id?: string
          livestream_id: string
          milestone?: number
          round_number: number
          started_at?: string
          status?: string
          winner_id?: string | null
        }
        Update: {
          collaborator_score?: number
          creator_score?: number
          ended_at?: string | null
          id?: string
          livestream_id?: string
          milestone?: number
          round_number?: number
          started_at?: string
          status?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "livestream_rounds_livestream_id_fkey"
            columns: ["livestream_id"]
            isOneToOne: false
            referencedRelation: "livestreams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "livestream_rounds_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      livestreams: {
        Row: {
          collaborator_id: string | null
          created_at: string
          creator_id: string
          current_round: number
          description: string | null
          ended_at: string | null
          id: string
          started_at: string | null
          status: string
          title: string
        }
        Insert: {
          collaborator_id?: string | null
          created_at?: string
          creator_id: string
          current_round?: number
          description?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          title: string
        }
        Update: {
          collaborator_id?: string | null
          created_at?: string
          creator_id?: string
          current_round?: number
          description?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "livestreams_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "livestreams_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          dcoin_balance: number
          flow_address: string | null
          id: string
          stdcoin_balance: number | null
          updated_at: string
          user_id: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          dcoin_balance?: number
          flow_address?: string | null
          id?: string
          stdcoin_balance?: number | null
          updated_at?: string
          user_id?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          dcoin_balance?: number
          flow_address?: string | null
          id?: string
          stdcoin_balance?: number | null
          updated_at?: string
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      staking_pools: {
        Row: {
          base_apy: number
          boosted_apy: number
          created_at: string | null
          description: string | null
          duration_days: number
          id: string
          min_stake: number
          name: string
          perks: Json | null
          reward_frequency: string
          status: string | null
          total_staked: number | null
          updated_at: string | null
        }
        Insert: {
          base_apy: number
          boosted_apy: number
          created_at?: string | null
          description?: string | null
          duration_days: number
          id?: string
          min_stake: number
          name: string
          perks?: Json | null
          reward_frequency: string
          status?: string | null
          total_staked?: number | null
          updated_at?: string | null
        }
        Update: {
          base_apy?: number
          boosted_apy?: number
          created_at?: string | null
          description?: string | null
          duration_days?: number
          id?: string
          min_stake?: number
          name?: string
          perks?: Json | null
          reward_frequency?: string
          status?: string | null
          total_staked?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      staking_rewards: {
        Row: {
          amount: number
          claimed: boolean | null
          claimed_at: string | null
          created_at: string | null
          id: string
          reward_type: string
          stake_id: string
          user_id: string
        }
        Insert: {
          amount: number
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          reward_type: string
          stake_id: string
          user_id: string
        }
        Update: {
          amount?: number
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          reward_type?: string
          stake_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staking_rewards_stake_id_fkey"
            columns: ["stake_id"]
            isOneToOne: false
            referencedRelation: "user_stakes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stakes: {
        Row: {
          amount: number
          auto_compound: boolean | null
          created_at: string | null
          id: string
          pool_id: string
          staked_at: string | null
          status: string | null
          total_rewards_claimed: number | null
          unlock_at: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          auto_compound?: boolean | null
          created_at?: string | null
          id?: string
          pool_id: string
          staked_at?: string | null
          status?: string | null
          total_rewards_claimed?: number | null
          unlock_at: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          auto_compound?: boolean | null
          created_at?: string | null
          id?: string
          pool_id?: string
          staked_at?: string | null
          status?: string | null
          total_rewards_claimed?: number | null
          unlock_at?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stakes_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "staking_pools"
            referencedColumns: ["id"]
          },
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
