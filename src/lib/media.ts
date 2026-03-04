import { prisma } from "@/lib/db";
import { getAssetUrl } from "@/lib/cdn";

interface MediaInfo {
  width: number;
  height: number;
  path: string;
  mimeType: string;
}

export type MediaMap = Map<string, MediaInfo>;

function toRelativePath(p: string): string {
  try {
    return new URL(p).pathname;
  } catch {
    return p;
  }
}

export async function getMediaMap(paths: string[]): Promise<MediaMap> {
  const originals = paths.filter(Boolean);
  const normalized = originals.map(toRelativePath);
  const unique = [...new Set(normalized)];
  if (unique.length === 0) return new Map();

  const records = await prisma.media.findMany({
    where: { path: { in: unique } },
    select: { path: true, width: true, height: true, mimeType: true },
  });

  const map: MediaMap = new Map();
  for (const r of records) {
    map.set(r.path, {
      width: r.width,
      height: r.height,
      path: r.path,
      mimeType: r.mimeType,
    });
  }

  for (const op of originals) {
    const np = toRelativePath(op);
    const info = map.get(np);
    if (info && !map.has(op)) {
      map.set(op, info);
    }
  }

  return map;
}

const SVG_GIF = /\.(svg|gif)$/i;

export function getThumbnailPath(src: string): string {
  if (SVG_GIF.test(src)) return getAssetUrl(src);
  const ext = src.match(/\.[^.]+$/)?.[0] ?? "";
  const base = src.slice(0, -ext.length);
  return getAssetUrl(`${base}-thumb.webp`);
}

export function collectImagePaths(
  blocks: { type: string; src?: string }[],
  featuredImage?: string | null
): string[] {
  const paths: string[] = [];
  if (featuredImage) paths.push(featuredImage);
  for (const block of blocks) {
    if (block.type === "image" && block.src) {
      paths.push(block.src);
    }
  }
  return paths;
}
