
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

export async function addToCartAction(db: Firestore, userId: string, item: CartItem) {
  const cartRef = doc(db, 'carts', userId);
  const cartSnap = await getDoc(cartRef);

  let items: CartItem[] = [];
  if (cartSnap.exists()) {
    const data = cartSnap.data() as CartData;
    items = data.items || [];
  }

  const existingItemIndex = items.findIndex(
    (i) => i.productId === item.productId && i.variantId === item.variantId
  );

  if (existingItemIndex > -1) {
    items[existingItemIndex].quantity += item.quantity;
  } else {
    items.push(item);
  }

  setDocumentNonBlocking(cartRef, {
    userId,
    items,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export function updateCartItemQuantityAction(db: Firestore, userId: string, productId: string, variantId: string | undefined, newQuantity: number) {
  const cartRef = doc(db, 'carts', userId);
  
  getDoc(cartRef).then(snap => {
    if (!snap.exists()) return;
    const items = (snap.data() as CartData).items;
    const idx = items.findIndex(i => i.productId === productId && i.variantId === variantId);
    if (idx > -1) {
      if (newQuantity <= 0) {
        items.splice(idx, 1);
      } else {
        items[idx].quantity = newQuantity;
      }
      setDocumentNonBlocking(cartRef, { items, updatedAt: serverTimestamp() }, { merge: true });
    }
  });
}

export function removeCartItemAction(db: Firestore, userId: string, productId: string, variantId?: string) {
  const cartRef = doc(db, 'carts', userId);
  
  getDoc(cartRef).then(snap => {
    if (!snap.exists()) return;
    const items = (snap.data() as CartData).items;
    const newItems = items.filter(i => !(i.productId === productId && i.variantId === variantId));
    setDocumentNonBlocking(cartRef, { items: newItems, updatedAt: serverTimestamp() }, { merge: true });
  });
}
