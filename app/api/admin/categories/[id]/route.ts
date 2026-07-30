import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/api-auth";
import { deleteCategoryState, updateCategoryState } from "@/lib/local-data";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  const payload = await request.json();
  const { id } = await params;

  const ok = updateCategoryState(id, payload);
  if (!ok)
    return NextResponse.json({ error: "Update failed" }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const ok = deleteCategoryState(id);
  if (!ok)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });

  return NextResponse.json({ success: true });
}
