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
            products: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    description: string | null
                    price: number
                    stock: number
                    category: string | null
                    images: string[] | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    description?: string | null
                    price: number
                    stock?: number
                    category?: string | null
                    images?: string[] | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: string
                    description?: string | null
                    price?: number
                    stock?: number
                    category?: string | null
                    images?: string[] | null
                }
            }
            // Add other tables as needed based on Firebase collections
        }
    }
}
