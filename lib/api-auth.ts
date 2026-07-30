import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth";

export const assertAdmin = async () => {
  const { user, role } = await getSessionProfile();

  if (!user || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
};
