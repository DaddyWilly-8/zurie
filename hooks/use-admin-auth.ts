"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AuthUser } from "@/types/domain";
import { authService } from "@/services/auth/auth.service";

const PUBLIC_ADMIN_PATHS = new Set([
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
]);

export const useAdminAuth = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const run = async () => {
      const currentUser = await authService.getCurrentUser();

      if (!active) return;
      setUser(currentUser);
      setLoading(false);

      const isPublic = PUBLIC_ADMIN_PATHS.has(pathname);
      if (!currentUser && pathname.startsWith("/admin") && !isPublic) {
        const next = encodeURIComponent(pathname);
        router.replace(`/admin/login?next=${next}`);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  return { user, loading };
};
