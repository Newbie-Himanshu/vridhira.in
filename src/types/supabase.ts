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
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            carts: {
                Row: {
                    items: Json | null
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    items?: Json | null
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    items?: Json | null
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "carts_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: true
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                ]
            }
            categories: {
                Row: {
                    created_at: string
                    description: string | null
                    id: string
                    image_url: string | null
                    is_active: boolean | null
                    name: string
                }
                Insert: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    image_url?: string | null
                    is_active?: boolean | null
                    name: string
                }
                Update: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    image_url?: string | null
                    is_active?: boolean | null
                    name?: string
                }
                Relationships: []
            }
            customers: {
                Row: {
                    address: string | null
                    bio: string | null
                    created_at: string
                    email: string | null
                    first_name: string | null
                    id: string
                    is_verified: boolean | null
                    last_name: string | null
                    phone_number: string | null
                    phone_number_verified: boolean | null
                    role: string | null
                    username: string | null
                }
                Insert: {
                    address?: string | null
                    bio?: string | null
                    created_at?: string
                    email?: string | null
                    first_name?: string | null
                    id: string
                    is_verified?: boolean | null
                    last_name?: string | null
                    phone_number?: string | null
                    phone_number_verified?: boolean | null
                    role?: string | null
                    username?: string | null
                }
                Update: {
                    address?: string | null
                    bio?: string | null
                    created_at?: string
                    email?: string | null
                    first_name?: string | null
                    id?: string
                    is_verified?: boolean | null
                    last_name?: string | null
                    phone_number?: string | null
                    phone_number_verified?: boolean | null
                    role?: string | null
                    username?: string | null
                }
                Relationships: []
            }
            orders: {
                Row: {
                    created_at: string
                    customer_name: string | null
                    id: string
                    items: Json
                    platform_fee: number | null
                    status: string | null
                    total_amount: number
                    user_id: string | null
                }
                Insert: {
                    created_at?: string
                    customer_name?: string | null
                    id?: string
                    items: Json
                    platform_fee?: number | null
                    status?: string | null
                    total_amount: number
                    user_id?: string | null
                }
                Update: {
                    created_at?: string
                    customer_name?: string | null
                    id?: string
                    items?: Json
                    platform_fee?: number | null
                    status?: string | null
                    total_amount?: number
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "orders_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                ]
            }
            page_customizations: {
                Row: {
                    accent_color: string | null
                    enable_zoom: boolean | null
                    id: string
                    show_breadcrumbs: boolean | null
                    show_related_products: boolean | null
                    template: string | null
                }
                Insert: {
                    accent_color?: string | null
                    enable_zoom?: boolean | null
                    id: string
                    show_breadcrumbs?: boolean | null
                    show_related_products?: boolean | null
                    template?: string | null
                }
                Update: {
                    accent_color?: string | null
                    enable_zoom?: boolean | null
                    id?: string
                    show_breadcrumbs?: boolean | null
                    show_related_products?: boolean | null
                    template?: string | null
                }
                Relationships: []
            }
            platform_settings: {
                Row: {
                    announcement_message: string | null
                    announcement_type: string | null
                    id: string
                    maintenance_mode: boolean | null
                    platform_fee_percentage: number | null
                    show_announcement: boolean | null
                }
                Insert: {
                    announcement_message?: string | null
                    announcement_type?: string | null
                    id: string
                    maintenance_mode?: boolean | null
                    platform_fee_percentage?: number | null
                    show_announcement?: boolean | null
                }
                Update: {
                    announcement_message?: string | null
                    announcement_type?: string | null
                    id?: string
                    maintenance_mode?: boolean | null
                    platform_fee_percentage?: number | null
                    show_announcement?: boolean | null
                }
                Relationships: []
            }
            products: {
                Row: {
                    brand: string | null
                    category: string | null
                    created_at: string
                    description: string | null
                    discount_percentage: number | null
                    id: string
                    image_url: string | null
                    is_featured: boolean | null
                    price: number
                    sale_price: number | null
                    sku: string | null
                    specs: Json | null
                    stock: number | null
                    tags: string[] | null
                    title: string
                    type: string | null
                    variants: Json | null
                }
                Insert: {
                    brand?: string | null
                    category?: string | null
                    created_at?: string
                    description?: string | null
                    discount_percentage?: number | null
                    id?: string
                    image_url?: string | null
                    is_featured?: boolean | null
                    price: number
                    sale_price?: number | null
                    sku?: string | null
                    specs?: Json | null
                    stock?: number | null
                    tags?: string[] | null
                    title: string
                    type?: string | null
                    variants?: Json | null
                }
                Update: {
                    brand?: string | null
                    category?: string | null
                    created_at?: string
                    description?: string | null
                    discount_percentage?: number | null
                    id?: string
                    image_url?: string | null
                    is_featured?: boolean | null
                    price?: number
                    sale_price?: number | null
                    sku?: string | null
                    specs?: Json | null
                    stock?: number | null
                    tags?: string[] | null
                    title?: string
                    type?: string | null
                    variants?: Json | null
                }
                Relationships: []
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
