"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AuthUser } from "@/types/domain";
import { authService } from "@/services/auth/auth.service";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/forgot-password"]);

type AdminAuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  /** Checks the logged-in user's `permissions` array from GET /auth/user. */
  hasPermission: (key: string) => boolean;
  /** True if the user holds at least one of the given permission keys. */
  hasAnyPermission: (keys: string[]) => boolean;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

/**
 * Fetches the current admin user (and their `permissions`) once and shares
 * it via context, so the nav shell and the route guard both read the same
 * session instead of each calling GET /auth/user separately. This mirrors
 * `providers/settings-provider.tsx`'s "fetch once, expose via context"
 * pattern for app-wide state.
 *
 * `permissions` is display-only, per the API contract — it drives which nav
 * links/buttons render, not what's actually allowed. The backend enforces
 * every permission independently regardless of what this returns.
 */
export const AdminAuthProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname ?? "";
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const run = async () => {
      const currentUser = await authService.getCurrentUser();

      if (!active) return;
      setUser(currentUser);
      setLoading(false);

      const isPublic = PUBLIC_ADMIN_PATHS.has(currentPath);
      if (!currentUser && currentPath.startsWith("/admin") && !isPublic) {
        const next = encodeURIComponent(currentPath);
        router.replace(`/admin/login?next=${next}`);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [currentPath, router]);

  const hasPermission = (key: string) =>
    Boolean(user?.permissions?.includes(key));

  const hasAnyPermission = (keys: string[]) =>
    keys.length === 0 || keys.some((key) => hasPermission(key));

  return (
    <AdminAuthContext.Provider
      value={{ user, loading, hasPermission, hasAnyPermission }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
};
