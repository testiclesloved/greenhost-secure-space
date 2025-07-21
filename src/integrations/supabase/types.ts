export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      storage_accounts: {
        Row: {
          account_email: string
          account_password: string
          created_at: string
          id: string
          purchase_id: string
          setup_completed: boolean
          storage_quota_gb: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_email: string
          account_password: string
          created_at?: string
          id?: string
          purchase_id: string
          setup_completed?: boolean
          storage_quota_gb: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_email?: string
          account_password?: string
          created_at?: string
          id?: string
          purchase_id?: string
          setup_completed?: boolean
          storage_quota_gb?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_accounts_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "user_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_plans: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          monthly_fee: number
          name: string
          one_time_fee: number | null
          plan_type: Database["public"]["Enums"]["storage_plan_type"]
          storage_gb: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          monthly_fee: number
          name: string
          one_time_fee?: number | null
          plan_type: Database["public"]["Enums"]["storage_plan_type"]
          storage_gb: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          monthly_fee?: number
          name?: string
          one_time_fee?: number | null
          plan_type?: Database["public"]["Enums"]["storage_plan_type"]
          storage_gb?: number
          updated_at?: string
        }
        Relationships: []
      }
      storage_users: {
        Row: {
          created_at: string
          id: string
          password: string
          sftp_link: string | null
          storage_account_id: string
          username: string
          web_link: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          password: string
          sftp_link?: string | null
          storage_account_id: string
          username: string
          web_link?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          password?: string
          sftp_link?: string | null
          storage_account_id?: string
          username?: string
          web_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_users_storage_account_id_fkey"
            columns: ["storage_account_id"]
            isOneToOne: false
            referencedRelation: "storage_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_purchases: {
        Row: {
          account_number: string | null
          admin_confirmed: boolean
          amount_paid: number
          company_email: string | null
          created_at: string
          id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          sftpgo_api_key: string | null
          storage_plan_id: string
          storage_setup_completed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          admin_confirmed?: boolean
          amount_paid: number
          company_email?: string | null
          created_at?: string
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          sftpgo_api_key?: string | null
          storage_plan_id: string
          storage_setup_completed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          admin_confirmed?: boolean
          amount_paid?: number
          company_email?: string | null
          created_at?: string
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          sftpgo_api_key?: string | null
          storage_plan_id?: string
          storage_setup_completed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_purchases_storage_plan_id_fkey"
            columns: ["storage_plan_id"]
            isOneToOne: false
            referencedRelation: "storage_plans"
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
      payment_status: "pending" | "confirmed" | "failed"
      storage_plan_type: "personal" | "enterprise" | "custom"
      user_role: "user" | "admin"
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
    Enums: {
      payment_status: ["pending", "confirmed", "failed"],
      storage_plan_type: ["personal", "enterprise", "custom"],
      user_role: ["user", "admin"],
    },
  },
} as const
