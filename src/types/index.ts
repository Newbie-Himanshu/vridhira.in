import { Database } from './supabase';

// --- Database Helper Types ---
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// --- Domain Types ---

export type Category = 'Pottery' | 'Textiles' | 'Decor' | 'Art' | 'Fashion';
export type ProductType = 'single' | 'variable' | 'group';
export type UserRole = 'owner' | 'store admin' | 'user';

// Product Variant (JSONB in DB, but typed here for app use)
export interface ProductVariant {
    id: string;
    name: string;
    price: number;
    sale_price?: number;
    stock: number;
}

// Product (Aligned with Supabase 'products' table, but with cleaner types for JSON fields)
export interface Product {
    id: string;
    sku?: string | null;
    brand?: string | null;
    title: string;
    price: number;
    sale_price?: number | null;
    discount_percentage?: number | null;
    stock: number;
    category: Category | string; // Allow string to match DB type but prefer union
    description: string | null;
    image_url: string; // Enforced as string locally, though DB allows null
    type: ProductType;
    variants?: ProductVariant[] | null;
    specs?: Record<string, string> | null;
    tags?: string[] | null;
    is_featured?: boolean;
}

export interface Order {
    id: string;
    customerName: string; // Mapped from joined customer data usually
    userId: string;
    items: { productId: string; quantity: number; price: number }[];
    totalAmount: number;
    status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
    date: string;
    platformFee: number;
}

export interface PageSettings {
    template: 'v0' | 'modern';
    showBreadcrumbs: boolean;
    showRelatedProducts: boolean;
    enableZoom: boolean;
    accentColor: string;
}

export interface Customer {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    username?: string;
    role: UserRole;
    isVerified?: boolean;
    address?: string;
    // Metadata fields often stored in a separate profile or metadata column
    phoneNumber?: string;
    bio?: string;
}

// Cart Types
export interface CartItem {
    productId: string;
    variantId?: string;
    quantity: number;
    // Optional expanded data for UI
    product?: Product;
}

export interface CartData {
    userId: string;
    items: CartItem[];
    updatedAt?: string;
}
