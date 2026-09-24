"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import type { AuthUser } from "@/types/domain";
import { customerAuthService } from "@/services/auth/customer-auth.service";
import { accountService } from "@/services/account/account.service";
import { useShopStore } from "@/hooks/use-shop-store";

type CustomerAuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    passwordConfirmation: string;
    phone: string;
    whatsappNumber?: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(
  null,
);

/**
 * Storefront counterpart to AdminAuthProvider — same "fetch the session
 * once, share via context" shape, but deliberately has no route guard: a
 * logged-out visitor can browse every public page freely, and individual
 * features (Wishlist, Reviews, Account) are the ones that decide whether
 * to prompt for login, not this provider.
 *
 * Uses the dedicated 'customer' guard (customerAuthService) — the
 * customer/staff split's fix for a real bug this provider used to have:
 * it previously called the *shared* GET /auth/user endpoint, so a
 * logged-in admin browsing the storefront in the same browser was shown
 * here as if they were a logged-in customer. The 'customer' guard is now
 * independent of 'web' (staff) even though both share one session
 * cookie, so an admin session no longer leaks into this provider at all.
 */
export const CustomerAuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void customerAuthService.getCurrentUser().then((currentUser) => {
      if (!active) return;
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  // Once a customer is signed in, their wishlist lives on the server too:
  // merge what this browser saved while signed out with what their
  // account already has, push the browser-only items up, and keep the
  // union locally. Best-effort — the local wishlist keeps working if the
  // sync fails.
  useEffect(() => {
    if (!user) return;
    let active = true;

    const sync = async () => {
      try {
        const serverIds = (await accountService.getWishlist()).map(String);
        const localIds = useShopStore.getState().wishlist;
        const missingOnServer = localIds.filter(
          (id) => !serverIds.includes(id),
        );
        await Promise.all(
          missingOnServer.map((id) => accountService.addToWishlist(Number(id))),
        );
        if (active) {
          useShopStore
            .getState()
            .setWishlist([...serverIds, ...missingOnServer]);
        }
      } catch {
        // Keep the local wishlist as-is.
      }
    };
    void sync();

    return () => {
      active = false;
    };
  }, [user]);

  const login: CustomerAuthContextValue["login"] = async (email, password) => {
    const loggedInUser = await customerAuthService.login(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register: CustomerAuthContextValue["register"] = async (payload) => {
    const newUser = await customerAuthService.register(payload);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await customerAuthService.logout();
    setUser(null);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

/** Like useCustomerAuth(), but null outside the storefront's provider. */
export const useOptionalCustomerAuth = () => useContext(CustomerAuthContext);

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return context;
};
