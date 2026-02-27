import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { getBlogLayout, saveBlogLayout } from "@/lib/customizer";
import { revalidateAll } from "@/lib/revalidate";

export async function GET() {
  try {
    const layout = await getBlogLayout();
    return NextResponse.json(layout);
  } catch {
    return NextResponse.json({ error: "Failed to load blog layout" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await request.json();

    await saveBlogLayout({
      layout: body.layout ?? "grid",
      columns: body.columns ?? 3,
      showFeaturedImage: body.showFeaturedImage ?? true,
      showExcerpt: body.showExcerpt ?? true,
      showAuthor: body.showAuthor ?? true,
      showDate: body.showDate ?? true,
      showReadMore: body.showReadMore ?? true,
      excerptLength: body.excerptLength ?? 150,
      readMoreText: body.readMoreText ?? "Weiterlesen",
      pagination: body.pagination ?? "numbered",
      postsPerPage: body.postsPerPage ?? 10,
      sidebarEnabled: body.sidebarEnabled ?? false,
      sidebarPosition: body.sidebarPosition ?? "right",
    });
    revalidateAll();

    return NextResponse.json(await getBlogLayout());
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
