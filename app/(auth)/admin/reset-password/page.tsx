"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams();
    const token = searchParams?.get("token") ?? "";
    const email = searchParams?.get("email") ?? "";

    if (token) {
      params.set("token", token);
    }

    if (email) {
      params.set("email", email);
    }

    const query = params.toString();
    router.replace(query ? `/reset-password?${query}` : "/reset-password");
  }, [router, searchParams]);

  return null;
}