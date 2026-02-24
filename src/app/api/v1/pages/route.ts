import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { pageInputSchema } from "@/lib/blocks";
import { revalidatePage } from "@/lib/revalidate";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  const where = status ? { status } : {};
  const pages = await prisma.page.findMany({
    where,
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({
    pages: pages.map((p) => ({ ...p, content: JSON.parse(p.content) })),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await request.json();
    const parsed = pageInputSchema.parse(body);

    const existing = await prisma.page.findUnique({ where: { slug: parsed.slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    const page = await prisma.page.create({
      data: {
        title: parsed.title,
        slug: parsed.slug,
        content: JSON.stringify(parsed.content),
        status: parsed.status,
        seoTitle: parsed.seoTitle ?? null,
        seoDescription: parsed.seoDescription ?? null,
        focusKeyword: parsed.focusKeyword ?? null,
        noIndex: parsed.noIndex,
        canonicalUrl: parsed.canonicalUrl ?? null,
        sortOrder: parsed.sortOrder,
      },
    });

    if (page.status === "published") {
      revalidatePage(page.slug);
    }

    return NextResponse.json({ page: { ...page, content: JSON.parse(page.content) } }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
