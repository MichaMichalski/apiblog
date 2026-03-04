import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { revalidateAll } from "@/lib/revalidate";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  try {
    revalidateAll();
    return NextResponse.json({
      success: true,
      message: "All pages revalidated",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Revalidation failed" },
      { status: 500 }
    );
  }
}
