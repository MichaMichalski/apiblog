import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { postInputSchema } from "@/lib/blocks";
import { revalidatePost } from "@/lib/revalidate";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true, email: true } } },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ post: { ...post, content: JSON.parse(post.content) } });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = postInputSchema.partial().parse(body);

    const oldSlug = existing.slug;
    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(parsed.title !== undefined && { title: parsed.title }),
        ...(parsed.slug !== undefined && { slug: parsed.slug }),
        ...(parsed.content !== undefined && { content: JSON.stringify(parsed.content) }),
        ...(parsed.excerpt !== undefined && { excerpt: parsed.excerpt }),
        ...(parsed.status !== undefined && { status: parsed.status }),
        ...(parsed.featuredImage !== undefined && { featuredImage: parsed.featuredImage }),
        ...(parsed.seoTitle !== undefined && { seoTitle: parsed.seoTitle }),
        ...(parsed.seoDescription !== undefined && { seoDescription: parsed.seoDescription }),
        ...(parsed.focusKeyword !== undefined && { focusKeyword: parsed.focusKeyword }),
        ...(parsed.noIndex !== undefined && { noIndex: parsed.noIndex }),
        ...(parsed.canonicalUrl !== undefined && { canonicalUrl: parsed.canonicalUrl }),
        ...(parsed.status === "published" && !existing.publishedAt && {
          publishedAt: parsed.publishedAt ? new Date(parsed.publishedAt) : new Date(),
        }),
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    revalidatePost(oldSlug);
    if (post.slug !== oldSlug) {
      revalidatePost(post.slug);
    }

    return NextResponse.json({ post: { ...post, content: JSON.parse(post.content) } });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await prisma.post.delete({ where: { id } });
  revalidatePost(post.slug);

  return NextResponse.json({ success: true });
}
