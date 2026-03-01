import { prisma } from "@/lib/db";
import { getAssetUrl } from "@/lib/cdn";

interface MediaInfo {
  width: number;
  height: number;
  path: string;
  mimeType: string;
}

export type MediaMap = Map<string, MediaInfo>;

export async function getMediaMap(paths: string[]): Promise<MediaMap> {
  const unique = [...new Set(paths.filter(Boolean))];
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
