import type { PropsWithChildren } from "react";
import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminAuthProvider } from "@/providers/admin-auth-provider";

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <AdminAuthProvider>
      <AdminAuthGuard>
        <AdminShell>{children}</AdminShell>
      </AdminAuthGuard>
    </AdminAuthProvider>
  );
}
