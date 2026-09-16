"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import type { AuthUser } from "@/types/domain";
import { authService } from "@/services/auth/auth.service";

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
 * to prompt for login, not this provider. Session state is shared with the
 * admin session via the same cookie/GET /auth/user mechanism — a `customer`
 * role user and an `admin` role user are just different rows this same
 * endpoint can resolve to.
 */
export const CustomerAuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void authService.getCurrentUser().then((currentUser) => {
      if (!active) return;
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const login: CustomerAuthContextValue["login"] = async (email, password) => {
    const loggedInUser = await authService.login(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register: CustomerAuthContextValue["register"] = async (payload) => {
    const newUser = await authService.register(payload);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await authService.logout();
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

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return context;
};
