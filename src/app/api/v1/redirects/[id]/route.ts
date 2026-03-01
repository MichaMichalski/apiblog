import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { invalidateRedirectCache } from "@/lib/redirects";

const redirectUpdateSchema = z.object({
  source: z.string().min(1).startsWith("/").optional(),
  destination: z.string().min(1).optional(),
  statusCode: z
    .number()
    .int()
    .refine((c) => c === 301 || c === 302, {
      message: "Status code must be 301 or 302",
    })
    .optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  const redirect = await prisma.redirect.findUnique({ where: { id } });

  if (!redirect) {
    return NextResponse.json({ error: "Redirect not found" }, { status: 404 });
  }

  return NextResponse.json({ redirect });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  const existing = await prisma.redirect.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Redirect not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = redirectUpdateSchema.parse(body);

    if (parsed.source && parsed.source !== existing.source) {
      const conflict = await prisma.redirect.findUnique({
        where: { source: parsed.source },
      });
      if (conflict) {
        return NextResponse.json(
          { error: "A redirect with this source path already exists" },
          { status: 409 }
        );
      }
    }

    const redirect = await prisma.redirect.update({
      where: { id },
      data: {
        ...(parsed.source !== undefined && { source: parsed.source }),
        ...(parsed.destination !== undefined && {
          destination: parsed.destination,
        }),
        ...(parsed.statusCode !== undefined && {
          statusCode: parsed.statusCode,
        }),
        ...(parsed.isActive !== undefined && { isActive: parsed.isActive }),
      },
    });

    invalidateRedirectCache();

    return NextResponse.json({ redirect });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;
  const redirect = await prisma.redirect.findUnique({ where: { id } });
  if (!redirect) {
    return NextResponse.json({ error: "Redirect not found" }, { status: 404 });
  }

  await prisma.redirect.delete({ where: { id } });
  invalidateRedirectCache();

  return NextResponse.json({ success: true });
}
