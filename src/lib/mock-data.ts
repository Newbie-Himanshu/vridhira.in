export type Category = 'Pottery' | 'Textiles' | 'Decor' | 'Art' | 'Fashion';
export type ProductType = 'single' | 'variable' | 'group';
export type UserRole = 'owner' | 'store admin' | 'user';

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  sku?: string;
  brand?: string;
  title: string;
  price: number;
  stock: number;
  category: Category;
  description: string;
  imageUrl: string;
  type: ProductType;
  variants?: ProductVariant[];
  relatedProducts?: string[];
  specs?: Record<string, string>;
  tags?: string[];
}

export interface Order {
  id: string;
  customerName: string;
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
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  bio?: string;
  address?: string;
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
  role: UserRole;
  isVerified?: boolean;
  failedAttempts?: number;
  banUntil?: string;
}

export const CATEGORIES: Category[] = ['Pottery', 'Textiles', 'Decor', 'Art', 'Fashion'];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    sku: 'VRD-POT-001',
    brand: 'Vridhira Heritage',
    title: 'Terracotta Hand-Painted Pot',
    price: 45.0,
    stock: 12,
    category: 'Pottery',
    description: 'Beautiful hand-painted pot using traditional earthy pigments. Perfect for indoor decor.',
    imageUrl: 'https://picsum.photos/seed/pot1/600/400',
    type: 'single',
    specs: { Material: 'Clay', Origin: 'Rajasthan', Weight: '1.2kg' },
    tags: ['handmade', 'clay', 'decor']
  },
  {
    id: '2',
    sku: 'VRD-TEX-002',
    brand: 'Kashi Weavers',
    title: 'Banarasi Silk Saree',
    price: 250.0,
    stock: 5,
    category: 'Textiles',
    description: 'A masterpiece of Banarasi weaving, featuring pure silk and intricate zari work.',
    imageUrl: 'https://picsum.photos/seed/saree1/600/400',
    type: 'variable',
    variants: [
      { id: 'v1', name: 'Crimson Red', price: 250, stock: 2 },
      { id: 'v2', name: 'Midnight Blue', price: 275, stock: 3 }
    ],
    specs: { Fabric: '100% Silk', Care: 'Dry Clean Only' },
    tags: ['silk', 'luxury', 'traditional']
  },
  {
    id: '3',
    sku: 'VRD-DEC-003',
    brand: 'Mysore Crafts',
    title: 'Sandalwood Elephant Figurine',
    price: 85.0,
    stock: 8,
    category: 'Decor',
    description: 'Hand-carved sandalwood elephant representing wisdom and strength.',
    imageUrl: 'https://picsum.photos/seed/elephant1/600/400',
    type: 'single',
    specs: { Material: 'Sandalwood', Origin: 'Karnataka' }
  },
  {
    id: '4',
    sku: 'VRD-DEC-004',
    brand: 'Vridhira Heritage',
    title: 'Peacock Brass Diya Set',
    price: 32.0,
    stock: 25,
    category: 'Decor',
    description: 'Traditional solid brass lamp with a majestic peacock motif. Sold as a set of two.',
    imageUrl: 'https://picsum.photos/seed/lamp1/600/400',
    type: 'group',
    specs: { Material: 'Brass', Count: 'Set of 2' }
  },
  {
    id: '5',
    sku: 'VRD-ART-005',
    brand: 'Bihar Artisans',
    title: 'Madhubani Canvas Art',
    price: 120.0,
    stock: 3,
    category: 'Art',
    description: 'Authentic Madhubani folk art on stretched canvas, signed by the artist.',
    imageUrl: 'https://picsum.photos/seed/mural1/600/400',
    type: 'single',
    specs: { Technique: 'Madhubani', Surface: 'Canvas' }
  },
  {
    id: '6',
    sku: 'VRD-FAS-006',
    brand: 'Punjab Leather',
    title: 'Embroidered Leather Juttis',
    price: 55.0,
    stock: 15,
    category: 'Fashion',
    description: 'Comfortable hand-stitched leather footwear with colorful Zardosi embroidery.',
    imageUrl: 'https://picsum.photos/seed/shoes1/600/400',
    type: 'variable',
    variants: [
      { id: 's1', name: 'UK 7', price: 55, stock: 5 },
      { id: 's2', name: 'UK 8', price: 55, stock: 10 }
    ],
    specs: { Material: 'Leather', Embroidery: 'Zardosi' }
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Aarav Sharma',
    userId: 'mock-user-1',
    items: [{ productId: '1', quantity: 2, price: 45.0 }],
    totalAmount: 90.0,
    status: 'Delivered',
    date: '2024-05-10',
    platformFee: 9.0
  },
  {
    id: 'ORD-002',
    customerName: 'Ananya Iyer',
    userId: 'mock-user-2',
    items: [{ productId: '2', quantity: 1, price: 250.0 }],
    totalAmount: 250.0,
    status: 'Shipped',
    date: '2024-05-12',
    platformFee: 25.0
  },
  {
    id: 'ORD-003',
    customerName: 'Kabir Das',
    userId: 'mock-user-3',
    items: [{ productId: '4', quantity: 3, price: 32.0 }],
    totalAmount: 96.0,
    status: 'Pending',
    date: '2024-05-14',
    platformFee: 9.6
  }
];