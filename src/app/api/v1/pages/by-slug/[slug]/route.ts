import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { pageInputSchema } from "@/lib/blocks";
import { revalidatePage } from "@/lib/revalidate";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json({ page: { ...page, content: JSON.parse(page.content) } });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  const { slug } = await params;
  const existing = await prisma.page.findUnique({ where: { slug } });
  if (!existing) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = pageInputSchema.partial().parse(body);

    const page = await prisma.page.update({
      where: { id: existing.id },
      data: {
        ...(parsed.title !== undefined && { title: parsed.title }),
        ...(parsed.slug !== undefined && { slug: parsed.slug }),
        ...(parsed.content !== undefined && { content: JSON.stringify(parsed.content) }),
        ...(parsed.status !== undefined && { status: parsed.status }),
        ...(parsed.seoTitle !== undefined && { seoTitle: parsed.seoTitle }),
        ...(parsed.seoDescription !== undefined && { seoDescription: parsed.seoDescription }),
        ...(parsed.focusKeyword !== undefined && { focusKeyword: parsed.focusKeyword }),
        ...(parsed.noIndex !== undefined && { noIndex: parsed.noIndex }),
        ...(parsed.canonicalUrl !== undefined && { canonicalUrl: parsed.canonicalUrl }),
        ...(parsed.sortOrder !== undefined && { sortOrder: parsed.sortOrder }),
      },
    });

    revalidatePage(slug);
    if (page.slug !== slug) {
      revalidatePage(page.slug);
    }

    return NextResponse.json({ page: { ...page, content: JSON.parse(page.content) } });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  await prisma.page.delete({ where: { id: page.id } });
  revalidatePage(slug);

  return NextResponse.json({ success: true });
}
