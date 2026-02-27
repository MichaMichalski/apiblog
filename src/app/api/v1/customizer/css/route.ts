import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { getCustomCSS, saveCustomCSS } from "@/lib/customizer";
import { revalidateAll } from "@/lib/revalidate";

export async function GET() {
  try {
    const data = await getCustomCSS();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to load custom CSS" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await request.json();

    if (typeof body.css !== "string") {
      return NextResponse.json({ error: "css must be a string" }, { status: 400 });
    }

    await saveCustomCSS({ css: body.css });
    revalidateAll();

    return NextResponse.json({ css: body.css });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
