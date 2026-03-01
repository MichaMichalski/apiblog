import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { invalidateRedirectCache } from "@/lib/redirects";

const redirectSchema = z.object({
  source: z.string().min(1).startsWith("/"),
  destination: z.string().min(1),
  statusCode: z.number().int().refine((c) => c === 301 || c === 302, {
    message: "Status code must be 301 or 302",
  }),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const [redirects, total] = await Promise.all([
    prisma.redirect.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.redirect.count(),
  ]);

  return NextResponse.json({
    redirects,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await request.json();
    const parsed = redirectSchema.parse(body);

    const existing = await prisma.redirect.findUnique({
      where: { source: parsed.source },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A redirect with this source path already exists" },
        { status: 409 }
      );
    }

    const redirect = await prisma.redirect.create({
      data: {
        source: parsed.source,
        destination: parsed.destination,
        statusCode: parsed.statusCode,
        isActive: parsed.isActive ?? true,
      },
    });

    invalidateRedirectCache();

    return NextResponse.json({ redirect }, { status: 201 });
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
