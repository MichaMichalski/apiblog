import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join, extname } from "path";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "");
  if (!safeName || safeName.includes("..")) {
    return new NextResponse(null, { status: 400 });
  }

  const filepath = join(process.cwd(), "uploads", safeName);

  try {
    const fileStat = await stat(filepath);
    if (!fileStat.isFile()) {
      return new NextResponse(null, { status: 404 });
    }

    const buffer = await readFile(filepath);
    const ext = extname(safeName).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileStat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
