'use client';

// Types for window.gtag
declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
        dataLayer?: unknown[];
    }
}

/**
 * Send custom event to Google Analytics 4
 */
export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, params);
    }
}

/**
 * Set user properties in GA4
 */
export function setUserProperties(properties: Record<string, unknown>): void {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('set', 'user_properties', properties);
    }
}

// E-commerce event types
interface Product {
    id: string;
    title: string;
    price: number;
    category?: string;
    brand?: string;
}

interface CartItem extends Product {
    quantity: number;
}

interface Cart {
    items: CartItem[];
    total: number;
}

interface Order {
    id: string;
    total: number;
    items: CartItem[];
    shipping?: number;
    tax?: number;
}

/**
 * GA4 E-commerce Events
 * Following Google's recommended e-commerce events
 * @see https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
 */
export const ecommerceEvents = {
    /**
     * When user views a product details page
     */
    viewItem: (product: Product) => {
        trackEvent('view_item', {
            currency: 'INR',
            value: product.price,
            items: [{
                item_id: product.id,
                item_name: product.title,
                price: product.price,
                item_category: product.category,
                item_brand: product.brand || 'Vridhira',
            }],
        });
    },

    /**
     * When user views a list of products (category page, search results)
     */
    viewItemList: (listName: string, products: Product[]) => {
        trackEvent('view_item_list', {
            item_list_id: listName.toLowerCase().replace(/\s+/g, '_'),
            item_list_name: listName,
            items: products.slice(0, 10).map((p, index) => ({
                item_id: p.id,
                item_name: p.title,
                price: p.price,
                item_category: p.category,
                index,
            })),
        });
    },

    /**
     * When user adds item to cart
     */
    addToCart: (product: Product, quantity: number = 1) => {
        trackEvent('add_to_cart', {
            currency: 'INR',
            value: product.price * quantity,
            items: [{
                item_id: product.id,
                item_name: product.title,
                price: product.price,
                quantity,
                item_category: product.category,
            }],
        });
    },

    /**
     * When user removes item from cart
     */
    removeFromCart: (product: Product, quantity: number = 1) => {
        trackEvent('remove_from_cart', {
            currency: 'INR',
            value: product.price * quantity,
            items: [{
                item_id: product.id,
                item_name: product.title,
                price: product.price,
                quantity,
            }],
        });
    },

    /**
     * When user views their cart
     */
    viewCart: (cart: Cart) => {
        trackEvent('view_cart', {
            currency: 'INR',
            value: cart.total,
            items: cart.items.map((item, index) => ({
                item_id: item.id,
                item_name: item.title,
                price: item.price,
                quantity: item.quantity,
                index,
            })),
        });
    },

    /**
     * When user begins checkout process
     */
    beginCheckout: (cart: Cart) => {
        trackEvent('begin_checkout', {
            currency: 'INR',
            value: cart.total,
            items: cart.items.map((item) => ({
                item_id: item.id,
                item_name: item.title,
                price: item.price,
                quantity: item.quantity,
            })),
        });
    },

    /**
     * When user adds shipping information
     */
    addShippingInfo: (cart: Cart, shippingTier?: string) => {
        trackEvent('add_shipping_info', {
            currency: 'INR',
            value: cart.total,
            shipping_tier: shippingTier || 'Standard',
            items: cart.items.map((item) => ({
                item_id: item.id,
                item_name: item.title,
                quantity: item.quantity,
            })),
        });
    },

    /**
     * When user adds payment information
     */
    addPaymentInfo: (cart: Cart, paymentType?: string) => {
        trackEvent('add_payment_info', {
            currency: 'INR',
            value: cart.total,
            payment_type: paymentType || 'Card',
            items: cart.items.map((item) => ({
                item_id: item.id,
                item_name: item.title,
                quantity: item.quantity,
            })),
        });
    },

    /**
     * When order is successfully completed
     */
    purchase: (order: Order) => {
        trackEvent('purchase', {
            transaction_id: order.id,
            currency: 'INR',
            value: order.total,
            shipping: order.shipping || 0,
            tax: order.tax || 0,
            items: order.items.map((item) => ({
                item_id: item.id,
                item_name: item.title,
                price: item.price,
                quantity: item.quantity,
            })),
        });
    },

    /**
     * When user performs a search
     */
    search: (searchTerm: string, resultsCount?: number) => {
        trackEvent('search', {
            search_term: searchTerm,
            results_count: resultsCount,
        });
    },
};

/**
 * Page view tracking (for SPA navigation)
 */
export function trackPageView(path: string, title?: string): void {
    trackEvent('page_view', {
        page_path: path,
        page_title: title || document.title,
    });
}

/**
 * Track user login
 */
export function trackLogin(method: 'google' | 'email'): void {
    trackEvent('login', { method });
}

/**
 * Track user signup
 */
export function trackSignUp(method: 'google' | 'email'): void {
    trackEvent('sign_up', { method });
}
