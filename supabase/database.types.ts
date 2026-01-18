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
    PostgrestVersion: "13.0.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      commands: {
        Row: {
          cmd_device: Database["public"]["Enums"]["device"]
          cmd_id: number
          command: string
          deleted_by: string | null
          execution_time: string | null
          id: number
          params: Json | null
          queue_id: number | null
          state: Database["public"]["Enums"]["commandstate"]
          type: Database["public"]["Enums"]["commandtype"]
          user_id: string | null
        }
        Insert: {
          cmd_device: Database["public"]["Enums"]["device"]
          cmd_id: number
          command: string
          deleted_by?: string | null
          execution_time?: string | null
          id?: number
          params?: Json | null
          queue_id?: number | null
          state?: Database["public"]["Enums"]["commandstate"]
          type: Database["public"]["Enums"]["commandtype"]
          user_id?: string | null
        }
        Update: {
          cmd_device?: Database["public"]["Enums"]["device"]
          cmd_id?: number
          command?: string
          deleted_by?: string | null
          execution_time?: string | null
          id?: number
          params?: Json | null
          queue_id?: number | null
          state?: Database["public"]["Enums"]["commandstate"]
          type?: Database["public"]["Enums"]["commandtype"]
          user_id?: string | null
        }
        Relationships: []
      }
      packets: {
        Row: {
          date: string | null
          details: Json | null
          device: Database["public"]["Enums"]["device"] | null
          id: number
          packet: string | null
          type: Database["public"]["Enums"]["packettype"] | null
        }
        Insert: {
          date?: string | null
          details?: Json | null
          device?: Database["public"]["Enums"]["device"] | null
          id?: number
          packet?: string | null
          type?: Database["public"]["Enums"]["packettype"] | null
        }
        Update: {
          date?: string | null
          details?: Json | null
          device?: Database["public"]["Enums"]["device"] | null
          id?: number
          packet?: string | null
          type?: Database["public"]["Enums"]["packettype"] | null
        }
        Relationships: []
      }
    }
    Views: {
      commands_table: {
        Row: {
          cmd_device: Database["public"]["Enums"]["device"] | null
          command: string | null
          execution_time: string | null
          id: number | null
          meta: Json | null
          state: Database["public"]["Enums"]["commandstate"] | null
          type: Database["public"]["Enums"]["commandtype"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      schedule_command: {
        Args: { cron_time: string; id: number }
        Returns: undefined
      }
      upload_command: { Args: { command_id: number }; Returns: undefined }
    }
    Enums: {
      commandstate: "CREATED" | "SCHEDULED" | "UPLOADED" | "DELETED"
      commandtype:
        | "SET_DURATION"
        | "SET_SCALE"
        | "REQUEST_MEASUREMENT"
        | "REQUEST_SELFTEST"
        | "FORCE_STATUS_REPORT"
        | "RESET"
        | "RESTART"
        | "SAVE"
        | "STOP_MEASUREMENT"
        | "STOP"
      device: "BME_HUNITY" | "ONIONSAT_TEST" | "SLOTH"
      packettype:
        | "WELCOME"
        | "FLASH_DUMP"
        | "HEADER"
        | "SPECTRUM"
        | "SELFTEST"
        | "DEFAULT_STATUS_REPORT"
        | "FORCED_STATUS_REPORT"
        | "ERROR"
        | "GEIGER_COUNT"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      commandstate: ["CREATED", "SCHEDULED", "UPLOADED", "DELETED"],
      commandtype: [
        "SET_DURATION",
        "SET_SCALE",
        "REQUEST_MEASUREMENT",
        "REQUEST_SELFTEST",
        "FORCE_STATUS_REPORT",
        "RESET",
        "RESTART",
        "SAVE",
        "STOP_MEASUREMENT",
        "STOP",
      ],
      device: ["BME_HUNITY", "ONIONSAT_TEST", "SLOTH"],
      packettype: [
        "WELCOME",
        "FLASH_DUMP",
        "HEADER",
        "SPECTRUM",
        "SELFTEST",
        "DEFAULT_STATUS_REPORT",
        "FORCED_STATUS_REPORT",
        "ERROR",
        "GEIGER_COUNT",
      ],
    },
  },
} as const
