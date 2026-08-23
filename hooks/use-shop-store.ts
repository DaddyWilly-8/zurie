"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, Product } from "@/types/product";

type ShopState = {
  cart: CartItem[];
  wishlist: string[];
  recentlyViewed: string[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  addRecentlyViewed: (productId: string) => void;
};

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      recentlyViewed: [],
      addToCart: (product, quantity = 1) =>
        set((state) => {
          const existing = state.cart.find(
            (item) => item.productId === product.id,
          );
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }
          return {
            cart: [...state.cart, { productId: product.id, product, quantity }],
          };
        }),
      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.productId !== productId),
        })),
      updateCartQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.max(1, quantity) }
              : item,
          ),
        })),
      clearCart: () => set({ cart: [] }),
      toggleWishlist: (productId) =>
        set((state) => {
          const hasItem = state.wishlist.includes(productId);
          return {
            wishlist: hasItem
              ? state.wishlist.filter((id) => id !== productId)
              : [...state.wishlist, productId],
          };
        }),
      addRecentlyViewed: (productId) =>
        set((state) => {
          const unique = [
            productId,
            ...state.recentlyViewed.filter((id) => id !== productId),
          ];
          return { recentlyViewed: unique.slice(0, 8) };
        }),
    }),
    {
      name: "zurie-shop-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
