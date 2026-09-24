"use client";

import { useShopStore } from "@/hooks/use-shop-store";
import { useOptionalCustomerAuth } from "@/providers/customer-auth-provider";
import { accountService } from "@/services/account/account.service";

/**
 * The storefront wishlist: always kept in this browser, and — when a
 * customer is signed in — saved to their account as well, so it follows
 * them across devices (CustomerAuthProvider merges the two on sign-in).
 */
export const useWishlist = () => {
  const auth = useOptionalCustomerAuth();
  const wishlist = useShopStore((state) => state.wishlist);
  const toggleLocal = useShopStore((state) => state.toggleWishlist);

  const toggle = (productId: string) => {
    const adding = !useShopStore.getState().wishlist.includes(productId);
    toggleLocal(productId);

    if (auth?.isAuthenticated) {
      const request = adding
        ? accountService.addToWishlist(Number(productId))
        : accountService.removeFromWishlist(Number(productId));
      // Undo the local change if the account couldn't be updated.
      void request.catch(() => toggleLocal(productId));
    }
  };

  return {
    wishlist,
    toggle,
    has: (productId: string) => wishlist.includes(productId),
  };
};
