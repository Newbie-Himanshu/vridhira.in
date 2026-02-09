'use client';

import { SupabaseClient } from '@supabase/supabase-js';
import { CartItem, CartData } from '@/types/index';

const LOCAL_CART_KEY = 'vridhira_local_cart';

export function getLocalCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_CART_KEY);
  try {
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('[getLocalCart] Failed to parse local cart:', e);
    return [];
  }
}

export function setLocalCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('cart-updated'));
  } catch (e) {
    console.error('[setLocalCart] Failed to save local cart:', e);
  }
}

export async function addToCartAction(supabase: SupabaseClient, userId: string | null, item: CartItem) {
  try {
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

    const { data: cartData, error: fetchError } = await supabase
      .from('carts')
      .select('items')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "Row not found"
      console.error('[addToCartAction] Error fetching cart:', fetchError);
      throw new Error(fetchError.message);
    }

    let items: CartItem[] = [];
    if (cartData && cartData.items) {
      // Validate that items is an array before casting
      if (Array.isArray(cartData.items)) {
        items = cartData.items as unknown as CartItem[];
      }
    }

    const existingIdx = items.findIndex(i => i.productId === item.productId && i.variantId === item.variantId);
    if (existingIdx > -1) {
      items[existingIdx].quantity += item.quantity;
    } else {
      items.push(item);
    }

    const { error: upsertError } = await supabase
      .from('carts')
      .upsert({
        user_id: userId,
        items: items as unknown as any, // Supabase expects JSON, we give it typed object
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('[addToCartAction] Error saving cart:', upsertError);
      throw new Error(upsertError.message);
    }

  } catch (error) {
    console.error('[addToCartAction] Unexpected error:', error);
    throw error;
  }
}

export async function syncLocalCartToCloud(supabase: SupabaseClient, userId: string) {
  try {
    const localItems = getLocalCart();
    if (localItems.length === 0) return;

    const { data: cartData, error: fetchError } = await supabase
      .from('carts')
      .select('items')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[syncLocalCartToCloud] Error fetching cart:', fetchError);
      return; // Don't throw here to avoid blocking login flow
    }

    let cloudItems: CartItem[] = [];

    if (cartData && Array.isArray(cartData.items)) {
      cloudItems = cartData.items as unknown as CartItem[];
    }

    localItems.forEach(localItem => {
      const existingIdx = cloudItems.findIndex(ci => ci.productId === localItem.productId && ci.variantId === localItem.variantId);
      if (existingIdx > -1) {
        cloudItems[existingIdx].quantity += localItem.quantity;
      } else {
        cloudItems.push(localItem);
      }
    });

    const { error: upsertError } = await supabase
      .from('carts')
      .upsert({
        user_id: userId,
        items: cloudItems as unknown as any,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('[syncLocalCartToCloud] Error syncing cart:', upsertError);
    } else {
      setLocalCart([]); // Clear local cart after sync only on success
    }

  } catch (error) {
    console.error('[syncLocalCartToCloud] Unexpected error:', error);
  }
}

export async function updateCartItemQuantityAction(supabase: SupabaseClient, userId: string | null, productId: string, variantId: string | undefined, newQuantity: number) {
  try {
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

    const { data: cartData, error: fetchError } = await supabase
      .from('carts')
      .select('items')
      .eq('user_id', userId)
      .single();

    if (fetchError || !cartData) return;

    let items: CartItem[] = [];
    if (Array.isArray(cartData.items)) {
      items = cartData.items as unknown as CartItem[];
    }

    const idx = items.findIndex((i: CartItem) => i.productId === productId && i.variantId === variantId);

    if (idx > -1) {
      if (newQuantity <= 0) items.splice(idx, 1);
      else items[idx].quantity = newQuantity;

      const { error: updateError } = await supabase
        .from('carts')
        .update({
          items: items as unknown as any,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('[updateCartItemQuantityAction] Error updating cart:', updateError);
        throw new Error(updateError.message);
      }
    }
  } catch (error) {
    console.error('[updateCartItemQuantityAction] Unexpected error:', error);
  }
}

export async function removeCartItemAction(supabase: SupabaseClient, userId: string | null, productId: string, variantId?: string) {
  try {
    if (!userId) {
      const items = getLocalCart();
      const newItems = items.filter(i => !(i.productId === productId && i.variantId === variantId));
      setLocalCart(newItems);
      return;
    }

    const { data: cartData, error: fetchError } = await supabase
      .from('carts')
      .select('items')
      .eq('user_id', userId)
      .single();

    if (fetchError || !cartData) return;

    let items: CartItem[] = [];
    if (Array.isArray(cartData.items)) {
      items = cartData.items as unknown as CartItem[];
    }

    const newItems = items.filter((i: CartItem) => !(i.productId === productId && i.variantId === variantId));

    const { error: updateError } = await supabase
      .from('carts')
      .update({
        items: newItems as unknown as any,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('[removeCartItemAction] Error updating cart:', updateError);
      throw new Error(updateError.message);
    }

  } catch (error) {
    console.error('[removeCartItemAction] Unexpected error:', error);
  }
}
