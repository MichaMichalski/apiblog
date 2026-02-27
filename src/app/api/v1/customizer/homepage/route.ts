import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { getHomepageSettings, saveHomepageSettings } from "@/lib/customizer";
import { revalidateAll } from "@/lib/revalidate";

export async function GET() {
  try {
    const settings = await getHomepageSettings();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Failed to load homepage settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await request.json();

    if (!body.type || !["posts", "page"].includes(body.type)) {
      return NextResponse.json({ error: "type must be 'posts' or 'page'" }, { status: 400 });
    }

    const settings = {
      type: body.type,
      staticPageId: body.staticPageId ?? null,
      blogPageId: body.blogPageId ?? null,
    };

    await saveHomepageSettings(settings);
    revalidateAll();

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
