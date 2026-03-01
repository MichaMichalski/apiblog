const CDN_BASE = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/+$/, "") || "";

export function getAssetUrl(path: string): string {
  if (!path || !CDN_BASE || path.startsWith("http")) return path;
  return `${CDN_BASE}${path}`;
}
