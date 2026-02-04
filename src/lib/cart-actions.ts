
'use client';

import { Firestore, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase';

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CartData {
  userId: string;
  items: CartItem[];
  updatedAt: any;
}

const LOCAL_CART_KEY = 'vridhira_local_cart';

export function getLocalCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_CART_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function setLocalCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart-updated'));
}

export async function addToCartAction(db: Firestore, userId: string | null, item: CartItem) {
  if (!userId) {
    const items = getLocalCart();
    const existingIdx = items.findIndex(i => i.productId === item.productId && i.variantId === item.variantId);
    if (existingIdx > -1) {
      items[existingIdx].quantity += item.quantity;
    } else {
      items.push(item);
    }
    setLocalCart(items);
    return;
  }

  const cartRef = doc(db, 'carts', userId);
  const cartSnap = await getDoc(cartRef);

  let items: CartItem[] = [];
  if (cartSnap.exists()) {
    items = (cartSnap.data() as CartData).items || [];
  }

  const existingIdx = items.findIndex(i => i.productId === item.productId && i.variantId === item.variantId);
  if (existingIdx > -1) {
    items[existingIdx].quantity += item.quantity;
  } else {
    items.push(item);
  }

  setDocumentNonBlocking(cartRef, { userId, items, updatedAt: serverTimestamp() }, { merge: true });
}

export async function syncLocalCartToCloud(db: Firestore, userId: string) {
  const localItems = getLocalCart();
  if (localItems.length === 0) return;

  const cartRef = doc(db, 'carts', userId);
  const cartSnap = await getDoc(cartRef);
  let cloudItems: CartItem[] = [];
  
  if (cartSnap.exists()) {
    cloudItems = (cartSnap.data() as CartData).items || [];
  }

  localItems.forEach(localItem => {
    const existingIdx = cloudItems.findIndex(ci => ci.productId === localItem.productId && ci.variantId === localItem.variantId);
    if (existingIdx > -1) {
      cloudItems[existingIdx].quantity += localItem.quantity;
    } else {
      cloudItems.push(localItem);
    }
  });

  setDocumentNonBlocking(cartRef, { userId, items: cloudItems, updatedAt: serverTimestamp() }, { merge: true });
  setLocalCart([]); // Clear local cart after sync
}

export function updateCartItemQuantityAction(db: Firestore, userId: string | null, productId: string, variantId: string | undefined, newQuantity: number) {
  if (!userId) {
    const items = getLocalCart();
    const idx = items.findIndex(i => i.productId === productId && i.variantId === variantId);
    if (idx > -1) {
      if (newQuantity <= 0) items.splice(idx, 1);
      else items[idx].quantity = newQuantity;
      setLocalCart(items);
    }
    return;
  }

  const cartRef = doc(db, 'carts', userId);
  getDoc(cartRef).then(snap => {
    if (!snap.exists()) return;
    const items = (snap.data() as CartData).items;
    const idx = items.findIndex(i => i.productId === productId && i.variantId === variantId);
    if (idx > -1) {
      if (newQuantity <= 0) items.splice(idx, 1);
      else items[idx].quantity = newQuantity;
      setDocumentNonBlocking(cartRef, { items, updatedAt: serverTimestamp() }, { merge: true });
    }
  });
}

export function removeCartItemAction(db: Firestore, userId: string | null, productId: string, variantId?: string) {
  if (!userId) {
    const items = getLocalCart();
    const newItems = items.filter(i => !(i.productId === productId && i.variantId === variantId));
    setLocalCart(newItems);
    return;
  }

  const cartRef = doc(db, 'carts', userId);
  getDoc(cartRef).then(snap => {
    if (!snap.exists()) return;
    const items = (snap.data() as CartData).items;
    const newItems = items.filter(i => !(i.productId === productId && i.variantId === variantId));
    setDocumentNonBlocking(cartRef, { items: newItems, updatedAt: serverTimestamp() }, { merge: true });
  });
}
