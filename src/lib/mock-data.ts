
export type Category = 'Pottery' | 'Textiles' | 'Decor' | 'Art' | 'Fashion';

export interface Product {
  id: string;
  title: string;
  price: number;
  stock: number;
  category: Category;
  description: string;
  imageUrl: string;
}

export interface Order {
  id: string;
  customerName: string;
  items: { productId: string; quantity: number; price: number }[];
  totalAmount: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  platformFee: number;
}

export const CATEGORIES: Category[] = ['Pottery', 'Textiles', 'Decor', 'Art', 'Fashion'];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Terracotta Hand-Painted Pot',
    price: 45.0,
    stock: 12,
    category: 'Pottery',
    description: 'Beautiful hand-painted pot using traditional earthy pigments. Perfect for indoor decor.',
    imageUrl: 'https://picsum.photos/seed/pot1/600/400'
  },
  {
    id: '2',
    title: 'Banarasi Silk Saree - Crimson',
    price: 250.0,
    stock: 5,
    category: 'Textiles',
    description: 'A masterpiece of Banarasi weaving, featuring pure silk and intricate zari work.',
    imageUrl: 'https://picsum.photos/seed/saree1/600/400'
  },
  {
    id: '3',
    title: 'Sandalwood Elephant Figurine',
    price: 85.0,
    stock: 8,
    category: 'Decor',
    description: 'Hand-carved sandalwood elephant representing wisdom and strength.',
    imageUrl: 'https://picsum.photos/seed/elephant1/600/400'
  },
  {
    id: '4',
    title: 'Peacock Brass Diya',
    price: 32.0,
    stock: 25,
    category: 'Decor',
    description: 'Traditional solid brass lamp with a majestic peacock motif.',
    imageUrl: 'https://picsum.photos/seed/lamp1/600/400'
  },
  {
    id: '5',
    title: 'Madhubani Canvas Art',
    price: 120.0,
    stock: 3,
    category: 'Art',
    description: 'Authentic Madhubani folk art on stretched canvas, signed by the artist.',
    imageUrl: 'https://picsum.photos/seed/mural1/600/400'
  },
  {
    id: '6',
    title: 'Embroidered Leather Juttis',
    price: 55.0,
    stock: 15,
    category: 'Fashion',
    description: 'Comfortable hand-stitched leather footwear with colorful Zardosi embroidery.',
    imageUrl: 'https://picsum.photos/seed/shoes1/600/400'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Aarav Sharma',
    items: [{ productId: '1', quantity: 2, price: 45.0 }],
    totalAmount: 90.0,
    status: 'Delivered',
    date: '2024-05-10',
    platformFee: 9.0
  },
  {
    id: 'ORD-002',
    customerName: 'Ananya Iyer',
    items: [{ productId: '2', quantity: 1, price: 250.0 }],
    totalAmount: 250.0,
    status: 'Shipped',
    date: '2024-05-12',
    platformFee: 25.0
  },
  {
    id: 'ORD-003',
    customerName: 'Kabir Das',
    items: [{ productId: '4', quantity: 3, price: 32.0 }],
    totalAmount: 96.0,
    status: 'Pending',
    date: '2024-05-14',
    platformFee: 9.6
  }
];
