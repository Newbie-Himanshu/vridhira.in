import { z } from 'zod';

export const CategorySchema = z.enum(['Pottery', 'Textiles', 'Decor', 'Art', 'Fashion']);

export const ProductTypeSchema = z.enum(['single', 'variable', 'group']);

export const ProductVariantSchema = z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().nonnegative(),
    sale_price: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative(),
});

export const ProductSchema = z.object({
    id: z.string().uuid().optional(), // Optional for creation
    sku: z.string().optional().nullable(),
    brand: z.string().optional().nullable(),
    title: z.string().min(1, "Title is required"),
    price: z.number().nonnegative(),
    sale_price: z.number().nonnegative().optional().nullable(),
    discount_percentage: z.number().min(0).max(100).optional().nullable(),
    stock: z.number().int().nonnegative(),
    category: CategorySchema.or(z.string()), // Allow string fallback but prefer enum
    description: z.string().optional().nullable(),
    image_url: z.string().url(),
    type: ProductTypeSchema,
    variants: z.array(ProductVariantSchema).optional().nullable(),
    specs: z.record(z.string()).optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    is_featured: z.boolean().optional(),
});

export const CartItemSchema = z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().positive(),
});

export const CartDataSchema = z.object({
    userId: z.string(),
    items: z.array(CartItemSchema),
    updatedAt: z.string().optional(),
});

// --- Order & Checkout Schemas ---

export const AddressSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    addressLine1: z.string().min(1, 'Address Line 1 is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().default('India'),
});

export const OrderItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().nonnegative(), // Price at time of purchase (client-side, verified on server)
});

export const CreateOrderSchema = z.object({
    items: z.array(OrderItemSchema).min(1, 'Order must have at least one item'),
    shippingAddress: AddressSchema,
    totalAmount: z.number().nonnegative(),
    paymentMethod: z.enum(['cod', 'razorpay']),
});
