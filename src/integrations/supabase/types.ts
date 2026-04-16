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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      connections: {
        Row: {
          connected_organization_id: string | null
          connected_user_id: string
          created_at: string
          follow_up_date: string | null
          id: string
          note: string | null
          tag: string | null
          user_id: string
        }
        Insert: {
          connected_organization_id?: string | null
          connected_user_id: string
          created_at?: string
          follow_up_date?: string | null
          id?: string
          note?: string | null
          tag?: string | null
          user_id: string
        }
        Update: {
          connected_organization_id?: string | null
          connected_user_id?: string
          created_at?: string
          follow_up_date?: string | null
          id?: string
          note?: string | null
          tag?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_connected_organization_id_fkey"
            columns: ["connected_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_connections_connected_user_id"
            columns: ["connected_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_connections_connected_user_id"
            columns: ["connected_user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_connections_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_connections_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_data"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          description: string | null
          email: string
          file_name: string | null
          file_url: string | null
          follow_up_date: string | null
          id: string
          message: string | null
          name: string
          organization_id: string | null
          phone: string | null
          profile_owner_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          email: string
          file_name?: string | null
          file_url?: string | null
          follow_up_date?: string | null
          id?: string
          message?: string | null
          name: string
          organization_id?: string | null
          phone?: string | null
          profile_owner_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string
          file_name?: string | null
          file_url?: string | null
          follow_up_date?: string | null
          id?: string
          message?: string | null
          name?: string
          organization_id?: string | null
          phone?: string | null
          profile_owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_submissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contact_submissions_profile_owner_id"
            columns: ["profile_owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contact_submissions_profile_owner_id"
            columns: ["profile_owner_id"]
            isOneToOne: false
            referencedRelation: "public_profile_data"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_activity_log: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          employee_id: string
          id: string
          organization_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          employee_id: string
          id?: string
          organization_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          employee_id?: string
          id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employee_activity_log_employee_id"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employee_activity_log_employee_id"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "public_profile_data"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_data_permissions: {
        Row: {
          created_at: string
          granted: boolean
          granted_at: string | null
          id: string
          organization_member_id: string
          permission_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          organization_member_id: string
          permission_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          organization_member_id?: string
          permission_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_data_permissions_organization_member_id_fkey"
            columns: ["organization_member_id"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_performance_metrics: {
        Row: {
          connections_made_count: number | null
          conversion_rate: number | null
          created_at: string
          employee_id: string
          engagement_score: number | null
          id: string
          leads_generated_count: number | null
          link_clicks_count: number | null
          metric_date: string
          organization_id: string
          profile_views_count: number | null
          updated_at: string
        }
        Insert: {
          connections_made_count?: number | null
          conversion_rate?: number | null
          created_at?: string
          employee_id: string
          engagement_score?: number | null
          id?: string
          leads_generated_count?: number | null
          link_clicks_count?: number | null
          metric_date?: string
          organization_id: string
          profile_views_count?: number | null
          updated_at?: string
        }
        Update: {
          connections_made_count?: number | null
          conversion_rate?: number | null
          created_at?: string
          employee_id?: string
          engagement_score?: number | null
          id?: string
          leads_generated_count?: number | null
          link_clicks_count?: number | null
          metric_date?: string
          organization_id?: string
          profile_views_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_performance_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employee_performance_metrics_employee_id"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employee_performance_metrics_employee_id"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "public_profile_data"
            referencedColumns: ["id"]
          },
        ]
      }
      event_announcements: {
        Row: {
          created_at: string
          created_by: string
          event_id: string
          id: string
          is_active: boolean
          message: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          event_id: string
          id?: string
          is_active?: boolean
          message: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          event_id?: string
          id?: string
          is_active?: boolean
          message?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_announcements_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_areas: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_areas_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_clicks: {
        Row: {
          clicked_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          clicked_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          clicked_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_clicks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_custom_content: {
        Row: {
          content: Json | null
          created_at: string | null
          event_id: string
          id: string
          is_active: boolean | null
          position: number | null
          section_type: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          event_id: string
          id?: string
          is_active?: boolean | null
          position?: number | null
          section_type: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          event_id?: string
          id?: string
          is_active?: boolean | null
          position?: number | null
          section_type?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_custom_content_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_favorites: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_favorites_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_invitations: {
        Row: {
          code: string
          created_at: string
          email: string | null
          event_id: string
          expires_at: string | null
          id: string
          invited_by: string
          used: boolean
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code?: string
          created_at?: string
          email?: string | null
          event_id: string
          expires_at?: string | null
          id?: string
          invited_by: string
          used?: boolean
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          email?: string | null
          event_id?: string
          expires_at?: string | null
          id?: string
          invited_by?: string
          used?: boolean
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_invitations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_landing_config: {
        Row: {
          created_at: string | null
          description: string | null
          event_id: string
          event_name: string | null
          id: string
          logo_url: string | null
          payment_amount: string | null
          payment_deadline: string | null
          payment_links: Json | null
          payment_url: string | null
          show_payment: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_id: string
          event_name?: string | null
          id?: string
          logo_url?: string | null
          payment_amount?: string | null
          payment_deadline?: string | null
          payment_links?: Json | null
          payment_url?: string | null
          show_payment?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_id?: string
          event_name?: string | null
          id?: string
          logo_url?: string | null
          payment_amount?: string | null
          payment_deadline?: string | null
          payment_links?: Json | null
          payment_url?: string | null
          show_payment?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_landing_config_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_meeting_requests: {
        Row: {
          created_at: string
          event_id: string
          id: string
          message: string | null
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          message?: string | null
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          message?: string | null
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_meeting_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          meeting_request_id: string
          read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          meeting_request_id: string
          read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          meeting_request_id?: string
          read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_messages_meeting_request_id_fkey"
            columns: ["meeting_request_id"]
            isOneToOne: false
            referencedRelation: "event_meeting_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participant_metrics: {
        Row: {
          captured_at: string
          created_at: string
          event_id: string
          id: string
          is_during_event: boolean
          metadata: Json | null
          metric_type: Database["public"]["Enums"]["event_metric_type"]
          participant_id: string
        }
        Insert: {
          captured_at?: string
          created_at?: string
          event_id: string
          id?: string
          is_during_event?: boolean
          metadata?: Json | null
          metric_type: Database["public"]["Enums"]["event_metric_type"]
          participant_id: string
        }
        Update: {
          captured_at?: string
          created_at?: string
          event_id?: string
          id?: string
          is_during_event?: boolean
          metadata?: Json | null
          metric_type?: Database["public"]["Enums"]["event_metric_type"]
          participant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participant_metrics_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participant_permissions: {
        Row: {
          created_at: string
          event_participant_id: string
          granted: boolean
          granted_at: string | null
          id: string
          permission_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_participant_id: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          permission_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_participant_id?: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          permission_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participant_permissions_event_participant_id_fkey"
            columns: ["event_participant_id"]
            isOneToOne: false
            referencedRelation: "event_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          area_id: string | null
          checked_in: boolean
          checked_in_at: string | null
          created_at: string
          event_id: string
          id: string
          invitation_code: string | null
          registration_data: Json | null
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area_id?: string | null
          checked_in?: boolean
          checked_in_at?: string | null
          created_at?: string
          event_id: string
          id?: string
          invitation_code?: string | null
          registration_data?: Json | null
          role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area_id?: string | null
          checked_in?: boolean
          checked_in_at?: string | null
          created_at?: string
          event_id?: string
          id?: string
          invitation_code?: string | null
          registration_data?: Json | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "event_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_payments: {
        Row: {
          created_at: string
          event_id: string
          id: string
          payment_link_title: string | null
          payment_link_url: string
          response_code: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          payment_link_title?: string | null
          payment_link_url: string
          response_code?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          payment_link_title?: string | null
          payment_link_url?: string
          response_code?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_payments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_scheduled_meetings: {
        Row: {
          area_id: string | null
          created_at: string
          end_time: string | null
          event_id: string
          id: string
          meeting_date: string
          meeting_request_id: string
          note: string | null
          scheduled_by: string
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          area_id?: string | null
          created_at?: string
          end_time?: string | null
          event_id: string
          id?: string
          meeting_date: string
          meeting_request_id: string
          note?: string | null
          scheduled_by: string
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          area_id?: string | null
          created_at?: string
          end_time?: string | null
          event_id?: string
          id?: string
          meeting_date?: string
          meeting_request_id?: string
          note?: string | null
          scheduled_by?: string
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_scheduled_meetings_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "event_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_scheduled_meetings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_scheduled_meetings_meeting_request_id_fkey"
            columns: ["meeting_request_id"]
            isOneToOne: false
            referencedRelation: "event_meeting_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      event_session_feedback: {
        Row: {
          comment: string | null
          created_at: string | null
          event_id: string
          id: string
          rating: number
          session_index: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          rating: number
          session_index: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          rating?: number
          session_index?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_session_feedback_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_stands: {
        Row: {
          assigned_user_id: string | null
          company_email: string | null
          company_name: string | null
          created_at: string | null
          event_id: string
          id: string
          is_active: boolean | null
          onboarding_link_id: string
          qr_code_url: string | null
          send_review: boolean | null
          stand_name: string | null
          stand_number: number
          updated_at: string | null
        }
        Insert: {
          assigned_user_id?: string | null
          company_email?: string | null
          company_name?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          is_active?: boolean | null
          onboarding_link_id: string
          qr_code_url?: string | null
          send_review?: boolean | null
          stand_name?: string | null
          stand_number: number
          updated_at?: string | null
        }
        Update: {
          assigned_user_id?: string | null
          company_email?: string | null
          company_name?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          is_active?: boolean | null
          onboarding_link_id?: string
          qr_code_url?: string | null
          send_review?: boolean | null
          stand_name?: string | null
          stand_number?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_stands_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_support_messages: {
        Row: {
          content: string
          created_at: string
          event_id: string
          id: string
          is_organizer: boolean
          read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          event_id: string
          id?: string
          is_organizer?: boolean
          read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          event_id?: string
          id?: string
          is_organizer?: boolean
          read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_support_messages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          access_type: Database["public"]["Enums"]["event_access_type"]
          category: string | null
          city: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          event_date: string
          event_type: string | null
          event_url: string | null
          id: string
          image_url: string | null
          internal_event: boolean | null
          invitation_code: string | null
          is_featured: boolean | null
          location: string | null
          organization: string | null
          organization_id: string | null
          source: string | null
          title: string
          total_stands: number | null
          updated_at: string | null
        }
        Insert: {
          access_type?: Database["public"]["Enums"]["event_access_type"]
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_date: string
          event_type?: string | null
          event_url?: string | null
          id?: string
          image_url?: string | null
          internal_event?: boolean | null
          invitation_code?: string | null
          is_featured?: boolean | null
          location?: string | null
          organization?: string | null
          organization_id?: string | null
          source?: string | null
          title: string
          total_stands?: number | null
          updated_at?: string | null
        }
        Update: {
          access_type?: Database["public"]["Enums"]["event_access_type"]
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_date?: string
          event_type?: string | null
          event_url?: string | null
          id?: string
          image_url?: string | null
          internal_event?: boolean | null
          invitation_code?: string | null
          is_featured?: boolean | null
          location?: string | null
          organization?: string | null
          organization_id?: string | null
          source?: string | null
          title?: string
          total_stands?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          company_name: string
          created_at: string | null
          description: string | null
          end_date: string | null
          experience_type: string
          id: string
          is_current: boolean | null
          logo_url: string | null
          position: number | null
          role: string
          start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          experience_type: string
          id?: string
          is_current?: boolean | null
          logo_url?: string | null
          position?: number | null
          role: string
          start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          experience_type?: string
          id?: string
          is_current?: boolean | null
          logo_url?: string | null
          position?: number | null
          role?: string
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_data"
            referencedColumns: ["id"]
          },
        ]
      }
      link_groups: {
        Row: {
          active: boolean | null
          created_at: string | null
          display_title: boolean | null
          id: string
          position: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          display_title?: boolean | null
          id?: string
          position?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          display_title?: boolean | null
          id?: string
          position?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_link_groups_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_link_groups_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_data"
            referencedColumns: ["id"]
          },
        ]
      }
      links: {
        Row: {
          active: boolean | null
          created_at: string | null
          group_id: string | null
          icon: string
          id: string
          position: number | null
          title: string
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          group_id?: string | null
          icon: string
          id?: string
          position?: number | null
          title: string
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          group_id?: string | null
          icon?: string
          id?: string
          position?: number | null
          title?: string
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_links_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_links_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "links_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "link_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      onboarding: {
        Row: {
          confirmed_at: string | null
          created_at: string | null
          event_id: string | null
          event_stand_id: string | null
          id: string
          profile_public_link: string | null
          registration_type: string | null
          signup_link_id: string
          used: boolean | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string | null
          event_id?: string | null
          event_stand_id?: string | null
          id?: string
          profile_public_link?: string | null
          registration_type?: string | null
          signup_link_id: string
          used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string | null
          event_id?: string | null
          event_stand_id?: string | null
          id?: string
          profile_public_link?: string | null
          registration_type?: string | null
          signup_link_id?: string
          used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_event_stand_id_fkey"
            columns: ["event_stand_id"]
            isOneToOne: false
            referencedRelation: "event_stands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "public_profile_data"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_follow_up_settings: {
        Row: {
          created_at: string
          default_follow_up_days: number
          email_notifications_enabled: boolean
          id: string
          organization_id: string
          reminder_days_before: number
          updated_at: string
          webapp_notifications_enabled: boolean
        }
        Insert: {
          created_at?: string
          default_follow_up_days?: number
          email_notifications_enabled?: boolean
          id?: string
          organization_id: string
          reminder_days_before?: number
          updated_at?: string
          webapp_notifications_enabled?: boolean
        }
        Update: {
          created_at?: string
          default_follow_up_days?: number
          email_notifications_enabled?: boolean
          id?: string
          organization_id?: string
          reminder_days_before?: number
          updated_at?: string
          webapp_notifications_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "organization_follow_up_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_goals: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          current_value: number | null
          description: string | null
          end_date: string
          id: string
          organization_id: string
          period_type: string
          start_date: string
          status: string
          target_type: string
          target_value: number
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          current_value?: number | null
          description?: string | null
          end_date: string
          id?: string
          organization_id: string
          period_type: string
          start_date: string
          status?: string
          target_type: string
          target_value: number
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          current_value?: number | null
          description?: string | null
          end_date?: string
          id?: string
          organization_id?: string
          period_type?: string
          start_date?: string
          status?: string
          target_type?: string
          target_value?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_organization_goals_assigned_to"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_organization_goals_assigned_to"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "public_profile_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_organization_goals_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_organization_goals_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profile_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          department: string | null
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          message: string | null
          organization_id: string
          permissions_requested: string[] | null
          position: string | null
          role: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          department?: string | null
          email: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by: string
          message?: string | null
          organization_id: string
          permissions_requested?: string[] | null
          position?: string | null
          role: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          department?: string | null
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          message?: string | null
          organization_id?: string
          permissions_requested?: string[] | null
          position?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_organization_invitations_invited_by"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_organization_invitations_invited_by"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "public_profile_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          department: string | null
          department_id: string | null
          hire_date: string | null
          id: string
          invited_by: string | null
          joined_at: string | null
          organization_id: string
          position: string | null
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          department_id?: string | null
          hire_date?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          position?: string | null
          role: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          department_id?: string | null
          hire_date?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          position?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_organization_members_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_organization_members_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_notifications: {
        Row: {
          created_at: string | null
          id: string
          invitation_id: string
          read: boolean | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invitation_id: string
          read?: boolean | null
          type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invitation_id?: string
          read?: boolean | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_notifications_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "organization_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_team_highlights: {
        Row: {
          created_at: string
          custom_title: string | null
          id: string
          is_featured: boolean
          member_id: string
          position: number
          website_id: string
        }
        Insert: {
          created_at?: string
          custom_title?: string | null
          id?: string
          is_featured?: boolean
          member_id: string
          position?: number
          website_id: string
        }
        Update: {
          created_at?: string
          custom_title?: string | null
          id?: string
          is_featured?: boolean
          member_id?: string
          position?: number
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_team_highlights_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_team_highlights_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "organization_websites"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_website_sections: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          is_active: boolean
          position: number
          section_type: string
          title: string | null
          updated_at: string
          website_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          position?: number
          section_type: string
          title?: string | null
          updated_at?: string
          website_id: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          position?: number
          section_type?: string
          title?: string | null
          updated_at?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_website_sections_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "organization_websites"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_websites: {
        Row: {
          accent_color: string | null
          amenities: Json | null
          banner_image_url: string | null
          business_hours: Json | null
          business_type: string | null
          company_name: string
          created_at: string
          custom_domain: string | null
          description: string | null
          email: string | null
          facebook: string | null
          follower_count: number | null
          font_family: string | null
          id: string
          industry: string | null
          instagram: string | null
          is_published: boolean
          location: string | null
          logo_url: string | null
          meta_description: string | null
          meta_title: string | null
          organization_id: string
          payment_key: string | null
          payment_method: string | null
          phone: string | null
          price_range: string | null
          primary_color: string | null
          products: Json | null
          region: string | null
          secondary_color: string | null
          services: Json | null
          show_contact_form: boolean | null
          show_email: boolean | null
          show_gallery: boolean | null
          show_payment_method: boolean | null
          show_phone: boolean | null
          show_services: boolean | null
          show_team: boolean | null
          show_testimonials: boolean | null
          show_whatsapp: boolean | null
          slogan: string | null
          subdomain: string
          template_id: string
          updated_at: string
          website_url: string | null
          whatsapp: string | null
        }
        Insert: {
          accent_color?: string | null
          amenities?: Json | null
          banner_image_url?: string | null
          business_hours?: Json | null
          business_type?: string | null
          company_name: string
          created_at?: string
          custom_domain?: string | null
          description?: string | null
          email?: string | null
          facebook?: string | null
          follower_count?: number | null
          font_family?: string | null
          id?: string
          industry?: string | null
          instagram?: string | null
          is_published?: boolean
          location?: string | null
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          organization_id: string
          payment_key?: string | null
          payment_method?: string | null
          phone?: string | null
          price_range?: string | null
          primary_color?: string | null
          products?: Json | null
          region?: string | null
          secondary_color?: string | null
          services?: Json | null
          show_contact_form?: boolean | null
          show_email?: boolean | null
          show_gallery?: boolean | null
          show_payment_method?: boolean | null
          show_phone?: boolean | null
          show_services?: boolean | null
          show_team?: boolean | null
          show_testimonials?: boolean | null
          show_whatsapp?: boolean | null
          slogan?: string | null
          subdomain: string
          template_id?: string
          updated_at?: string
          website_url?: string | null
          whatsapp?: string | null
        }
        Update: {
          accent_color?: string | null
          amenities?: Json | null
          banner_image_url?: string | null
          business_hours?: Json | null
          business_type?: string | null
          company_name?: string
          created_at?: string
          custom_domain?: string | null
          description?: string | null
          email?: string | null
          facebook?: string | null
          follower_count?: number | null
          font_family?: string | null
          id?: string
          industry?: string | null
          instagram?: string | null
          is_published?: boolean
          location?: string | null
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          organization_id?: string
          payment_key?: string | null
          payment_method?: string | null
          phone?: string | null
          price_range?: string | null
          primary_color?: string | null
          products?: Json | null
          region?: string | null
          secondary_color?: string | null
          services?: Json | null
          show_contact_form?: boolean | null
          show_email?: boolean | null
          show_gallery?: boolean | null
          show_payment_method?: boolean | null
          show_phone?: boolean | null
          show_services?: boolean | null
          show_team?: boolean | null
          show_testimonials?: boolean | null
          show_whatsapp?: boolean | null
          slogan?: string | null
          subdomain?: string
          template_id?: string
          updated_at?: string
          website_url?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_websites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          banner_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          size_category: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          size_category?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          size_category?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_organizations_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_organizations_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profile_data"
            referencedColumns: ["id"]
          },
        ]
      }
      organizer_favorites: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizer_favorites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizer_team_members: {
        Row: {
          created_at: string
          id: string
          invite_token: string | null
          invited_email: string | null
          member_user_id: string
          owner_id: string
          permissions: string[]
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_token?: string | null
          invited_email?: string | null
          member_user_id: string
          owner_id: string
          permissions?: string[]
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_token?: string | null
          invited_email?: string | null
          member_user_id?: string
          owner_id?: string
          permissions?: string[]
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_audit_log: {
        Row: {
          action_type: string
          change_reason: string | null
          field_changed: string
          id: string
          ip_address: unknown
          metadata: Json | null
          new_value: string | null
          old_value: string | null
          table_name: string | null
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          change_reason?: string | null
          field_changed: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          table_name?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          change_reason?: string | null
          field_changed?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          table_name?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profile_design_settings: {
        Row: {
          background_color: string
          background_gradient_css: string | null
          background_gradient_end: string | null
          background_gradient_start: string | null
          background_image_url: string | null
          background_type: string
          button_background_color: string
          button_border_color: string | null
          button_border_style: string | null
          button_icon_color: string
          button_icon_position: string
          button_size: string
          button_text_color: string
          created_at: string
          description_color: string
          font_family: string
          id: string
          link_text_color: string
          name_color: string
          section_title_color: string
          text_alignment: string
          theme_key: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          background_color?: string
          background_gradient_css?: string | null
          background_gradient_end?: string | null
          background_gradient_start?: string | null
          background_image_url?: string | null
          background_type?: string
          button_background_color?: string
          button_border_color?: string | null
          button_border_style?: string | null
          button_icon_color?: string
          button_icon_position?: string
          button_size?: string
          button_text_color?: string
          created_at?: string
          description_color?: string
          font_family?: string
          id?: string
          link_text_color?: string
          name_color?: string
          section_title_color?: string
          text_alignment?: string
          theme_key?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          background_color?: string
          background_gradient_css?: string | null
          background_gradient_end?: string | null
          background_gradient_start?: string | null
          background_image_url?: string | null
          background_type?: string
          button_background_color?: string
          button_border_color?: string | null
          button_border_style?: string | null
          button_icon_color?: string
          button_icon_position?: string
          button_size?: string
          button_text_color?: string
          created_at?: string
          description_color?: string
          font_family?: string
          id?: string
          link_text_color?: string
          name_color?: string
          section_title_color?: string
          text_alignment?: string
          theme_key?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profile_design_settings_user_id"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_profile_design_settings_user_id"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profile_data"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_slug_history: {
        Row: {
          changed_at: string | null
          id: string
          new_slug: string
          old_slug: string | null
          onboarding_link_id: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string | null
          id?: string
          new_slug: string
          old_slug?: string | null
          onboarding_link_id?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          changed_at?: string | null
          id?: string
          new_slug?: string
          old_slug?: string | null
          onboarding_link_id?: string | null
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_slug_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_slug_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_data"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          id: string
          ip_address: string | null
          profile_id: string
          source: string | null
          timestamp: string
          user_agent: string | null
        }
        Insert: {
          id?: string
          ip_address?: string | null
          profile_id: string
          source?: string | null
          timestamp?: string
          user_agent?: string | null
        }
        Update: {
          id?: string
          ip_address?: string | null
          profile_id?: string
          source?: string | null
          timestamp?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profile_data"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_profile_type: string | null
          allow_network_saves: boolean
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          follow_up_reminder_days: number
          full_name: string | null
          headline: string | null
          id: string
          job_title: string | null
          lead_capture_enabled: boolean
          linkedin: string | null
          links_disclaimer_accepted: boolean | null
          name: string | null
          onboarding_completed: boolean
          organization_id: string | null
          phone_number: string | null
          photo_url: string | null
          profile_file_name: string | null
          profile_file_url: string | null
          share_email_publicly: boolean | null
          share_phone_publicly: boolean | null
          slug: string | null
          status: Database["public"]["Enums"]["account_status"]
          theme_preference: string | null
          updated_at: string | null
          use_new_public_page: boolean | null
          website: string | null
        }
        Insert: {
          active_profile_type?: string | null
          allow_network_saves?: boolean
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          follow_up_reminder_days?: number
          full_name?: string | null
          headline?: string | null
          id: string
          job_title?: string | null
          lead_capture_enabled?: boolean
          linkedin?: string | null
          links_disclaimer_accepted?: boolean | null
          name?: string | null
          onboarding_completed?: boolean
          organization_id?: string | null
          phone_number?: string | null
          photo_url?: string | null
          profile_file_name?: string | null
          profile_file_url?: string | null
          share_email_publicly?: boolean | null
          share_phone_publicly?: boolean | null
          slug?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          theme_preference?: string | null
          updated_at?: string | null
          use_new_public_page?: boolean | null
          website?: string | null
        }
        Update: {
          active_profile_type?: string | null
          allow_network_saves?: boolean
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          follow_up_reminder_days?: number
          full_name?: string | null
          headline?: string | null
          id?: string
          job_title?: string | null
          lead_capture_enabled?: boolean
          linkedin?: string | null
          links_disclaimer_accepted?: boolean | null
          name?: string | null
          onboarding_completed?: boolean
          organization_id?: string | null
          phone_number?: string | null
          photo_url?: string | null
          profile_file_name?: string | null
          profile_file_url?: string | null
          share_email_publicly?: boolean | null
          share_phone_publicly?: boolean | null
          slug?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          theme_preference?: string | null
          updated_at?: string | null
          use_new_public_page?: boolean | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_orders: {
        Row: {
          created_at: string
          customer_company: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          items: Json
          notes: string | null
          order_number: string
          shipping_address: string | null
          shipping_city: string | null
          shipping_country: string | null
          shipping_postal_code: string | null
          status: string
          total_items: number
          total_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_company?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          id?: string
          items: Json
          notes?: string | null
          order_number: string
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_postal_code?: string | null
          status?: string
          total_items: number
          total_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_company?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_postal_code?: string | null
          status?: string
          total_items?: number
          total_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      stand_reviews: {
        Row: {
          candidate_user_id: string
          clarity_score: number
          created_at: string | null
          event_id: string
          fit_score: number
          id: string
          meeting_request_id: string
          motivation_score: number
          reviewer_user_id: string
          stand_id: string
          updated_at: string | null
        }
        Insert: {
          candidate_user_id: string
          clarity_score: number
          created_at?: string | null
          event_id: string
          fit_score: number
          id?: string
          meeting_request_id: string
          motivation_score: number
          reviewer_user_id: string
          stand_id: string
          updated_at?: string | null
        }
        Update: {
          candidate_user_id?: string
          clarity_score?: number
          created_at?: string | null
          event_id?: string
          fit_score?: number
          id?: string
          meeting_request_id?: string
          motivation_score?: number
          reviewer_user_id?: string
          stand_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stand_reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stand_reviews_meeting_request_id_fkey"
            columns: ["meeting_request_id"]
            isOneToOne: true
            referencedRelation: "event_meeting_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stand_reviews_stand_id_fkey"
            columns: ["stand_id"]
            isOneToOne: false
            referencedRelation: "event_stands"
            referencedColumns: ["id"]
          },
        ]
      }
      top_profile_views: {
        Row: {
          id: number
          name: string | null
          refreshed_at: string | null
          top_views: number | null
        }
        Insert: {
          id: number
          name?: string | null
          refreshed_at?: string | null
          top_views?: number | null
        }
        Update: {
          id?: number
          name?: string | null
          refreshed_at?: string | null
          top_views?: number | null
        }
        Relationships: []
      }
      user_interests: {
        Row: {
          created_at: string | null
          id: string
          industries: string[] | null
          networking_goals: string[] | null
          professional_roles: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          industries?: string[] | null
          networking_goals?: string[] | null
          professional_roles?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          industries?: string[] | null
          networking_goals?: string[] | null
          professional_roles?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profile_data"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profile_data: {
        Row: {
          allow_network_saves: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          headline: string | null
          id: string | null
          job_title: string | null
          lead_capture_enabled: boolean | null
          linkedin: string | null
          links_disclaimer_accepted: boolean | null
          name: string | null
          organization_id: string | null
          phone_number: string | null
          photo_url: string | null
          slug: string | null
          status: Database["public"]["Enums"]["account_status"] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          allow_network_saves?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: never
          headline?: string | null
          id?: string | null
          job_title?: string | null
          lead_capture_enabled?: boolean | null
          linkedin?: string | null
          links_disclaimer_accepted?: boolean | null
          name?: string | null
          organization_id?: string | null
          phone_number?: never
          photo_url?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["account_status"] | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          allow_network_saves?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: never
          headline?: string | null
          id?: string | null
          job_title?: string | null
          lead_capture_enabled?: boolean | null
          linkedin?: string | null
          links_disclaimer_accepted?: boolean | null
          name?: string | null
          organization_id?: string | null
          phone_number?: never
          photo_url?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["account_status"] | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_organization_invitation: {
        Args: { invitation_token_param: string; permissions_granted?: string[] }
        Returns: Json
      }
      accept_organizer_team_invite: {
        Args: { token_param: string }
        Returns: Json
      }
      add_business_days: {
        Args: { days: number; start_date: string }
        Returns: string
      }
      can_create_event_for_org: { Args: { org_id: string }; Returns: boolean }
      capture_event_metric: {
        Args: {
          _event_id: string
          _metadata?: Json
          _metric_type: Database["public"]["Enums"]["event_metric_type"]
          _participant_id: string
        }
        Returns: undefined
      }
      check_event_access: {
        Args: { _event_id: string; _invitation_code?: string; _user_id: string }
        Returns: boolean
      }
      cleanup_old_audit_logs: { Args: never; Returns: number }
      deactivate_user_account: { Args: never; Returns: undefined }
      generate_signup_links: {
        Args: { count_param: number }
        Returns: undefined
      }
      get_invitation_by_token: { Args: { token_param: string }; Returns: Json }
      get_organization_stats: { Args: { org_id: string }; Returns: Json }
      get_user_organization_id: { Args: never; Returns: string }
      has_event_permission: {
        Args: { _event_id: string; _permission_type: string; _user_id: string }
        Returns: boolean
      }
      has_permission: {
        Args: {
          org_id_param: string
          permission_type_param: string
          user_id_param: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      initialize_organization_metrics: {
        Args: { org_id: string }
        Returns: undefined
      }
      is_event_active: { Args: { _event_id: string }; Returns: boolean }
      is_event_organizer_for_profile: {
        Args: { _profile_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_admin_for_profile: {
        Args: { _profile_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
      is_organization_admin: { Args: { org_id: string }; Returns: boolean }
      is_slug_available: {
        Args: { excluding_user_id?: string; slug_to_check: string }
        Returns: boolean
      }
      loki: { Args: { query_text: string }; Returns: Json }
      migrate_existing_links: { Args: never; Returns: undefined }
      refresh_top_profile_views: { Args: never; Returns: undefined }
      search_pocketcv_users: {
        Args: { exclude_org_id?: string; search_term: string }
        Returns: {
          avatar_url: string
          email: string
          headline: string
          id: string
          is_member: boolean
          name: string
          slug: string
        }[]
      }
      sync_onboarding_slug: {
        Args: { new_slug_param: string; user_id_param: string }
        Returns: undefined
      }
      update_employee_performance_metrics: { Args: never; Returns: undefined }
    }
    Enums: {
      account_status: "active" | "deactivated"
      app_role: "admin" | "moderator" | "user"
      event_access_type: "public" | "invite_only"
      event_metric_type:
        | "profile_view"
        | "link_click"
        | "lead_capture"
        | "connection"
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
      account_status: ["active", "deactivated"],
      app_role: ["admin", "moderator", "user"],
      event_access_type: ["public", "invite_only"],
      event_metric_type: [
        "profile_view",
        "link_click",
        "lead_capture",
        "connection",
      ],
    },
  },
} as const
