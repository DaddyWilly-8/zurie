import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";

export const ADMIN_SESSION_COOKIE = "zurie_admin_session";

const ADMIN_USER = {
  id: "local-admin",
  email: env.ADMIN_EMAIL ?? "admin@zurie.local",
};

const isAdminSessionActive = async () => {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === "active";
};

export const validateAdminCredentials = (email: string, password: string) => {
  const adminEmail = env.ADMIN_EMAIL ?? "admin@zurie.local";
  const adminPassword = env.ADMIN_PASSWORD ?? "admin12345";
  return email === adminEmail && password === adminPassword;
};

export const getSessionProfile = async () => {
  const active = await isAdminSessionActive();
  if (!active) {
    return { user: null, role: null as string | null, authenticated: false };
  }
  return { user: ADMIN_USER, role: "admin", authenticated: true };
};

export const requireAdmin = async () => {
  const { user, role, authenticated } = await getSessionProfile();
  if (!authenticated || !user || role !== "admin") {
    redirect("/admin/login");
  }
  return user;
};
