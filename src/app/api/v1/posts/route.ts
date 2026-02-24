import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { postInputSchema } from "@/lib/blocks";
import { revalidatePost } from "@/lib/revalidate";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const status = url.searchParams.get("status");

  const where = status ? { status } : {};
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { author: { select: { id: true, name: true, email: true } } },
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({
    posts: posts.map((p) => ({ ...p, content: JSON.parse(p.content) })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await request.json();
    const parsed = postInputSchema.parse(body);

    const existing = await prisma.post.findUnique({ where: { slug: parsed.slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    let authorId = auth.userId!;
    if (authorId === "api") {
      const firstUser = await prisma.user.findFirst();
      if (!firstUser) {
        return NextResponse.json({ error: "No users exist. Create a user first." }, { status: 400 });
      }
      authorId = firstUser.id;
    }

    const post = await prisma.post.create({
      data: {
        title: parsed.title,
        slug: parsed.slug,
        content: JSON.stringify(parsed.content),
        excerpt: parsed.excerpt,
        status: parsed.status,
        featuredImage: parsed.featuredImage ?? null,
        seoTitle: parsed.seoTitle ?? null,
        seoDescription: parsed.seoDescription ?? null,
        focusKeyword: parsed.focusKeyword ?? null,
        noIndex: parsed.noIndex,
        canonicalUrl: parsed.canonicalUrl ?? null,
        publishedAt: parsed.status === "published" ? (parsed.publishedAt ? new Date(parsed.publishedAt) : new Date()) : null,
        authorId,
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    if (post.status === "published") {
      revalidatePost(post.slug);
    }

    return NextResponse.json({ post: { ...post, content: JSON.parse(post.content) } }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
