import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { getReadingSettings, saveReadingSettings } from "@/lib/customizer";
import { revalidateAll } from "@/lib/revalidate";

export async function GET() {
  try {
    const settings = await getReadingSettings();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Failed to load reading settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await request.json();

    await saveReadingSettings({
      showFullContent: body.showFullContent ?? false,
      excerptLength: body.excerptLength ?? 55,
      feedPostsCount: body.feedPostsCount ?? 10,
      feedContentType: body.feedContentType ?? "excerpt",
      searchEngineVisibility: body.searchEngineVisibility ?? false,
    });
    revalidateAll();

    return NextResponse.json(await getReadingSettings());
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
