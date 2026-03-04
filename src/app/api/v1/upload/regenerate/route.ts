import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { generateVariants, writeVariants } from "@/lib/image-processing";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  const body = await request.json().catch(() => ({}));
  const onlyMissing = body.onlyMissing !== false;

  const where = onlyMissing ? { width: 0 } : {};
  const media = await prisma.media.findMany({ where });

  if (media.length === 0) {
    return NextResponse.json({ message: "No media to regenerate", processed: 0 });
  }

  const uploadDir = join(process.cwd(), "uploads");
  const results: { id: string; filename: string; status: string; width?: number; height?: number }[] = [];

  for (const item of media) {
    try {
      const filepath = join(uploadDir, item.filename);
      const buffer = await readFile(filepath);
      const { files, width, height } = await generateVariants(buffer, item.filename, item.mimeType);
      await writeVariants(uploadDir, files);

      if (width > 0 && height > 0) {
        await prisma.media.update({
          where: { id: item.id },
          data: { width, height },
        });
      }

      results.push({
        id: item.id,
        filename: item.filename,
        status: "ok",
        width,
        height,
      });
    } catch (err) {
      results.push({
        id: item.id,
        filename: item.filename,
        status: `error: ${err instanceof Error ? err.message : "unknown"}`,
      });
    }
  }

  const succeeded = results.filter((r) => r.status === "ok").length;
  return NextResponse.json({
    message: `Regenerated ${succeeded}/${media.length} media items`,
    processed: media.length,
    succeeded,
    results,
  });
}
