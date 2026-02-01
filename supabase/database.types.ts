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
          mission_id: number | null
          params: Json | null
          queue_id: number
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
          mission_id?: number | null
          params?: Json | null
          queue_id: number
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
          mission_id?: number | null
          params?: Json | null
          queue_id?: number
          state?: Database["public"]["Enums"]["commandstate"]
          type?: Database["public"]["Enums"]["commandtype"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_table"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_settings: {
        Row: {
          continue_with_full_channel: number
          duration: number
          id: number
          is_header: number
          is_okay: number
          max_voltage: number
          min_voltage: number
          resolution: number
          samples: number
          start_command_id: number | null
          type: Database["public"]["Enums"]["RequestType"]
        }
        Insert: {
          continue_with_full_channel: number
          duration: number
          id?: number
          is_header: number
          is_okay: number
          max_voltage: number
          min_voltage: number
          resolution: number
          samples: number
          start_command_id?: number | null
          type: Database["public"]["Enums"]["RequestType"]
        }
        Update: {
          continue_with_full_channel?: number
          duration?: number
          id?: number
          is_header?: number
          is_okay?: number
          max_voltage?: number
          min_voltage?: number
          resolution?: number
          samples?: number
          start_command_id?: number | null
          type?: Database["public"]["Enums"]["RequestType"]
        }
        Relationships: []
      }
      missions: {
        Row: {
          abortInfo: Json | null
          createdBy: string
          device: Database["public"]["Enums"]["device"]
          execution_time: string | null
          id: number
          name: string | null
          publishedBy: number | null
          settings: number
          status: Database["public"]["Enums"]["MissionState"]
        }
        Insert: {
          abortInfo?: Json | null
          createdBy: string
          device: Database["public"]["Enums"]["device"]
          execution_time?: string | null
          id?: number
          name?: string | null
          publishedBy?: number | null
          settings: number
          status: Database["public"]["Enums"]["MissionState"]
        }
        Update: {
          abortInfo?: Json | null
          createdBy?: string
          device?: Database["public"]["Enums"]["device"]
          execution_time?: string | null
          id?: number
          name?: string | null
          publishedBy?: number | null
          settings?: number
          status?: Database["public"]["Enums"]["MissionState"]
        }
        Relationships: [
          {
            foreignKeyName: "missions_settings_fkey"
            columns: ["settings"]
            isOneToOne: false
            referencedRelation: "mission_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      packets: {
        Row: {
          date: string | null
          details: Json | null
          device: Database["public"]["Enums"]["device"] | null
          id: number
          mission_id: number | null
          packet: string | null
          type: Database["public"]["Enums"]["packettype"] | null
        }
        Insert: {
          date?: string | null
          details?: Json | null
          device?: Database["public"]["Enums"]["device"] | null
          id?: number
          mission_id?: number | null
          packet?: string | null
          type?: Database["public"]["Enums"]["packettype"] | null
        }
        Update: {
          date?: string | null
          details?: Json | null
          device?: Database["public"]["Enums"]["device"] | null
          id?: number
          mission_id?: number | null
          packet?: string | null
          type?: Database["public"]["Enums"]["packettype"] | null
        }
        Relationships: [
          {
            foreignKeyName: "mission"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_table"
            referencedColumns: ["id"]
          },
        ]
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
      missions_table: {
        Row: {
          device: Database["public"]["Enums"]["device"] | null
          execution_time: string | null
          id: number | null
          meta: Json | null
          name: string | null
          status: Database["public"]["Enums"]["MissionState"] | null
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
      MissionState:
        | "CREATED"
        | "SCHEDULED"
        | "UPLOADED"
        | "EXECUTING"
        | "PROCESSING"
        | "PUBLISHED"
        | "ABORTED"
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
      RequestType: "MAX_TIME" | "MAX_HITS"
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
      MissionState: [
        "CREATED",
        "SCHEDULED",
        "UPLOADED",
        "EXECUTING",
        "PROCESSING",
        "PUBLISHED",
        "ABORTED",
      ],
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
      RequestType: ["MAX_TIME", "MAX_HITS"],
    },
  },
} as const
